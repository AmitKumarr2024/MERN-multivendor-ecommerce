import crypto from "crypto";
import mongoose from "mongoose";
import Reservation from "../../modules/reservation/models/reservation.model.js";
import Product from "../../modules/product/models/product.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import { ApiError } from "../../exceptions/ApiError.js";
import { createNotification } from "../notification.service.js";
import { getEffectivePriceForVariant } from "../pricing.service.js";

const HOLDING_STATUSES = ["pending", "confirmed", "ready"];

const MAX_PICKUP_ATTEMPTS = 5;
const PICKUP_LOCK_MINUTES = 15;

// ---- ownership-over-role, same pattern as khata.service.js / staff.service.js ----
async function assertShopOwnership(shopId, userId) {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, "Shop not found");
  if (String(shop.owner) !== String(userId)) {
    throw new ApiError(403, "Not authorized for this shop");
  }
  return shop;
}

const paging = ({ page = 1, limit = 20 } = {}) => {
  const safeLimit = Math.min(Number(limit) || 20, 100);
  const currentPage = Math.max(Number(page) || 1, 1);
  return { safeLimit, currentPage, skip: (currentPage - 1) * safeLimit };
};

/* ============================================================
   PICKUP CODE - derived, never stored.
   code = HMAC-SHA256(secret, "<reservationId>:<issuedAtMs>") -> 6 digits
   Stable for a reservation (issuedAt is set once), recomputable by the
   server for the buyer, and useless to anyone with only DB access.
   ============================================================ */

function getPickupSecret() {
  const secret = process.env.PICKUP_CODE_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "Pickup verification is not configured");
  }
  return secret;
}

export function derivePickupCode(reservation) {
  const issuedAt = new Date(reservation.pickupCodeIssuedAt).getTime();
  const digest = crypto
    .createHmac("sha256", getPickupSecret())
    .update(`${reservation._id}:${issuedAt}`)
    .digest();
  return String(digest.readUInt32BE(0) % 1_000_000).padStart(6, "0");
}

// Reservations that were already "ready" before this feature shipped have no
// issuedAt yet - issue it lazily (atomic: only one writer can set it).
async function ensurePickupCodeIssued(reservation) {
  if (reservation.pickupCodeIssuedAt) return;
  await Reservation.updateOne(
    { _id: reservation._id, pickupCodeIssuedAt: null },
    { pickupCodeIssuedAt: new Date() },
  );
  const fresh = await Reservation.findById(reservation._id).select(
    "pickupCodeIssuedAt",
  );
  reservation.pickupCodeIssuedAt = fresh.pickupCodeIssuedAt;
}

// Buyer-facing view: only a READY reservation carries the code.
// toJSON() already strips issuedAt / attempts (see model transform).
async function toBuyerView(reservation) {
  const obj = reservation.toJSON();
  if (reservation.status === "ready") {
    await ensurePickupCodeIssued(reservation);
    obj.pickupCode = derivePickupCode(reservation);
  }
  return obj;
}

/* ============================================================
   STOCK HOLD - guarded atomic updates so concurrent reservations
   can never hold more than is actually available. Mirrors
   writeLedgerEntry's guarded $inc pattern from khata.service.js.
   ============================================================ */

