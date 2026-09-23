import Offer from "../../modules/offer/models/offer.model.js";
import OfferRedemption from "../../modules/offer/models/offerRedemption.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import { ApiError } from "../../exceptions/ApiError.js";

// ---- ownership-over-role, same pattern as khata.service.js / staff.service.js ----
async function assertShopOwnership(shopId, userId) {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, "Shop not found");
  if (String(shop.owner) !== String(userId)) {
    throw new ApiError(403, "Not authorized for this shop");
  }
  return shop;
}

const normalizeCode = (code) => code.trim().toUpperCase();

// ============================== SELLER ==============================

export async function createOffer(shopId, sellerId, data) {
  await assertShopOwnership(shopId, sellerId);
  const code = normalizeCode(data.code);

  const existing = await Offer.findOne({ shop: shopId, code });
  if (existing)
    throw new ApiError(
      409,
      "An offer with this code already exists for your shop",
    );

  const scope = data.scope || "shop";
  const offer = await Offer.create({
    ...data,
    code,
    shop: shopId,
    scope,
    applicableProducts: scope === "product" ? data.applicableProducts : [],
    applicableCategories: scope === "category" ? data.applicableCategories : [],
  });
  return offer;
}

export async function updateOffer(shopId, offerId, sellerId, data) {
  await assertShopOwnership(shopId, sellerId);
  const offer = await Offer.findOne({ _id: offerId, shop: shopId });
  if (!offer) throw new ApiError(404, "Offer not found");

  if (data.code) {
    const code = normalizeCode(data.code);
    const clash = await Offer.findOne({
      shop: shopId,
      code,
      _id: { $ne: offerId },
    });
    if (clash)
      throw new ApiError(
        409,
        "An offer with this code already exists for your shop",
      );
    data.code = code;
  }

  const nextScope = data.scope || offer.scope;
  Object.assign(offer, data);
  offer.scope = nextScope;

  if (nextScope === "product" && data.applicableProducts)
    offer.applicableProducts = data.applicableProducts;
  if (nextScope === "category" && data.applicableCategories)
    offer.applicableCategories = data.applicableCategories;
  if (nextScope === "shop") {
    offer.applicableProducts = [];
    offer.applicableCategories = [];
  }

  await offer.save();
  return offer;
}

export async function deleteOffer(shopId, offerId, sellerId) {
  await assertShopOwnership(shopId, sellerId);
  const offer = await Offer.findOneAndDelete({ _id: offerId, shop: shopId });
  if (!offer) throw new ApiError(404, "Offer not found");
  return offer;
}

export async function listShopOffers(shopId, sellerId) {
  await assertShopOwnership(shopId, sellerId);
  return Offer.find({ shop: shopId }).sort({ createdAt: -1 });
}

export async function getOfferForOwner(shopId, offerId, sellerId) {
  await assertShopOwnership(shopId, sellerId);
  const offer = await Offer.findOne({ _id: offerId, shop: shopId });
  if (!offer) throw new ApiError(404, "Offer not found");
  return offer;
}

// ============================== PUBLIC / BUYER ==============================

const isUsageAvailable = (offer) =>
  offer.usageLimit == null || offer.usedCount < offer.usageLimit;

export async function getPublicShopOffers(shopId) {
  const now = new Date();
  const offers = await Offer.find({
    shop: shopId,
    isActive: true,
    $or: [{ startDate: null }, { startDate: { $lte: now } }],
  }).sort({ createdAt: -1 });

  return offers.filter((o) => o.isWithinDateWindow(now) && isUsageAvailable(o));
}

// items: [{ productId, categoryId, subtotal }] — subtotal is the line's
// pre-discount value (unitPrice * quantity), same shape pricing.service's
// calculateLineItemTotal already produces.
const eligibleSubtotalFor = (offer, items) => {
  if (offer.scope === "shop") {
    return items.reduce((sum, i) => sum + i.subtotal, 0);
  }
  if (offer.scope === "product") {
    const ids = new Set(offer.applicableProducts.map(String));
    return items
      .filter((i) => ids.has(String(i.productId)))
      .reduce((sum, i) => sum + i.subtotal, 0);
  }
  if (offer.scope === "category") {
    const ids = new Set(offer.applicableCategories.map(String));
    return items
      .filter((i) => i.categoryId && ids.has(String(i.categoryId)))
      .reduce((sum, i) => sum + i.subtotal, 0);
  }
  return 0;
};

