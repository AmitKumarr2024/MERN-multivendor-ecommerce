import Khata from "../../modules/khata/models/khata.model.js";
import KhataTransaction from "../../modules/khata/models/khataTransaction.model.js";
import KhataSettlement from "../../modules/khata/models/khataSettlement.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import { ApiError } from "../../exceptions/ApiError.js";
import { createNotification } from "../notification.service.js";

const currentStatementMonth = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"

// ---- ownership-over-role check, same pattern as staff.service.js ----
async function assertShopOwnership(shopId, userId) {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, "Shop not found");
  if (String(shop.owner) !== String(userId)) {
    throw new ApiError(403, "Not authorized for this shop");
  }
  return shop;
}

// ---------- Seller: enable/disable Khata for the shop ----------
export async function setShopKhataEnabled(shopId, sellerId, enabled) {
  const shop = await assertShopOwnership(shopId, sellerId);
  shop.khataEnabled = enabled; // add `khataEnabled: { type: Boolean, default: false }` to Shop model
  await shop.save();
  return shop;
}

// ---------- Buyer: apply for khata ----------
export async function applyForKhata(shopId, buyerId, { requestNote }) {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, "Shop not found");
  if (!shop.khataEnabled)
    throw new ApiError(400, "This shop does not offer Khata");

  const existing = await Khata.findOne({ shop: shopId, buyer: buyerId });
  if (existing) {
    if (existing.status === "pending")
      throw new ApiError(409, "Request already pending");
    if (existing.status === "approved")
      throw new ApiError(409, "Khata already approved");
    // rejected/suspended → allow re-apply by resetting to pending
    existing.status = "pending";
    existing.requestNote = requestNote;
    existing.rejectionReason = undefined;
    await existing.save();
    await notifySeller(shop, existing, "re-applied for");
    return existing;
  }

  const khata = await Khata.create({
    shop: shopId,
    buyer: buyerId,
    requestNote,
    status: "pending",
  });
  await notifySeller(shop, khata, "applied for");
  return khata;
}

async function notifySeller(shop, khata, verb) {
  await createNotification({
    recipient: shop.owner,
    type: "khata_request",
    title: "New Khata request",
    message: `A buyer has ${verb} Khata credit at your shop.`,
    meta: { khataId: khata._id, shopId: shop._id },
  });
}

// ---------- Seller: view requests / list ----------
export async function listShopKhatas(shopId, sellerId, { status } = {}) {
  await assertShopOwnership(shopId, sellerId);
  const filter = { shop: shopId };
  if (status) filter.status = status;
  return Khata.find(filter)
    .populate("buyer", "name email phone")
    .sort({ createdAt: -1 });
}

// ---------- Seller: approve ----------
export async function approveKhata(khataId, sellerId, { creditLimit }) {
  const khata = await Khata.findById(khataId);
  if (!khata) throw new ApiError(404, "Khata request not found");
  await assertShopOwnership(khata.shop, sellerId);
  if (khata.status === "approved") throw new ApiError(409, "Already approved");

  khata.status = "approved";
  khata.creditLimit = creditLimit;
  khata.approvedAt = new Date();
  khata.approvedBy = sellerId;
  khata.rejectionReason = undefined;
  await khata.save();

  await createNotification({
    recipient: khata.buyer,
    type: "khata_approved",
    title: "Khata approved",
    message: `Your Khata request was approved with a credit limit of ₹${creditLimit}.`,
    meta: { khataId: khata._id, shopId: khata.shop },
  });
  return khata;
}

// ---------- Seller: reject ----------
export async function rejectKhata(khataId, sellerId, { rejectionReason }) {
  const khata = await Khata.findById(khataId);
  if (!khata) throw new ApiError(404, "Khata request not found");
  await assertShopOwnership(khata.shop, sellerId);
  if (khata.status === "approved")
    throw new ApiError(
      409,
      "Cannot reject an already-approved Khata; suspend instead",
    );

  khata.status = "rejected";
  khata.rejectionReason = rejectionReason;
  await khata.save();

  await createNotification({
    recipient: khata.buyer,
    type: "khata_rejected",
    title: "Khata request rejected",
    message: rejectionReason,
    meta: { khataId: khata._id, shopId: khata.shop },
  });
  return khata;
}

