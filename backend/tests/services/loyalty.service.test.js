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
import Order from "../../modules/order/models/order.model.js";
import LoyaltyAccount from "../../modules/loyalty/models/loyaltyAccount.model.js";
import LoyaltyTransaction from "../../modules/loyalty/models/loyaltyTransaction.model.js";
import * as loyalty from "../../services/loyalty/loyalty.service.js";

let seller, other, buyer, admin, shopA, shopB;
const sellerUser = () => ({ _id: seller._id, role: "seller" });

const mkOrder = (shop, status = "delivered", amount = 1000, extra = {}) =>
  Order.create({
    buyer: buyer._id,
    shop: shop._id,
    items: [],
    itemsSubtotal: amount,
    grandTotal: amount,
    orderStatus: status,
    ...extra,
  });

const enable = (shop, owner, data = {}) =>
  loyalty.saveProgram(
    shop._id,
    { _id: owner._id, role: "seller" },
    {
      enabled: true,
      pointsPerUnit: 1,
      spendAmount: 100,
      minRedeemPoints: 50,
      rewardValue: 25,
      expiryDays: null,
      ...data,
    },
  );

const mkUser = (name, role = "buyer") =>
  User.create({
    name,
    email: `${name.replace(/\s/g, "")}@t.com`,
    password: "password123",
    role,
  });

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(async () => {
  await clearTestDB();
  seller = await mkUser("Seller One", "seller");
  other = await mkUser("Seller Two", "seller");
  buyer = await mkUser("Buyer One");
  admin = await mkUser("Admin One", "admin");
  shopA = await Shop.create({ shopName: "Shop A", owner: seller._id });
  shopB = await Shop.create({ shopName: "Shop B", owner: other._id });
});

describe("calculatePoints", () => {
  test("floors per spend unit", () => {
    const p = { enabled: true, pointsPerUnit: 2, spendAmount: 100 };
    expect(loyalty.calculatePoints(p, 250)).toBe(4);
    expect(loyalty.calculatePoints(p, 99)).toBe(0);
    expect(loyalty.calculatePoints({ ...p, enabled: false }, 1000)).toBe(0);
  });
});

describe("earning", () => {
  test("awards points on delivered orders only", async () => {
    await enable(shopA, seller);
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA, "pending"));
    expect(await LoyaltyAccount.countDocuments()).toBe(0);
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA, "delivered", 1000));
    expect((await LoyaltyAccount.findOne()).balance).toBe(10);
  });

  test("no points when program disabled or missing", async () => {
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA));
    expect(await LoyaltyAccount.countDocuments()).toBe(0);
  });

  test("same order never awards twice", async () => {
    await enable(shopA, seller);
    const order = await mkOrder(shopA);
    await loyalty.syncLoyaltyForOrder(order);
    await loyalty.syncLoyaltyForOrder(order);
    await Promise.all([
      loyalty.syncLoyaltyForOrder(order),
      loyalty.syncLoyaltyForOrder(order),
    ]);
    expect(await LoyaltyTransaction.countDocuments({ type: "earn" })).toBe(1);
    expect((await LoyaltyAccount.findOne()).balance).toBe(10);
  });
});

describe("cancel / refund", () => {
  test("cancel after delivery reverses once", async () => {
    await enable(shopA, seller);
    const order = await mkOrder(shopA);
    await loyalty.syncLoyaltyForOrder(order);
    order.orderStatus = "cancelled";
    await loyalty.syncLoyaltyForOrder(order);
    await loyalty.syncLoyaltyForOrder(order);
    const acct = await LoyaltyAccount.findOne();
    expect(acct.balance).toBe(0);
    expect(await LoyaltyTransaction.countDocuments({ type: "reversal" })).toBe(
      1,
    );
  });

  test("refunded payment reverses", async () => {
    await enable(shopA, seller);
    const order = await mkOrder(shopA);
    await loyalty.syncLoyaltyForOrder(order);
    order.paymentStatus = "refunded";
    await loyalty.syncLoyaltyForOrder(order);
    expect((await LoyaltyAccount.findOne()).balance).toBe(0);
  });

  test("cancelling an order that never earned does nothing", async () => {
    await enable(shopA, seller);
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA, "cancelled"));
    expect(await LoyaltyTransaction.countDocuments()).toBe(0);
  });

  test("reversal after spending leaves negative balance and blocks redeem", async () => {
    await enable(shopA, seller, { minRedeemPoints: 10 });
    const order = await mkOrder(shopA);
    await loyalty.syncLoyaltyForOrder(order);
    await loyalty.redeemPoints(shopA._id, buyer._id);
    order.orderStatus = "cancelled";
    await loyalty.syncLoyaltyForOrder(order);
    expect((await LoyaltyAccount.findOne()).balance).toBe(-10);
    await expect(loyalty.redeemPoints(shopA._id, buyer._id)).rejects.toThrow(
      /need/i,
    );
  });
});

