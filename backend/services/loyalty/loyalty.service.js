import crypto from "crypto";
import mongoose from "mongoose";
import LoyaltyProgram from "../../modules/loyalty/models/loyaltyProgram.model.js";
import LoyaltyAccount from "../../modules/loyalty/models/loyaltyAccount.model.js";
import LoyaltyTransaction from "../../modules/loyalty/models/loyaltyTransaction.model.js";
import LoyaltyRedemption from "../../modules/loyalty/models/loyaltyRedemption.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import User from "../../modules/auth/models/auth.model.js";
import { ApiError } from "../../exceptions/ApiError.js";
import logger from "../../logs/logger.js";
import { createNotification } from "../notification.service.js";

const DAY = 86400000;
export const SELLER_MAX_ADJUST = 10000;

const notify = (recipient, type, title, message) =>
  createNotification({
    recipient,
    type,
    title,
    message,
    link: "/buyer/loyalty",
  }).catch(() => {});
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const paging = ({ page = 1, limit = 20 } = {}) => {
  const safeLimit = Math.min(Number(limit) || 20, 100);
  const currentPage = Math.max(Number(page) || 1, 1);
  return { safeLimit, currentPage, skip: (currentPage - 1) * safeLimit };
};

// Pure - integer maths on paise to avoid float drift
export const calculatePoints = (program, amount) => {
  if (!program?.enabled || !(amount > 0)) return 0;
  const units = Math.floor(
    Math.round(amount * 100) / Math.round(program.spendAmount * 100),
  );
  return units * program.pointsPerUnit;
};

// ownership-over-role, same pattern as staff/khata. Admin may view/adjust.
async function assertShopAccess(shopId, user, { allowAdmin = true } = {}) {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, "Shop not found");
  const isOwner = String(shop.owner) === String(user._id);
  if (!isOwner && !(allowAdmin && user.role === "admin")) {
    throw new ApiError(403, "Not authorized for this shop");
  }
  return shop;
}

const toPublicProgram = (p) =>
  p && {
    enabled: p.enabled,
    pointsPerUnit: p.pointsPerUnit,
    spendAmount: p.spendAmount,
    minRedeemPoints: p.minRedeemPoints,
    rewardValue: p.rewardValue,
    expiryDays: p.expiryDays ?? null,
  };

const emptyProgram = {
  enabled: false,
  pointsPerUnit: 1,
  spendAmount: 100,
  minRedeemPoints: 100,
  rewardValue: 50,
  expiryDays: null,
};

async function getOrCreateAccount(shopId, buyerId) {
  const run = () =>
    LoyaltyAccount.findOneAndUpdate(
      { shop: shopId, buyer: buyerId },
      { $setOnInsert: { shop: shopId, buyer: buyerId } },
      { new: true, upsert: true },
    );
  try {
    return await run();
  } catch (e) {
    if (e.code === 11000) return run(); // lost an upsert race
    throw e;
  }
}

/**
 * Core ledger writer - the ONLY place balances change (except redeem's
 * guarded decrement, which also goes through here).
 * - dedupeKey given: the tx row is inserted first, so a duplicate is
 *   rejected by the unique index BEFORE any balance moves (returns null).
 * - guard: a negative move only applies if balance >= amount.
 */
async function writeEntry({
  account,
  type,
  points,
  guard = false,
  dedupeKey,
  ...rest
}) {
  const base = {
    account: account._id,
    shop: account.shop,
    buyer: account.buyer,
    type,
    points,
    dedupeKey,
    ...rest,
  };
  const inc = { balance: points };
  if (type === "redeem") inc.totalRedeemed = -points;
  else if (type === "expire") inc.totalExpired = -points;
  else inc.totalEarned = points;

  const filter = { _id: account._id };
  if (guard && points < 0) filter.balance = { $gte: -points };

  let tx;
  if (dedupeKey) {
    try {
      tx = await LoyaltyTransaction.create({ ...base, balanceAfter: 0 });
    } catch (e) {
      if (e.code === 11000) return null;
      throw e;
    }
  }
  const updated = await LoyaltyAccount.findOneAndUpdate(
    filter,
    { $inc: inc },
    { new: true },
  );
  if (!updated) {
    if (tx) await tx.deleteOne();
    throw new ApiError(400, "Insufficient points");
  }
  if (tx) {
    tx.balanceAfter = updated.balance;
    await tx.save();
  } else {
    tx = await LoyaltyTransaction.create({
      ...base,
      balanceAfter: updated.balance,
    });
  }
  return tx;
}

