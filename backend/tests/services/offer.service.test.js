import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../setup/db.js";
import Shop from "../../modules/shop/models/shop.model.js";
import Category from "../../modules/product/models/category.model.js";
import Product from "../../modules/product/models/product.model.js";
import User from "../../modules/auth/models/auth.model.js";
import Offer from "../../modules/offer/models/offer.model.js";
import * as offerService from "../../services/offer/offer.service.js";

let seller, otherSeller, buyer, shop, category, product;

beforeAll(async () => {
  await connectTestDB();
});
afterAll(async () => {
  await closeTestDB();
});
beforeEach(async () => {
  await clearTestDB();
  seller = await User.create({
    name: "Seller",
    email: "seller@test.com",
    password: "password123",
    role: "seller",
  });
  otherSeller = await User.create({
    name: "Other",
    email: "other@test.com",
    password: "password123",
    role: "seller",
  });
  buyer = await User.create({
    name: "Buyer",
    email: "buyer@test.com",
    password: "password123",
  });
  shop = await Shop.create({ shopName: "Test Shop", owner: seller._id });
  category = await Category.create({ name: "Category" });
  product = await Product.create({
    shop: shop._id,
    name: "Product",
    price: 500,
    category: category._id,
    stock: 10,
  });
});

describe("calculateOfferDiscount", () => {
  test("percentage discount capped by maxDiscountAmount", () => {
    expect(
      offerService.calculateOfferDiscount(
        {
          discountType: "percentage",
          discountValue: 50,
          maxDiscountAmount: 100,
        },
        1000,
      ),
    ).toBe(100);
  });

  test("fixed discount never exceeds eligible subtotal", () => {
    expect(
      offerService.calculateOfferDiscount(
        { discountType: "fixed", discountValue: 500 },
        200,
      ),
    ).toBe(200);
  });

  test("plain percentage discount with no cap", () => {
    expect(
      offerService.calculateOfferDiscount(
        {
          discountType: "percentage",
          discountValue: 10,
          maxDiscountAmount: null,
        },
        500,
      ),
    ).toBe(50);
  });
});

describe("createOffer", () => {
  test("seller can create a shop-wide offer", async () => {
    const offer = await offerService.createOffer(shop._id, seller._id, {
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
    });
    expect(offer.code).toBe("SAVE10");
    expect(offer.scope).toBe("shop");
  });

  test("rejects a duplicate code for the same shop (case-insensitive)", async () => {
    await offerService.createOffer(shop._id, seller._id, {
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
    });
    await expect(
      offerService.createOffer(shop._id, seller._id, {
        code: "save10",
        discountType: "fixed",
        discountValue: 50,
      }),
    ).rejects.toThrow(/already exists/i);
  });

  test("a non-owner cannot create an offer for this shop", async () => {
    await expect(
      offerService.createOffer(shop._id, otherSeller._id, {
        code: "HACK",
        discountType: "fixed",
        discountValue: 10,
      }),
    ).rejects.toThrow(/not authorized/i);
  });
});