// Places a hold for `quantity` units. Returns the updated product, or
// throws if there isn't enough (stock - reservedStock) available.
async function placeHold(productId, variantId, quantity) {
  if (variantId) {
    // Pipeline update (MongoDB 4.2+) - only bumps the matching variant's
    // reservedStock if stock - reservedStock >= quantity for THAT variant.

    const before = await Product.findById(productId).select("variants");

    const variant = before?.variants?.id(variantId);

    if (!variant) {
      throw new ApiError(400, "Selected variant no longer exists");
    }

    const result = await Product.updateOne(
      {
        _id: productId,
        "variants._id": variantId,
      },
      [
        {
          $set: {
            variants: {
              $map: {
                input: "$variants",
                as: "v",
                in: {
                  $cond: [
                    {
                      $and: [
                        {
                          $eq: ["$$v._id", variant._id],
                        },
                        {
                          $gte: [
                            {
                              $subtract: ["$$v.stock", "$$v.reservedStock"],
                            },
                            quantity,
                          ],
                        },
                      ],
                    },
                    {
                      $mergeObjects: [
                        "$$v",
                        {
                          reservedStock: {
                            $add: ["$$v.reservedStock", quantity],
                          },
                        },
                      ],
                    },
                    "$$v",
                  ],
                },
              },
            },
          },
        },
      ],
      {
        updatePipeline: true,
      },
    );

    if (result.modifiedCount === 0) {
      throw new ApiError(
        400,
        "Not enough stock available to reserve this option right now",
      );
    }

    return Product.findById(productId);
  }

  const updated = await Product.findOneAndUpdate(
    {
      _id: productId,
      $expr: {
        $gte: [
          {
            $subtract: ["$stock", "$reservedStock"],
          },
          quantity,
        ],
      },
    },
    {
      $inc: {
        reservedStock: quantity,
      },
    },
    {
      new: true,
    },
  );

  if (!updated) {
    throw new ApiError(400, "Not enough stock available to reserve right now");
  }

  return updated;
}

// Releases a hold WITHOUT touching real stock (cancel/reject/expire).
async function releaseHold(productId, variantId, quantity) {
  if (variantId) {
    await Product.updateOne(
      { _id: productId, "variants._id": variantId },
      { $inc: { "variants.$.reservedStock": -quantity } },
    );
  } else {
    await Product.updateOne(
      { _id: productId, reservedStock: { $gte: quantity } },
      { $inc: { reservedStock: -quantity } },
    );
  }
}

// Commits the hold into a real, permanent stock reduction (pickup collected).
async function commitHold(productId, variantId, quantity) {
  if (variantId) {
    const result = await Product.updateOne(
      {
        _id: productId,
        variants: { $elemMatch: { _id: variantId, stock: { $gte: quantity } } },
      },
      {
        $inc: {
          "variants.$.stock": -quantity,
          "variants.$.reservedStock": -quantity,
        },
      },
    );
    if (result.modifiedCount === 0) {
      throw new ApiError(400, "Stock inconsistency - cannot complete pickup");
    }
    return;
  }
  const updated = await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity, reservedStock: -quantity } },
    { new: true },
  );
  if (!updated) {
    throw new ApiError(400, "Stock inconsistency - cannot complete pickup");
  }
}

async function releaseIfHeld(reservation) {
  if (!reservation.holdsStock) return;
  await releaseHold(
    reservation.product,
    reservation.variantId,
    reservation.quantity,
  );
  reservation.holdsStock = false;
}

/* ============================================================
   LAZY EXPIRY - same pattern as loyalty.service.js's
   expireDueLots: checked on read, no cron needed.
   ============================================================ */

async function expireDueForFilter(extraFilter) {
  const now = new Date();
  const due = await Reservation.find({
    ...extraFilter,
    $or: [
      { status: "pending", expiresAt: { $lte: now } },
      {
        status: { $in: ["confirmed", "ready"] },
        pickupDeadline: { $lte: now },
      },
    ],
  });

  for (const r of due) {
    // Re-check status atomically to avoid double-expiring under concurrency
    const claimed = await Reservation.findOneAndUpdate(
      { _id: r._id, status: r.status },
      { status: "expired", cancelledAt: now, cancelledBy: "system" },
      { new: true },
    );
    if (!claimed) continue;
    await releaseHold(r.product, r.variantId, r.quantity);
    claimed.holdsStock = false;
    await claimed.save();
    await createNotification({
      recipient: r.buyer,
      type: "reservation_expired",
      title: "Reservation expired",
      message: `Your reservation for "${r.productName}" has expired.`,
      link: `/buyer/reservations`,
      relatedId: r._id,
      relatedModel: null,
    }).catch(() => {});
  }
}

/* ============================================================
   SELLER - settings
   ============================================================ */

export async function setShopReservationSettings(shopId, sellerId, data) {
  const shop = await assertShopOwnership(shopId, sellerId);
  if (data.enabled !== undefined) shop.reservationsEnabled = data.enabled;
  if (data.expiryHours !== undefined)
    shop.reservationExpiryHours = data.expiryHours;
  if (data.pickupWindowHours !== undefined)
    shop.pickupWindowHours = data.pickupWindowHours;
  if (data.pickupInstructions !== undefined)
    shop.pickupInstructions = data.pickupInstructions;
  await shop.save();
  return shop;
}