// ---------- Seller: suspend / reactivate ----------
export async function suspendKhata(khataId, sellerId, { suspendedReason }) {
  const khata = await Khata.findById(khataId);
  if (!khata) throw new ApiError(404, "Khata not found");
  await assertShopOwnership(khata.shop, sellerId);
  if (khata.status !== "approved")
    throw new ApiError(400, "Only approved Khata can be suspended");

  khata.status = "suspended";
  khata.suspendedAt = new Date();
  khata.suspendedReason = suspendedReason;
  await khata.save();

  await createNotification({
    recipient: khata.buyer,
    type: "khata_suspended",
    title: "Khata suspended",
    message: suspendedReason,
    meta: { khataId: khata._id, shopId: khata.shop },
  });
  return khata;
}

export async function reactivateKhata(khataId, sellerId) {
  const khata = await Khata.findById(khataId);
  if (!khata) throw new ApiError(404, "Khata not found");
  await assertShopOwnership(khata.shop, sellerId);
  if (khata.status !== "suspended")
    throw new ApiError(400, "Only suspended Khata can be reactivated");

  khata.status = "approved";
  khata.suspendedAt = undefined;
  khata.suspendedReason = undefined;
  await khata.save();
  return khata;
}

// ---------- Seller: update credit limit ----------
export async function updateCreditLimit(khataId, sellerId, { creditLimit }) {
  const khata = await Khata.findById(khataId);
  if (!khata) throw new ApiError(404, "Khata not found");
  await assertShopOwnership(khata.shop, sellerId);
  if (creditLimit < khata.outstandingBalance) {
    throw new ApiError(
      400,
      "New limit cannot be below the current outstanding balance",
    );
  }
  khata.creditLimit = creditLimit;
  await khata.save();
  return khata;
}

// ---------- Core ledger writer — the ONLY place balance changes happen ----------
async function writeLedgerEntry({
  khata,
  type,
  amount,
  order,
  note,
  recordedBy,
  session,
}) {
  const newBalance = khata.outstandingBalance + amount;
  if (newBalance < 0) {
    throw new ApiError(400, "Payment exceeds outstanding balance");
  }

  const [txn] = await KhataTransaction.create(
    [
      {
        khata: khata._id,
        shop: khata.shop,
        buyer: khata.buyer,
        type,
        amount,
        balanceAfter: newBalance,
        order,
        note,
        recordedBy,
        statementMonth: currentStatementMonth(),
      },
    ],
    { session },
  );

  khata.outstandingBalance = newBalance;
  await khata.save({ session });
  return txn;
}

// ---------- Order integration entrypoint ----------
// Call this ONLY when paymentMethod === "khata" was explicitly chosen at checkout.
// COD and online payment must never call this.
export async function chargeKhataForOrder({
  shopId,
  buyerId,
  orderId,
  amount,
  session,
}) {
  const khata = await Khata.findOne({ shop: shopId, buyer: buyerId }).session(
    session ?? null,
  );
  if (!khata) throw new ApiError(400, "No Khata account exists for this shop");
  if (!khata.isUsable())
    throw new ApiError(
      400,
      `Khata is ${khata.status}, cannot be used for payment`,
    );

  if (khata.availableCredit() < amount) {
    throw new ApiError(
      400,
      "Insufficient available credit for Khata payment — choose another payment method",
    );
  }

  return writeLedgerEntry({
    khata,
    type: "credit_purchase",
    amount, // positive
    order: orderId,
    note: `Order ${orderId}`,
    recordedBy: buyerId, // system-triggered but attributed to the buyer's action
    session,
  });
}

// ---------- Reverse a khata charge (order rollback / cancellation) ----------
// Writes a compensating negative-amount ledger entry so the outstanding
// balance is corrected WITHOUT deleting the original credit_purchase
// transaction — history must be preserved permanently, per the ledger rule.
export async function reverseKhataCharge({
  shopId,
  buyerId,
  orderId,
  session,
}) {
  const khata = await Khata.findOne({ shop: shopId, buyer: buyerId }).session(
    session ?? null,
  );
  if (!khata) return; // nothing to reverse — original charge presumably never landed

  const original = await KhataTransaction.findOne({
    khata: khata._id,
    order: orderId,
    type: "credit_purchase",
  });
  if (!original) return; // no matching charge found, nothing to reverse

  // Already reversed? Guard against double-reversal (e.g. cancel called twice)
  const alreadyReversed = await KhataTransaction.findOne({
    khata: khata._id,
    order: orderId,
    type: "adjustment",
  });
  if (alreadyReversed) return;

  return writeLedgerEntry({
    khata,
    type: "adjustment",
    amount: -original.amount, // compensating negative entry
    order: orderId,
    note: `Reversal of order ${orderId} (order rolled back / cancelled)`,
    recordedBy: buyerId,
    session,
  });
}