describe("validateCoupon", () => {
  const items = () => [
    { productId: product._id, categoryId: category._id, subtotal: 1000 },
  ];

  test("valid shop-wide coupon is eligible", async () => {
    await offerService.createOffer(shop._id, seller._id, {
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
    });
    const result = await offerService.validateCoupon({
      shopId: shop._id,
      buyerId: buyer._id,
      code: "save10",
      items: items(),
      itemsSubtotal: 1000,
    });
    expect(result.eligible).toBe(true);
    expect(result.discountAmount).toBe(100);
  });

  test("rejects an unknown code", async () => {
    const result = await offerService.validateCoupon({
      shopId: shop._id,
      buyerId: buyer._id,
      code: "NOPE",
      items: items(),
      itemsSubtotal: 1000,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("not_found");
  });

  test("rejects an expired coupon", async () => {
    await offerService.createOffer(shop._id, seller._id, {
      code: "OLD",
      discountType: "fixed",
      discountValue: 50,
      endDate: new Date(Date.now() - 86400000),
    });
    const result = await offerService.validateCoupon({
      shopId: shop._id,
      buyerId: buyer._id,
      code: "OLD",
      items: items(),
      itemsSubtotal: 1000,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("expired");
  });

  test("rejects when order is below the minimum", async () => {
    await offerService.createOffer(shop._id, seller._id, {
      code: "BIG",
      discountType: "fixed",
      discountValue: 50,
      minOrderValue: 2000,
    });
    const result = await offerService.validateCoupon({
      shopId: shop._id,
      buyerId: buyer._id,
      code: "BIG",
      items: items(),
      itemsSubtotal: 1000,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("below_minimum_order");
  });

  test("product-scoped offer ignores items outside the product list", async () => {
    const otherProduct = await Product.create({
      shop: shop._id,
      name: "Other",
      price: 100,
      category: category._id,
      stock: 5,
    });
    await offerService.createOffer(shop._id, seller._id, {
      code: "PROD",
      discountType: "fixed",
      discountValue: 50,
      scope: "product",
      applicableProducts: [product._id],
    });
    const result = await offerService.validateCoupon({
      shopId: shop._id,
      buyerId: buyer._id,
      code: "PROD",
      items: [
        {
          productId: otherProduct._id,
          categoryId: category._id,
          subtotal: 500,
        },
      ],
      itemsSubtotal: 500,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("no_eligible_items");
  });

  test("usage limit exhausted makes a coupon ineligible", async () => {
    const offer = await offerService.createOffer(shop._id, seller._id, {
      code: "LIMIT1",
      discountType: "fixed",
      discountValue: 10,
      usageLimit: 1,
    });
    await Offer.updateOne({ _id: offer._id }, { usedCount: 1 });
    const result = await offerService.validateCoupon({
      shopId: shop._id,
      buyerId: buyer._id,
      code: "LIMIT1",
      items: items(),
      itemsSubtotal: 1000,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("usage_limit_reached");
  });

  test("per-customer limit blocks repeat use by the same buyer", async () => {
    const offer = await offerService.createOffer(shop._id, seller._id, {
      code: "ONCE",
      discountType: "fixed",
      discountValue: 10,
      perCustomerLimit: 1,
    });
    await offerService.redeemOffer({
      offer,
      buyerId: buyer._id,
      orderId: new mongoose.Types.ObjectId(),
      discountAmount: 10,
    });
    const result = await offerService.validateCoupon({
      shopId: shop._id,
      buyerId: buyer._id,
      code: "ONCE",
      items: items(),
      itemsSubtotal: 1000,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("per_customer_limit_reached");
  });
});

describe("redeemOffer / reverseOfferRedemption", () => {
  test("redemption increments usedCount, reversal decrements it", async () => {
    const offer = await offerService.createOffer(shop._id, seller._id, {
      code: "R1",
      discountType: "fixed",
      discountValue: 20,
    });
    const orderId = new mongoose.Types.ObjectId();
    await offerService.redeemOffer({
      offer,
      buyerId: buyer._id,
      orderId,
      discountAmount: 20,
    });
    expect((await Offer.findById(offer._id)).usedCount).toBe(1);

    await offerService.reverseOfferRedemption(orderId);
    expect((await Offer.findById(offer._id)).usedCount).toBe(0);
  });

  test("a limited coupon rejects redemption once exhausted", async () => {
    const offer = await offerService.createOffer(shop._id, seller._id, {
      code: "R2",
      discountType: "fixed",
      discountValue: 20,
      usageLimit: 1,
    });
    await offerService.redeemOffer({
      offer,
      buyerId: buyer._id,
      orderId: new mongoose.Types.ObjectId(),
      discountAmount: 20,
    });
    await expect(
      offerService.redeemOffer({
        offer,
        buyerId: buyer._id,
        orderId: new mongoose.Types.ObjectId(),
        discountAmount: 20,
      }),
    ).rejects.toThrow(/usage limit/i);
  });
});