// Pure — no DB, easy to unit test. Mirrors pricing.service.js's style
// (plain data in, plain data out).
export const calculateOfferDiscount = (offer, eligibleSubtotal) => {
  if (eligibleSubtotal <= 0) return 0;

  let discount =
    offer.discountType === "percentage"
      ? (eligibleSubtotal * offer.discountValue) / 100
      : offer.discountValue;

  if (offer.discountType === "percentage" && offer.maxDiscountAmount) {
    discount = Math.min(discount, offer.maxDiscountAmount);
  }
  // Never let a coupon discount exceed what it's applied against —
  // this is what ultimately keeps grandTotal from going negative.
  discount = Math.min(discount, eligibleSubtotal);
  return Number(discount.toFixed(2));
};

// The single server-side source of truth for "can this buyer use this code
// right now, on this cart". Called both for the checkout preview AND again
// (never trust the frontend) at the moment the order is actually created.
export async function validateCoupon({
  shopId,
  buyerId,
  code,
  items,
  itemsSubtotal,
}) {
  const offer = await Offer.findOne({
    shop: shopId,
    code: normalizeCode(code),
  });
  if (!offer) return { eligible: false, reason: "not_found" };
  if (!offer.isActive) return { eligible: false, reason: "inactive", offer };

  const now = new Date();
  if (!offer.isWithinDateWindow(now))
    return { eligible: false, reason: "expired", offer };
  if (!isUsageAvailable(offer))
    return { eligible: false, reason: "usage_limit_reached", offer };
  if (itemsSubtotal < (offer.minOrderValue || 0)) {
    return {
      eligible: false,
      reason: "below_minimum_order",
      offer,
      minOrderValue: offer.minOrderValue,
    };
  }

  if (buyerId) {
    const customerUses = await OfferRedemption.countDocuments({
      offer: offer._id,
      buyer: buyerId,
      reversedAt: null,
    });
    if (customerUses >= offer.perCustomerLimit) {
      return { eligible: false, reason: "per_customer_limit_reached", offer };
    }
  }

  const eligibleSubtotal = eligibleSubtotalFor(offer, items);
  const discountAmount = calculateOfferDiscount(offer, eligibleSubtotal);
  if (discountAmount <= 0)
    return { eligible: false, reason: "no_eligible_items", offer };

  return { eligible: true, offer, eligibleSubtotal, discountAmount };
}

// ============================== REDEMPTION (called only from checkout) ==============================

export async function redeemOffer({
  offer,
  buyerId,
  orderId,
  discountAmount,
  session,
}) {
  // Guarded atomic increment: a limited-run coupon can never be oversold by
  // concurrent checkouts, same pattern as writeLedgerEntry's balance guard.
  const filter = { _id: offer._id };
  if (offer.usageLimit != null) filter.usedCount = { $lt: offer.usageLimit };

  const updated = await Offer.findOneAndUpdate(
    filter,
    { $inc: { usedCount: 1 } },
    { new: true, session },
  );
  if (!updated)
    throw new ApiError(400, "This coupon has just reached its usage limit");

  try {
    const [redemption] = await OfferRedemption.create(
      [
        {
          offer: offer._id,
          shop: offer.shop,
          buyer: buyerId,
          order: orderId,
          discountAmount,
        },
      ],
      { session },
    );
    return redemption;
  } catch (err) {
    // Roll back the usedCount bump if the redemption row couldn't be written
    await Offer.updateOne(
      { _id: offer._id },
      { $inc: { usedCount: -1 } },
      { session },
    );
    if (err.code === 11000)
      throw new ApiError(409, "This coupon was already applied to this order");
    throw err;
  }
}

export async function reverseOfferRedemption(orderId, session) {
  const redemption = await OfferRedemption.findOne({
    order: orderId,
    reversedAt: null,
  }).session(session ?? null);
  if (!redemption) return null;

  redemption.reversedAt = new Date();
  await redemption.save({ session });
  await Offer.updateOne(
    { _id: redemption.offer },
    { $inc: { usedCount: -1 } },
    { session },
  );
  return redemption;
}