// Spend oldest lots first (keeps expiry bookkeeping correct)
async function consumeLots(accountId, points, { order } = {}) {
  let need = points;
  const filter = { account: accountId, remaining: { $gt: 0 } };
  if (order) filter.order = order;
  const lots = await LoyaltyTransaction.find(filter).sort({ createdAt: 1 });
  for (const lot of lots) {
    if (need <= 0) break;
    const take = Math.min(lot.remaining, need);
    const ok = await LoyaltyTransaction.findOneAndUpdate(
      { _id: lot._id, remaining: { $gte: take } },
      { $inc: { remaining: -take } },
    );
    if (ok) need -= take;
  }
}

// Lazy expiry: writes an "expire" ledger row per lapsed lot
async function expireDueLots(account) {
  const lots = await LoyaltyTransaction.find({
    account: account._id,
    remaining: { $gt: 0 },
    expiresAt: { $ne: null, $lte: new Date() },
  });
  for (const lot of lots) {
    const claimed = await LoyaltyTransaction.findOneAndUpdate(
      { _id: lot._id, remaining: { $gt: 0 } },
      { remaining: 0 },
      { new: false },
    );
    if (!claimed) continue;
    await writeEntry({
      account,
      type: "expire",
      points: -claimed.remaining,
      order: claimed.order,
      note: "Points expired",
    });
  }
}

/* ============================ ORDER INTEGRATION ============================ */

export async function earnForOrder(order) {
  if (order.orderStatus !== "delivered" || order.paymentStatus === "refunded")
    return null;
  const program = await LoyaltyProgram.findOne({ shop: order.shop });
  const points = calculatePoints(program, order.itemsSubtotal);
  if (points <= 0) return null;
  if (await LoyaltyTransaction.exists({ dedupeKey: `reversal:${order._id}` }))
    return null;

  const account = await getOrCreateAccount(order.shop, order.buyer);
  const expiresAt = program.expiryDays
    ? new Date(Date.now() + program.expiryDays * DAY)
    : null;
  const tx = await writeEntry({
    account,
    type: "earn",
    points,
    order: order._id,
    orderAmount: order.itemsSubtotal,
    remaining: points,
    expiresAt,
    dedupeKey: `earn:${order._id}`,
    note: `Order #${String(order._id).slice(-8).toUpperCase()}`,
  });
  if (tx)
    await notify(
      order.buyer,
      "loyalty_earned",
      "Points earned",
      `You earned ${points} loyalty points.`,
    );
  return tx;
}

export async function reverseForOrder(order) {
  const earn = await LoyaltyTransaction.findOne({
    dedupeKey: `earn:${order._id}`,
  });
  if (!earn) return null;
  const account = await LoyaltyAccount.findById(earn.account);
  const tx = await writeEntry({
    account,
    type: "reversal",
    points: -earn.points,
    order: order._id,
    dedupeKey: `reversal:${order._id}`,
    note:
      order.paymentStatus === "refunded" ? "Order refunded" : "Order cancelled",
  });
  if (tx) {
    await consumeLots(account._id, earn.points, { order: order._id });
    await notify(
      order.buyer,
      "loyalty_reversed",
      "Points reversed",
      `${earn.points} points were reversed for a cancelled/refunded order.`,
    );
  }
  return tx;
}

// Single idempotent entry point. Never throws - loyalty must not break orders.
export async function syncLoyaltyForOrder(order) {
  try {
    if (order.orderStatus === "cancelled" || order.paymentStatus === "refunded")
      return await reverseForOrder(order);
    if (order.orderStatus === "delivered") return await earnForOrder(order);
  } catch (err) {
    logger.error("Loyalty sync failed", {
      orderId: String(order._id),
      stack: err.stack,
    });
  }
  return null;
}

/* ================================ SELLER ================================ */

export async function getProgram(shopId, user) {
  await assertShopAccess(shopId, user);
  const p = await LoyaltyProgram.findOne({ shop: shopId });
  return toPublicProgram(p) ?? emptyProgram;
}

export async function saveProgram(shopId, user, data) {
  await assertShopAccess(shopId, user, { allowAdmin: false }); // owner only
  const p = await LoyaltyProgram.findOneAndUpdate(
    { shop: shopId },
    {
      $set: { ...data, expiryDays: data.expiryDays ?? null },
      $setOnInsert: { shop: shopId },
    },
    { new: true, upsert: true, runValidators: true },
  );
  return toPublicProgram(p);
}

export async function getPublicProgram(shopId) {
  const shop = await Shop.findOne({ _id: shopId, isActive: true });
  if (!shop) throw new ApiError(404, "Shop not found");
  const p = await LoyaltyProgram.findOne({ shop: shopId, enabled: true });
  return toPublicProgram(p);
}