// Call this before showing "Pay with Khata" as a selectable option at checkout
export async function canUseKhata(shopId, buyerId, orderAmount) {
  const khata = await Khata.findOne({ shop: shopId, buyer: buyerId });
  if (!khata || !khata.isUsable())
    return { eligible: false, reason: "not_approved" };
  if (khata.availableCredit() < orderAmount)
    return { eligible: false, reason: "insufficient_credit" };
  return { eligible: true, availableCredit: khata.availableCredit() };
}

// ---------- Seller: record a customer payment ----------
export async function recordPayment(khataId, sellerId, { amount, note }) {
  const khata = await Khata.findById(khataId);
  if (!khata) throw new ApiError(404, "Khata not found");
  await assertShopOwnership(khata.shop, sellerId);

  const txn = await writeLedgerEntry({
    khata,
    type: "payment",
    amount: -Math.abs(amount), // negative
    note,
    recordedBy: sellerId,
  });

  await createNotification({
    recipient: khata.buyer,
    type: "khata_payment_recorded",
    title: "Payment recorded",
    message: `₹${amount} payment recorded. New balance: ₹${khata.outstandingBalance}.`,
    meta: { khataId: khata._id },
  });
  return txn;
}

// ---------- Transaction history / statements (buyer + seller, read-only) ----------
export async function getTransactionHistory(
  khataId,
  requesterId,
  isSellerRequest,
) {
  const khata = await Khata.findById(khataId);
  if (!khata) throw new ApiError(404, "Khata not found");

  if (isSellerRequest) {
    await assertShopOwnership(khata.shop, requesterId);
  } else if (String(khata.buyer) !== String(requesterId)) {
    throw new ApiError(403, "Not authorized");
  }

  return KhataTransaction.find({ khata: khataId }).sort({ createdAt: -1 });
}

export async function getMonthlyStatement(
  khataId,
  requesterId,
  isSellerRequest,
  statementMonth,
) {
  const khata = await Khata.findById(khataId);
  if (!khata) throw new ApiError(404, "Khata not found");

  if (isSellerRequest) {
    await assertShopOwnership(khata.shop, requesterId);
  } else if (String(khata.buyer) !== String(requesterId)) {
    throw new ApiError(403, "Not authorized");
  }

  const txns = await KhataTransaction.find({
    khata: khataId,
    statementMonth,
  }).sort({ createdAt: 1 });
  const totalCredits = txns
    .filter((t) => t.type === "credit_purchase")
    .reduce((s, t) => s + t.amount, 0);
  const totalPayments = txns
    .filter((t) => t.type === "payment")
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const openingBalance = txns.length
    ? txns[0].balanceAfter - txns[0].amount
    : khata.outstandingBalance;
  const closingBalance = txns.length
    ? txns[txns.length - 1].balanceAfter
    : khata.outstandingBalance;

  return {
    statementMonth,
    openingBalance,
    closingBalance,
    totalCredits,
    totalPayments,
    transactions: txns,
  };
}

// ---------- Seller: close/settle a month — NEVER deletes transactions ----------
export async function closeMonth(khataId, sellerId, { statementMonth }) {
  const khata = await Khata.findById(khataId);
  if (!khata) throw new ApiError(404, "Khata not found");
  await assertShopOwnership(khata.shop, sellerId);

  const already = await KhataSettlement.findOne({
    khata: khataId,
    statementMonth,
  });
  if (already) throw new ApiError(409, "This month is already closed");

  const stmt = await getMonthlyStatement(
    khataId,
    sellerId,
    true,
    statementMonth,
  );

  const settlement = await KhataSettlement.create({
    khata: khataId,
    shop: khata.shop,
    statementMonth,
    openingBalance: stmt.openingBalance,
    closingBalance: stmt.closingBalance,
    totalCredits: stmt.totalCredits,
    totalPayments: stmt.totalPayments,
    closedBy: sellerId,
  });

  // Mark transactions as settled — history stays, nothing is deleted
  await KhataTransaction.updateMany(
    { khata: khataId, statementMonth },
    { $set: { settledAt: new Date() } },
  );

  khata.lastSettledAt = new Date();
  await khata.save();

  return settlement;
}

// ---------- Buyer: my khatas across all shops ----------
export async function getMyKhatas(buyerId) {
  return Khata.find({ buyer: buyerId })
    .populate("shop", "shopName logo")
    .sort({ updatedAt: -1 });
}

export async function getShopKhataStatus(shopId, buyerId) {
  const shop = await Shop.findById(shopId).select("khataEnabled shopName");
  if (!shop) throw new ApiError(404, "Shop not found");
  const khata = await Khata.findOne({ shop: shopId, buyer: buyerId });
  return { khataEnabled: !!shop.khataEnabled, khata: khata ?? null };
}