describe("redeeming", () => {
  test("redeems when eligible and issues a voucher", async () => {
    await enable(shopA, seller);
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA, "delivered", 6000)); // 60 pts
    const { redemption, account } = await loyalty.redeemPoints(
      shopA._id,
      buyer._id,
    );
    expect(redemption.value).toBe(25);
    expect(redemption.code).toMatch(/^RWD-/);
    expect(account.balance).toBe(10);
    expect(account.totalRedeemed).toBe(50);
  });

  test("rejects when below the minimum", async () => {
    await enable(shopA, seller);
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA, "delivered", 1000)); // 10 pts
    await expect(loyalty.redeemPoints(shopA._id, buyer._id)).rejects.toThrow(
      /need 50/,
    );
  });

  test("points are shop-specific", async () => {
    await enable(shopA, seller);
    await enable(shopB, other);
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA, "delivered", 6000));
    await expect(loyalty.redeemPoints(shopB._id, buyer._id)).rejects.toThrow();
    const b = await loyalty.getShopLoyalty(shopB._id, buyer._id);
    expect(b.account.balance).toBe(0);
  });

  test("concurrent redeems cannot overspend", async () => {
    await enable(shopA, seller);
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA, "delivered", 6000)); // enough for exactly 1
    const results = await Promise.allSettled([
      loyalty.redeemPoints(shopA._id, buyer._id),
      loyalty.redeemPoints(shopA._id, buyer._id),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await LoyaltyAccount.findOne()).balance).toBe(10);
  });

  test("seller can fulfill a redemption once; other seller cannot", async () => {
    await enable(shopA, seller);
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA, "delivered", 6000));
    const { redemption } = await loyalty.redeemPoints(shopA._id, buyer._id);
    await expect(
      loyalty.fulfillRedemption(
        shopA._id,
        { _id: other._id, role: "seller" },
        redemption._id,
      ),
    ).rejects.toThrow(/not authorized/i);
    const done = await loyalty.fulfillRedemption(
      shopA._id,
      sellerUser(),
      redemption._id,
    );
    expect(done.status).toBe("fulfilled");
    await expect(
      loyalty.fulfillRedemption(shopA._id, sellerUser(), redemption._id),
    ).rejects.toThrow(/already/i);
  });
});

describe("expiry", () => {
  test("expired lots are removed and ledgered", async () => {
    await enable(shopA, seller, { expiryDays: 30 });
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA));
    await LoyaltyTransaction.updateOne(
      { type: "earn" },
      { expiresAt: new Date(Date.now() - 1000) },
    );
    const view = await loyalty.getShopLoyalty(shopA._id, buyer._id);
    expect(view.account.balance).toBe(0);
    expect(view.account.totalExpired).toBe(10);
    expect(await LoyaltyTransaction.countDocuments({ type: "expire" })).toBe(1);
  });
});

describe("authorization + adjustments", () => {
  test("only the owner edits the program", async () => {
    await expect(enable(shopA, other)).rejects.toThrow(/not authorized/i);
  });

  test("owner adjusts with a ledger row; cannot go negative", async () => {
    await loyalty.adjustPoints(shopA._id, sellerUser(), buyer._id, {
      points: 40,
      reason: "Goodwill",
    });
    const tx = await LoyaltyTransaction.findOne({ type: "adjust" });
    expect(String(tx.createdBy)).toBe(String(seller._id));
    await expect(
      loyalty.adjustPoints(shopA._id, sellerUser(), buyer._id, {
        points: -100,
        reason: "Too much",
      }),
    ).rejects.toThrow(/insufficient/i);
  });

  test("seller cap applies, admin bypasses it, other sellers blocked", async () => {
    await expect(
      loyalty.adjustPoints(shopA._id, sellerUser(), buyer._id, {
        points: 20000,
        reason: "Big",
      }),
    ).rejects.toThrow(/admin/i);
    await loyalty.adjustPoints(
      shopA._id,
      { _id: admin._id, role: "admin" },
      buyer._id,
      { points: 20000, reason: "Migration" },
    );
    await expect(
      loyalty.adjustPoints(
        shopA._id,
        { _id: other._id, role: "seller" },
        buyer._id,
        { points: 5, reason: "Nope" },
      ),
    ).rejects.toThrow(/not authorized/i);
  });
});

describe("customers", () => {
  test("top customers ranked by lifetime points; customer list is shop-scoped", async () => {
    await enable(shopA, seller);
    const b2 = await mkUser("Big Spender");
    await loyalty.syncLoyaltyForOrder(await mkOrder(shopA, "delivered", 1000));
    await loyalty.syncLoyaltyForOrder(
      await Order.create({
        buyer: b2._id,
        shop: shopA._id,
        items: [],
        itemsSubtotal: 9000,
        grandTotal: 9000,
        orderStatus: "delivered",
      }),
    );
    const top = await loyalty.getTopCustomers(shopA._id, sellerUser());
    expect(top[0].buyer.name).toBe("Big Spender");
    const list = await loyalty.listShopCustomers(shopA._id, sellerUser(), {
      search: "big",
    });
    expect(list.items).toHaveLength(1);
    expect(list.summary.customers).toBe(2);
    await expect(
      loyalty.listShopCustomers(shopA._id, { _id: other._id, role: "seller" }),
    ).rejects.toThrow(/not authorized/i);
  });
});