export async function listShopCustomers(shopId, user, query = {}) {
  await assertShopAccess(shopId, user);
  const { safeLimit, currentPage, skip } = paging(query);
  const filter = { shop: shopId };
  if (query.search?.trim()) {
    const rx = new RegExp(escapeRegex(query.search.trim()), "i");
    const users = await User.find({ $or: [{ name: rx }, { email: rx }] })
      .select("_id")
      .limit(500);
    filter.buyer = { $in: users.map((u) => u._id) };
  }
  const sortBy = {
    balance: { balance: -1 },
    earned: { totalEarned: -1 },
    redeemed: { totalRedeemed: -1 },
    recent: { updatedAt: -1 },
  }[query.sort] || { updatedAt: -1 };

  const [items, total, agg] = await Promise.all([
    LoyaltyAccount.find(filter)
      .populate("buyer", "name email")
      .sort(sortBy)
      .skip(skip)
      .limit(safeLimit),
    LoyaltyAccount.countDocuments(filter),
    LoyaltyAccount.aggregate([
      { $match: { shop: new mongoose.Types.ObjectId(String(shopId)) } },
      {
        $group: {
          _id: null,
          customers: { $sum: 1 },
          outstanding: { $sum: { $max: ["$balance", 0] } },
          redeemed: { $sum: "$totalRedeemed" },
        },
      },
    ]),
  ]);
  const s = agg[0] || {};
  return {
    items,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
    summary: {
      customers: s.customers || 0,
      outstandingPoints: s.outstanding || 0,
      totalRedeemed: s.redeemed || 0,
    },
  };
}

export async function getTopCustomers(shopId, user, { limit = 10 } = {}) {
  await assertShopAccess(shopId, user);
  return LoyaltyAccount.find({ shop: shopId, totalEarned: { $gt: 0 } })
    .populate("buyer", "name email")
    .sort({ totalEarned: -1, balance: -1 })
    .limit(Math.min(Number(limit) || 10, 50));
}

export async function getCustomerTransactions(
  shopId,
  user,
  buyerId,
  query = {},
) {
  await assertShopAccess(shopId, user);
  const { safeLimit, currentPage, skip } = paging(query);
  const account = await LoyaltyAccount.findOne({
    shop: shopId,
    buyer: buyerId,
  }).populate("buyer", "name email");
  if (!account) throw new ApiError(404, "No loyalty account for this customer");
  const filter = { account: account._id };
  const [items, total] = await Promise.all([
    LoyaltyTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    LoyaltyTransaction.countDocuments(filter),
  ]);
  return {
    account,
    items,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
  };
}

export async function adjustPoints(shopId, user, buyerId, { points, reason }) {
  await assertShopAccess(shopId, user);
  if (user.role !== "admin" && Math.abs(points) > SELLER_MAX_ADJUST) {
    throw new ApiError(
      403,
      `Adjustments above ${SELLER_MAX_ADJUST} points need an admin`,
    );
  }
  if (!(await User.exists({ _id: buyerId })))
    throw new ApiError(404, "Buyer not found");
  const program = await LoyaltyProgram.findOne({ shop: shopId });
  const account = await getOrCreateAccount(shopId, buyerId);
  await expireDueLots(account);

  const tx = await writeEntry({
    account,
    type: "adjust",
    points,
    guard: true,
    note: reason,
    createdBy: user._id,
    ...(points > 0
      ? {
          remaining: points,
          expiresAt: program?.expiryDays
            ? new Date(Date.now() + program.expiryDays * DAY)
            : null,
        }
      : {}),
  });
  if (points < 0) await consumeLots(account._id, -points);
  await notify(
    buyerId,
    "loyalty_adjusted",
    "Points adjusted",
    `${points > 0 ? "+" : ""}${points} points: ${reason}`,
  );
  return tx;
}

export async function listShopRedemptions(shopId, user, query = {}) {
  await assertShopAccess(shopId, user);
  const { safeLimit, currentPage, skip } = paging(query);
  const filter = {
    shop: shopId,
    ...(query.status ? { status: query.status } : {}),
  };
  const [items, total] = await Promise.all([
    LoyaltyRedemption.find(filter)
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    LoyaltyRedemption.countDocuments(filter),
  ]);
  return {
    items,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
  };
}