export async function toggleProductReservation(productId, sellerId, enabled) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  const shop = await Shop.findOne({ owner: sellerId });
  if (!shop || String(product.shop) !== String(shop._id)) {
    throw new ApiError(403, "You are not allowed to modify this product");
  }
  product.reservationEligible = enabled;
  await product.save();
  return product;
}

/* ============================================================
   BUYER - status + create
   ============================================================ */

export async function getShopReservationStatus(shopId) {
  const shop = await Shop.findById(shopId).select(
    "reservationsEnabled reservationExpiryHours pickupWindowHours pickupInstructions shopName",
  );
  if (!shop) throw new ApiError(404, "Shop not found");
  return {
    reservationsEnabled: !!shop.reservationsEnabled,
    reservationExpiryHours: shop.reservationExpiryHours,
    pickupWindowHours: shop.pickupWindowHours,
    pickupInstructions: shop.pickupInstructions || "",
  };
}

export async function createReservation(
  buyerId,
  { productId, variantId, quantity },
) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive)
    throw new ApiError(404, "Product not found");

  const shop = await Shop.findById(product.shop);
  if (!shop || !shop.isActive) throw new ApiError(404, "Shop not found");
  if (!shop.reservationsEnabled) {
    throw new ApiError(400, "This shop does not offer pickup reservations");
  }
  if (!product.reservationEligible) {
    throw new ApiError(
      400,
      "This product is not available for pickup reservation",
    );
  }

  if (product.hasVariants && !variantId) {
    throw new ApiError(400, "Please select a size/color option to reserve");
  }
  const variant = variantId ? product.getVariantById(variantId) : null;
  if (product.hasVariants && !variant) {
    throw new ApiError(400, "Selected option is no longer available");
  }

  // Guarded hold - throws if not enough available (stock - reservedStock)
  await placeHold(productId, variantId || null, quantity);

  const unitPrice = getEffectivePriceForVariant(product, variantId);
  const now = new Date();

  let reservation;
  try {
    reservation = await Reservation.create({
      shop: shop._id,
      buyer: buyerId,
      product: product._id,
      variantId: variantId || null,
      quantity,
      productName: product.name,
      productImage: variant?.images?.[0] || product.images?.[0] || "",
      variantLabel: variant
        ? [variant.color, variant.size].filter(Boolean).join(" / ")
        : null,
      unitPrice,
      status: "pending",
      holdsStock: true,
      expiresAt: new Date(
        now.getTime() + shop.reservationExpiryHours * 3600 * 1000,
      ),
    });
  } catch (err) {
    // Roll back the hold if the reservation record failed to write
    await releaseHold(productId, variantId || null, quantity).catch(() => {});
    throw err;
  }

  await createNotification({
    recipient: shop.owner,
    type: "reservation_requested",
    title: "New pickup reservation",
    message: `A buyer wants to reserve ${quantity} × "${product.name}" for pickup.`,
    link: `/seller/reservations`,
    relatedId: reservation._id,
    relatedModel: "Product",
  }).catch(() => {});

  return reservation;
}

/* ============================================================
   SHARED READ
   ============================================================ */

