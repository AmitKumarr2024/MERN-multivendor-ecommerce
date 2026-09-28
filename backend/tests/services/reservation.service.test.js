import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import { connectTestDB, clearTestDB, closeTestDB } from "../setup/db.js";
import User from "../../modules/auth/models/auth.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import Category from "../../modules/product/models/category.model.js";
import Product from "../../modules/product/models/product.model.js";
import Reservation from "../../modules/reservation/models/reservation.model.js";
import Notification from "../../modules/notification/models/notification.model.js";
import * as svc from "../../services/reservation/reservation.service.js";

let seller, buyer, otherSeller, shop, category, product;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
  await connectTestDB();
});
afterAll(closeTestDB);

beforeEach(async () => {
  await clearTestDB();
  seller = await User.create({
    name: "Seller",
    email: "s@test.com",
    password: "password123",
    role: "seller",
  });
  otherSeller = await User.create({
    name: "Other",
    email: "o@test.com",
    password: "password123",
    role: "seller",
  });
  buyer = await User.create({
    name: "Buyer",
    email: "b@test.com",
    password: "password123",
  });
  shop = await Shop.create({
    shopName: "Reserve Shop",
    owner: seller._id,
    reservationsEnabled: true,
    reservationExpiryHours: 24,
    pickupWindowHours: 48,
  });
  category = await Category.create({ name: "Cat" });
  // reservationEligible defaults to true - no per-product opt-in needed.
  product = await Product.create({
    shop: shop._id,
    name: "Widget",
    price: 100,
    category: category._id,
    stock: 10,
  });
});

// Helper: reserve -> confirm -> ready, returns the fresh DB doc
const makeReady = async (quantity = 3, productId = product._id, extra = {}) => {
  const created = await svc.createReservation(buyer._id, {
    productId,
    quantity,
    ...extra,
  });
  await svc.confirmReservation(created._id, seller._id);
  await svc.markReady(created._id, seller._id);
  return Reservation.findById(created._id);
};
const codeOf = (reservation) => svc.derivePickupCode(reservation);

describe("createReservation - hold semantics", () => {
  test("holds stock without reducing it", async () => {
    const r = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 4,
    });
    expect(r.status).toBe("pending");

    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(10);
    expect(updated.reservedStock).toBe(4);
    expect(updated.getAvailableStock()).toBe(6);
  });

  test("rejects a reservation exceeding available stock", async () => {
    await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 8,
    });
    await expect(
      svc.createReservation(buyer._id, { productId: product._id, quantity: 5 }),
    ).rejects.toThrow(/not enough stock/i);
  });

  test("products are reservable by default (opt-out model)", async () => {
    expect(product.reservationEligible).toBe(true);
    const r = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 1,
    });
    expect(r.status).toBe("pending");
  });

  test("rejects a product the seller excluded", async () => {
    await svc.toggleProductReservation(product._id, seller._id, false);
    await expect(
      svc.createReservation(buyer._id, { productId: product._id, quantity: 1 }),
    ).rejects.toThrow(/not available for pickup reservation/i);
  });

  test("re-including an excluded product makes it reservable again", async () => {
    await svc.toggleProductReservation(product._id, seller._id, false);
    await svc.toggleProductReservation(product._id, seller._id, true);
    const r = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 1,
    });
    expect(r.status).toBe("pending");
  });

  test("another seller cannot change product eligibility", async () => {
    await Shop.create({ shopName: "Other Shop", owner: otherSeller._id });
    await expect(
      svc.toggleProductReservation(product._id, otherSeller._id, false),
    ).rejects.toThrow(/not allowed/i);
  });

  test("rejects when shop reservations are disabled", async () => {
    shop.reservationsEnabled = false;
    await shop.save();
    await expect(
      svc.createReservation(buyer._id, { productId: product._id, quantity: 1 }),
    ).rejects.toThrow(/does not offer pickup/i);
  });

  test("rejects an inactive product", async () => {
    product.isActive = false;
    await product.save();
    await expect(
      svc.createReservation(buyer._id, { productId: product._id, quantity: 1 }),
    ).rejects.toThrow(/not found/i);
  });

  test("concurrent reservations cannot oversell stock", async () => {
    const results = await Promise.allSettled([
      svc.createReservation(buyer._id, { productId: product._id, quantity: 6 }),
      svc.createReservation(buyer._id, { productId: product._id, quantity: 6 }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);

    const updated = await Product.findById(product._id);
    expect(updated.reservedStock).toBe(6);
    expect(updated.stock).toBe(10);
  });
});