export async function fulfillRedemption(shopId, user, redemptionId) {
  await assertShopAccess(shopId, user, { allowAdmin: false });
  const r = await LoyaltyRedemption.findOneAndUpdate(
    { _id: redemptionId, shop: shopId, status: "issued" },
    { status: "fulfilled", fulfilledAt: new Date() },
    { new: true },
  );
  if (!r) throw new ApiError(404, "Reward not found or already fulfilled");
  return r;
}

/* ================================ BUYER ================================ */

export async function getMyAccounts(buyerId) {
  const accounts = await LoyaltyAccount.find({ buyer: buyerId })
    .populate("shop", "shopName slug logo")
    .sort({ updatedAt: -1 });
  for (const a of accounts) await expireDueLots(a);
  return LoyaltyAccount.find({ buyer: buyerId })
    .populate("shop", "shopName slug logo")
    .sort({ updatedAt: -1 });
}

export async function getShopLoyalty(shopId, buyerId) {
  const shop = await Shop.findById(shopId).select("shopName slug logo");
  if (!shop) throw new ApiError(404, "Shop not found");
  const program = await LoyaltyProgram.findOne({ shop: shopId });
  let account = await LoyaltyAccount.findOne({ shop: shopId, buyer: buyerId });
  if (account) {
    await expireDueLots(account);
    account = await LoyaltyAccount.findById(account._id);
  }
  const acct = account ?? {
    balance: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    totalExpired: 0,
  };
  const enabled = Boolean(program?.enabled);
  const rewards = enabled
    ? [
        {
          id: "standard",
          name: `₹${program.rewardValue} reward`,
          pointsCost: program.minRedeemPoints,
          value: program.rewardValue,
          redeemableNow: Math.max(
            0,
            Math.floor(acct.balance / program.minRedeemPoints),
          ),
        },
      ]
    : [];
  let nextExpiry = null;
  if (account) {
    const lot = await LoyaltyTransaction.findOne({
      account: account._id,
      remaining: { $gt: 0 },
      expiresAt: { $ne: null },
    }).sort({ expiresAt: 1 });
    if (lot) nextExpiry = { points: lot.remaining, expiresAt: lot.expiresAt };
  }
  return {
    shop,
    program: toPublicProgram(program) ?? emptyProgram,
    account: acct,
    rewards,
    nextExpiry,
  };
}

export async function getMyTransactions(shopId, buyerId, query = {}) {
  const { safeLimit, currentPage, skip } = paging(query);
  const account = await LoyaltyAccount.findOne({
    shop: shopId,
    buyer: buyerId,
  });
  if (!account) return { items: [], total: 0, page: 1, pages: 0 };
  await expireDueLots(account);
  const filter = {
    account: account._id,
    ...(query.type ? { type: query.type } : {}),
  };
  const [items, total] = await Promise.all([
    LoyaltyTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    LoyaltyTransaction.countDocuments(filter),
  ]);
  return {
    items,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
  };
}

export async function redeemPoints(shopId, buyerId, { quantity = 1 } = {}) {
  const program = await LoyaltyProgram.findOne({ shop: shopId });
  if (!program?.enabled)
    throw new ApiError(400, "This shop's loyalty program is not active");
  const account = await LoyaltyAccount.findOne({
    shop: shopId,
    buyer: buyerId,
  });
  if (!account) throw new ApiError(400, "You have no points at this shop yet");
  await expireDueLots(account);

  const cost = program.minRedeemPoints * quantity;
  const value = program.rewardValue * quantity;
  const redemption = await LoyaltyRedemption.create({
    shop: shopId,
    buyer: buyerId,
    points: cost,
    value,
    code: `RWD-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
  });
  try {
    await writeEntry({
      account,
      type: "redeem",
      points: -cost,
      guard: true,
      redemption: redemption._id,
      note: `Reward ${redemption.code}`,
    });
  } catch (e) {
    await redemption.deleteOne();
    throw e.statusCode
      ? new ApiError(400, `You need ${cost} points to redeem this reward`)
      : e;
  }
  await consumeLots(account._id, cost);
  const shop = await Shop.findById(shopId).select("owner");
  if (shop)
    await notify(
      shop.owner,
      "loyalty_redeemed",
      "Reward redeemed",
      `A customer redeemed a ₹${value} reward (${redemption.code}).`,
    );
  return { redemption, account: await LoyaltyAccount.findById(account._id) };
}

export async function getMyRedemptions(buyerId, query = {}) {
  const { safeLimit, currentPage, skip } = paging(query);
  const filter = { buyer: buyerId };
  const [items, total] = await Promise.all([
    LoyaltyRedemption.find(filter)
      .populate("shop", "shopName slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    LoyaltyRedemption.countDocuments(filter),
  ]);
  return {
    items,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
  };
}