export async function getMyReservations(buyerId, { status, page, limit } = {}) {
  await expireDueForFilter({ buyer: buyerId });
  const { safeLimit, currentPage, skip } = paging({ page, limit });
  const filter = { buyer: buyerId, ...(status ? { status } : {}) };
  const [docs, total] = await Promise.all([
    Reservation.find(filter)
      .populate("shop", "shopName slug logo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Reservation.countDocuments(filter),
  ]);
  // Buyer sees the pickup code, but only on READY reservations.
  const items = await Promise.all(docs.map(toBuyerView));
  return {
    items,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
  };
}

export async function getShopReservations(
  shopId,
  sellerId,
  { status, page, limit } = {},
) {
  await assertShopOwnership(shopId, sellerId);
  await expireDueForFilter({ shop: shopId });
  const { safeLimit, currentPage, skip } = paging({ page, limit });
  const filter = { shop: shopId, ...(status ? { status } : {}) };
  const [items, total] = await Promise.all([
    Reservation.find(filter)
      .populate("buyer", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Reservation.countDocuments(filter),
  ]);
  // Seller list never includes the code.
  return {
    items,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
  };
}

async function getReservationOr404(id) {
  const reservation = await Reservation.findById(id);
  if (!reservation) throw new ApiError(404, "Reservation not found");
  return reservation;
}

export async function getReservationById(id, userId, isSeller) {
  const reservation = await getReservationOr404(id);
  if (isSeller) {
    await assertShopOwnership(reservation.shop, userId);
    return reservation;
  }
  if (String(reservation.buyer) !== String(userId)) {
    throw new ApiError(403, "Not authorized");
  }
  return toBuyerView(reservation);
}

/* ============================================================
   SELLER - lifecycle actions
   ============================================================ */

export async function confirmReservation(id, sellerId) {
  const reservation = await getReservationOr404(id);
  const shop = await assertShopOwnership(reservation.shop, sellerId);
  if (reservation.status !== "pending") {
    throw new ApiError(
      400,
      `Only a pending reservation can be confirmed (current: ${reservation.status})`,
    );
  }
  reservation.status = "confirmed";
  reservation.confirmedAt = new Date();
  reservation.pickupDeadline = new Date(
    Date.now() + shop.pickupWindowHours * 3600 * 1000,
  );
  await reservation.save();

  await createNotification({
    recipient: reservation.buyer,
    type: "reservation_confirmed",
    title: "Reservation confirmed",
    message: `Your reservation for "${reservation.productName}" was confirmed. Pick up before ${reservation.pickupDeadline.toLocaleDateString()}.`,
    link: `/buyer/reservations`,
    relatedId: reservation._id,
    relatedModel: null,
  }).catch(() => {});

  return reservation;
}

export async function rejectReservation(id, sellerId, { rejectionReason }) {
  const reservation = await getReservationOr404(id);
  await assertShopOwnership(reservation.shop, sellerId);
  if (reservation.status !== "pending") {
    throw new ApiError(400, "Only a pending reservation can be rejected");
  }
  await releaseIfHeld(reservation);
  reservation.status = "cancelled";
  reservation.cancelledAt = new Date();
  reservation.cancelledBy = "seller";
  reservation.rejectionReason = rejectionReason;
  await reservation.save();

  await createNotification({
    recipient: reservation.buyer,
    type: "reservation_rejected",
    title: "Reservation rejected",
    message: rejectionReason,
    link: `/buyer/reservations`,
    relatedId: reservation._id,
    relatedModel: null,
  }).catch(() => {});

  return reservation;
}

export async function markReady(id, sellerId) {
  const reservation = await getReservationOr404(id);
  await assertShopOwnership(reservation.shop, sellerId);
  if (reservation.status !== "confirmed") {
    throw new ApiError(400, "Only a confirmed reservation can be marked ready");
  }
  reservation.status = "ready";
  reservation.readyAt = new Date();
  // The code is issued exactly once, here. It is derived, not stored.
  reservation.pickupCodeIssuedAt = new Date();
  reservation.pickupFailedAttempts = 0;
  reservation.pickupLockedUntil = null;
  await reservation.save();

  await createNotification({
    recipient: reservation.buyer,
    type: "reservation_ready",
    title: "Ready for pickup",
    message: `"${reservation.productName}" is ready for pickup. Show your pickup code to the seller.`,
    link: `/buyer/reservations`,
    relatedId: reservation._id,
    relatedModel: null,
  }).catch(() => {});

  return reservation;
}

/**
 * The ONLY path to "collected". Replaces the old markCollected.
 *
 * Order of operations matters:
 *  1. ownership + status + lock checks
 *  2. constant-time code comparison (wrong code changes nothing except the
 *     failed-attempt counter)
 *  3. ATOMIC claim ready -> collected. Only one concurrent request can win
 *     this, so stock is committed once and the notification is sent once.
 *  4. commitHold; if it fails, the claim is rolled back.
 */
export async function verifyPickupCode(id, sellerId, pickupCode) {
  // Make sure an overdue reservation is expired before we look at it.
  await expireDueForFilter({ _id: id });

  const reservation = await getReservationOr404(id);
  await assertShopOwnership(reservation.shop, sellerId);

  if (reservation.status !== "ready") {
    throw new ApiError(400, "Only a ready reservation can be collected");
  }

  if (
    reservation.pickupLockedUntil &&
    reservation.pickupLockedUntil > new Date()
  ) {
    throw new ApiError(
      429,
      "Too many incorrect attempts. Please try again later.",
    );
  }

  await ensurePickupCodeIssued(reservation);

  const supplied = Buffer.from(String(pickupCode ?? ""));
  const expected = Buffer.from(derivePickupCode(reservation));
  const matches =
    supplied.length === expected.length &&
    crypto.timingSafeEqual(supplied, expected);

  if (!matches) {
    const bumped = await Reservation.findOneAndUpdate(
      { _id: reservation._id, status: "ready" },
      { $inc: { pickupFailedAttempts: 1 } },
      { new: true },
    );
    if (bumped && bumped.pickupFailedAttempts >= MAX_PICKUP_ATTEMPTS) {
      await Reservation.updateOne(
        { _id: reservation._id },
        {
          pickupLockedUntil: new Date(
            Date.now() + PICKUP_LOCK_MINUTES * 60 * 1000,
          ),
          pickupFailedAttempts: 0,
        },
      );
    }
    throw new ApiError(400, "Invalid pickup code");
  }

  // Atomic claim - a second concurrent request gets null here.
  const claimed = await Reservation.findOneAndUpdate(
    { _id: reservation._id, status: "ready", holdsStock: true },
    {
      status: "collected",
      collectedAt: new Date(),
      holdsStock: false,
      pickupFailedAttempts: 0,
      pickupLockedUntil: null,
    },
    { new: true },
  );
  if (!claimed) {
    throw new ApiError(400, "Only a ready reservation can be collected");
  }

  try {
    // The one place actual stock is permanently reduced for a reservation.
    await commitHold(claimed.product, claimed.variantId, claimed.quantity);
  } catch (err) {
    // Roll the claim back so the reservation isn't stuck "collected" with
    // stock never committed.
    await Reservation.updateOne(
      { _id: claimed._id },
      { status: "ready", collectedAt: null, holdsStock: true },
    );
    throw err;
  }

  await createNotification({
    recipient: claimed.buyer,
    type: "reservation_collected",
    title: "Pickup complete",
    message: `Thanks for picking up "${claimed.productName}"!`,
    link: `/buyer/reservations`,
    relatedId: claimed._id,
    relatedModel: null,
  }).catch(() => {});

  return claimed;
}

// Buyer OR seller can cancel while it's still pending/confirmed/ready.
export async function cancelReservation(id, userId, isSeller, { reason } = {}) {
  const reservation = await getReservationOr404(id);
  if (isSeller) {
    await assertShopOwnership(reservation.shop, userId);
  } else if (String(reservation.buyer) !== String(userId)) {
    throw new ApiError(403, "Not authorized");
  }
  if (!HOLDING_STATUSES.includes(reservation.status)) {
    throw new ApiError(
      400,
      `Reservation cannot be cancelled once it is ${reservation.status}`,
    );
  }

  await releaseIfHeld(reservation);
  reservation.status = "cancelled";
  reservation.cancelledAt = new Date();
  reservation.cancelledBy = isSeller ? "seller" : "buyer";
  reservation.cancelReason = reason || "Cancelled";
  await reservation.save();

  const recipient = isSeller
    ? reservation.buyer
    : (await Shop.findById(reservation.shop).select("owner"))?.owner;

  if (recipient) {
    await createNotification({
      recipient,
      type: "reservation_cancelled",
      title: "Reservation cancelled",
      message: `Reservation for "${reservation.productName}" was cancelled.`,
      link: isSeller ? `/buyer/reservations` : `/seller/reservations`,
      relatedId: reservation._id,
      relatedModel: null,
    }).catch(() => {});
  }

  return reservation;
}