describe("lifecycle: confirm -> ready -> verify pickup -> collected", () => {
  test("full happy path reduces real stock only at verified collection", async () => {
    const created = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 3,
    });

    const confirmed = await svc.confirmReservation(created._id, seller._id);
    expect(confirmed.status).toBe("confirmed");
    expect(confirmed.pickupDeadline).toBeInstanceOf(Date);

    let updated = await Product.findById(product._id);
    expect(updated.stock).toBe(10);
    expect(updated.reservedStock).toBe(3);

    const ready = await svc.markReady(created._id, seller._id);
    expect(ready.status).toBe("ready");

    const fresh = await Reservation.findById(created._id);
    const collected = await svc.verifyPickupCode(
      created._id,
      seller._id,
      codeOf(fresh),
    );
    expect(collected.status).toBe("collected");
    expect(collected.collectedAt).toBeInstanceOf(Date);

    updated = await Product.findById(product._id);
    expect(updated.stock).toBe(7);
    expect(updated.reservedStock).toBe(0);
  });

  test("a seller who doesn't own the shop cannot confirm", async () => {
    const created = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 1,
    });
    await expect(
      svc.confirmReservation(created._id, otherSeller._id),
    ).rejects.toThrow(/not authorized/i);
  });

  test("cannot mark ready before confirming", async () => {
    const created = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 1,
    });
    await expect(svc.markReady(created._id, seller._id)).rejects.toThrow(
      /only a confirmed/i,
    );
  });
});

describe("pickup code", () => {
  test("code is only shown to the buyer, only while ready, and is stable", async () => {
    const created = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 1,
    });
    let mine = await svc.getMyReservations(buyer._id);
    expect(mine.items[0].pickupCode).toBeUndefined(); // pending

    await svc.confirmReservation(created._id, seller._id);
    mine = await svc.getMyReservations(buyer._id);
    expect(mine.items[0].pickupCode).toBeUndefined(); // confirmed

    await svc.markReady(created._id, seller._id);
    const a = (await svc.getMyReservations(buyer._id)).items[0];
    const b = (await svc.getMyReservations(buyer._id)).items[0];
    expect(a.pickupCode).toMatch(/^\d{6}$/);
    expect(b.pickupCode).toBe(a.pickupCode); // stable across fetches

    // internal fields never leak
    expect(a.pickupCodeIssuedAt).toBeUndefined();
    expect(a.pickupFailedAttempts).toBeUndefined();

    // seller list never carries the code
    const sellerView = await svc.getShopReservations(shop._id, seller._id);
    expect(sellerView.items[0].pickupCode).toBeUndefined();
    expect(sellerView.items[0].toJSON().pickupCode).toBeUndefined();
  });

  test("code is not stored in the database", async () => {
    const ready = await makeReady(1);
    const raw = JSON.stringify(ready.toObject());
    expect(raw).not.toContain(codeOf(ready) + '"'); // no plaintext field
    expect(ready.pickupCodeIssuedAt).toBeInstanceOf(Date);
  });

  test("invalid code is rejected and changes nothing", async () => {
    const ready = await makeReady(3);
    const wrong = codeOf(ready) === "000000" ? "111111" : "000000";

    await expect(
      svc.verifyPickupCode(ready._id, seller._id, wrong),
    ).rejects.toThrow(/invalid pickup code/i);

    const after = await Reservation.findById(ready._id);
    expect(after.status).toBe("ready");
    expect(after.collectedAt).toBeNull();
    const p = await Product.findById(product._id);
    expect(p.stock).toBe(10);
    expect(p.reservedStock).toBe(3);
  });

  test("malformed code is rejected", async () => {
    const ready = await makeReady(1);
    await expect(
      svc.verifyPickupCode(ready._id, seller._id, "abc"),
    ).rejects.toThrow(/invalid pickup code/i);
  });

  test.each(["pending", "confirmed"])(
    "a %s reservation cannot be collected",
    async (state) => {
      const created = await svc.createReservation(buyer._id, {
        productId: product._id,
        quantity: 1,
      });
      if (state === "confirmed")
        await svc.confirmReservation(created._id, seller._id);
      await expect(
        svc.verifyPickupCode(created._id, seller._id, "123456"),
      ).rejects.toThrow(/only a ready reservation/i);
    },
  );

  test("a cancelled reservation cannot be collected", async () => {
    const ready = await makeReady(1);
    await svc.cancelReservation(ready._id, buyer._id, false, {});
    await expect(
      svc.verifyPickupCode(ready._id, seller._id, codeOf(ready)),
    ).rejects.toThrow(/only a ready reservation/i);
  });

  test("an expired reservation cannot be collected", async () => {
    const ready = await makeReady(1);
    await Reservation.updateOne(
      { _id: ready._id },
      { pickupDeadline: new Date(Date.now() - 1000) },
    );
    await expect(
      svc.verifyPickupCode(ready._id, seller._id, codeOf(ready)),
    ).rejects.toThrow(/only a ready reservation/i);
    const p = await Product.findById(product._id);
    expect(p.reservedStock).toBe(0);
    expect(p.stock).toBe(10);
  });

  test("an already collected reservation cannot be collected again", async () => {
    const ready = await makeReady(2);
    const code = codeOf(ready);
    await svc.verifyPickupCode(ready._id, seller._id, code);
    await expect(
      svc.verifyPickupCode(ready._id, seller._id, code),
    ).rejects.toThrow(/only a ready reservation/i);
    const p = await Product.findById(product._id);
    expect(p.stock).toBe(8); // decremented once only
  });

  test("the buyer (or any non-owner) cannot verify", async () => {
    const ready = await makeReady(1);
    await expect(
      svc.verifyPickupCode(ready._id, buyer._id, codeOf(ready)),
    ).rejects.toThrow(/not authorized/i);
  });

  test("another seller cannot verify this shop's reservation", async () => {
    const ready = await makeReady(1);
    await Shop.create({ shopName: "Other Shop", owner: otherSeller._id });
    await expect(
      svc.verifyPickupCode(ready._id, otherSeller._id, codeOf(ready)),
    ).rejects.toThrow(/not authorized/i);
  });

  test("two simultaneous verifications cannot double-decrement or double-notify", async () => {
    const ready = await makeReady(4);
    const code = codeOf(ready);

    const results = await Promise.allSettled([
      svc.verifyPickupCode(ready._id, seller._id, code),
      svc.verifyPickupCode(ready._id, seller._id, code),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);

    const p = await Product.findById(product._id);
    expect(p.stock).toBe(6);
    expect(p.reservedStock).toBe(0);
    expect(
      await Notification.countDocuments({ type: "reservation_collected" }),
    ).toBe(1);
  });

  test("repeated wrong codes lock verification, even for the right code", async () => {
    const ready = await makeReady(1);
    const correct = codeOf(ready);
    const wrong = correct === "000000" ? "111111" : "000000";

    for (let i = 0; i < 5; i++) {
      await expect(
        svc.verifyPickupCode(ready._id, seller._id, wrong),
      ).rejects.toThrow(/invalid pickup code/i);
    }
    await expect(
      svc.verifyPickupCode(ready._id, seller._id, correct),
    ).rejects.toThrow(/too many/i);

    const after = await Reservation.findById(ready._id);
    expect(after.status).toBe("ready");
  });

  test("variant reservation commits the correct variant's stock", async () => {
    const vp = await Product.create({
      shop: shop._id,
      name: "Shirt",
      price: 500,
      category: category._id,
      hasVariants: true,
      stock: 0,
      variants: [
        { color: "Red", size: "M", stock: 5 },
        { color: "Blue", size: "M", stock: 5 },
      ],
    });
    const redId = vp.variants[0]._id.toString();

    const ready = await makeReady(2, vp._id, { variantId: redId });
    await svc.verifyPickupCode(ready._id, seller._id, codeOf(ready));

    const after = await Product.findById(vp._id);
    expect(after.variants[0].stock).toBe(3);
    expect(after.variants[0].reservedStock).toBe(0);
    expect(after.variants[1].stock).toBe(5); // untouched
  });

  test("collected notification is sent exactly once", async () => {
    const ready = await makeReady(1);
    await svc.verifyPickupCode(ready._id, seller._id, codeOf(ready));
    expect(
      await Notification.countDocuments({ type: "reservation_collected" }),
    ).toBe(1);
  });
});

