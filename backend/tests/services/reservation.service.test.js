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
import * as svc from "../../services/reservation/reservation.service.js";

let seller, buyer, otherSeller, shop, category, product;

beforeAll(connectTestDB);
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
  product = await Product.create({
    shop: shop._id,
    name: "Widget",
    price: 100,
    category: category._id,
    stock: 10,
    reservationEnabled: true,
  });
});

describe("createReservation - hold semantics", () => {
  test("holds stock without reducing it", async () => {
    const r = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 4,
    });
    expect(r.status).toBe("pending");

    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(10); // unchanged
    expect(updated.reservedStock).toBe(4); // held
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

  test("rejects when product reservation is disabled", async () => {
    product.reservationEnabled = false;
    await product.save();
    await expect(
      svc.createReservation(buyer._id, { productId: product._id, quantity: 1 }),
    ).rejects.toThrow(/not available for reservation/i);
  });

  test("rejects when shop reservations are disabled", async () => {
    shop.reservationsEnabled = false;
    await shop.save();
    await expect(
      svc.createReservation(buyer._id, { productId: product._id, quantity: 1 }),
    ).rejects.toThrow(/does not offer pickup/i);
  });

  test("concurrent reservations cannot oversell stock", async () => {
    const results = await Promise.allSettled([
      svc.createReservation(buyer._id, { productId: product._id, quantity: 6 }),
      svc.createReservation(buyer._id, { productId: product._id, quantity: 6 }),
    ]);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    expect(fulfilled).toHaveLength(1); // only one of the two 6-unit holds can fit in 10

    const updated = await Product.findById(product._id);
    expect(updated.reservedStock).toBe(6);
    expect(updated.stock).toBe(10);
  });
});

describe("lifecycle: confirm -> ready -> collected", () => {
  test("full happy path reduces real stock only at collection", async () => {
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

    const collected = await svc.markCollected(created._id, seller._id);
    expect(collected.status).toBe("collected");

    updated = await Product.findById(product._id);
    expect(updated.stock).toBe(7); // permanently reduced now
    expect(updated.reservedStock).toBe(0); // hold released
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
    const created = await svc.createReservation(buyer._id, {
      productId: product._id,
      quantity: 1,
    });
    await svc.confirmReservation(created._id, seller._id);
    await svc.markReady(created._id, seller._id);
    await svc.markCollected(created._id, seller._id);

    await expect(
      svc.cancelReservation(created._id, buyer._id, false, {}),
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