describe("rejection / cancellation release the hold", () => {
  test("seller rejecting a pending reservation releases stock", async () => {
    const created = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 5,
    });
    await svc.rejectReservation(created._id, seller._id, {
      rejectionReason: "Out of stock elsewhere",
    });

    const updated = await Product.findById(product._id);
    expect(updated.reservedStock).toBe(0);
    const reservation = await Reservation.findById(created._id);
    expect(reservation.status).toBe("cancelled");
    expect(reservation.cancelledBy).toBe("seller");
  });

  test("buyer can cancel a confirmed reservation, releasing the hold", async () => {
    const created = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 2,
    });
    await svc.confirmReservation(created._id, seller._id);

    const cancelled = await svc.cancelReservation(
      created._id,
      buyer._id,
      false,
      { reason: "Changed mind" },
    );
    expect(cancelled.status).toBe("cancelled");

    const updated = await Product.findById(product._id);
    expect(updated.reservedStock).toBe(0);
  });

  test("cannot cancel an already-collected reservation", async () => {
    const ready = await makeReady(1);
    await svc.verifyPickupCode(ready._id, seller._id, codeOf(ready));

    await expect(
      svc.cancelReservation(ready._id, buyer._id, false, {}),
    ).rejects.toThrow(/cannot be cancelled/i);
  });
});

describe("lazy expiry", () => {
  test("an overdue pending reservation is auto-expired and releases stock on next read", async () => {
    const created = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 4,
    });
    await Reservation.updateOne(
      { _id: created._id },
      { expiresAt: new Date(Date.now() - 1000) },
    );

    const { items } = await svc.getMyReservations(buyer._id);
    expect(items[0].status).toBe("expired");

    const updated = await Product.findById(product._id);
    expect(updated.reservedStock).toBe(0);
  });

  test("an overdue confirmed reservation past pickupDeadline expires too", async () => {
    const created = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 2,
    });
    await svc.confirmReservation(created._id, seller._id);
    await Reservation.updateOne(
      { _id: created._id },
      { pickupDeadline: new Date(Date.now() - 1000) },
    );

    const { items } = await svc.getShopReservations(shop._id, seller._id);
    expect(items[0].status).toBe("expired");
  });
});
