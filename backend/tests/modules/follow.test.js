import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup/db.js";
import authRoutes from "../../modules/auth/routes/auth.routes.js";
import shopRoutes from "../../modules/shop/routes/shop.routes.js";
import followRoutes from "../../modules/follow/routes/follow.routes.js";
import shopCustomersRoutes from "../../modules/follow/routes/shopCustomers.routes.js";
import errorHandler from "../../middleware/errorHandler.js";
import Order from "../../modules/order/models/order.model.js";
import { classifyCustomer } from "../../services/follow/customerStats.service.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/shops/:shopId/customers", shopCustomersRoutes);
app.use("/api/follows", followRoutes);
app.use(errorHandler);

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "7d";
  await connectTestDB();
});
afterEach(clearTestDB);
afterAll(closeTestDB);

const register = async (email, name = "User") => {
  const agent = request.agent(app);
  const res = await agent
    .post("/api/auth/register")
    .send({ name, email, password: "password123" });
  return { agent, id: res.body._id };
};

const setupSeller = async (
  email = "seller@x.com",
  shopName = "Seller Shop",
) => {
  const { agent } = await register(email, "Seller");
  const shop = await agent.post("/api/shops").send({ shopName });
  return { agent, shopId: shop.body._id };
};

const makeOrder = (
  shop,
  buyer,
  status = "delivered",
  daysAgo = 1,
  total = 100,
) =>
  Order.create({
    buyer,
    shop,
    items: [],
    itemsSubtotal: total,
    grandTotal: total,
    orderStatus: status,
    createdAt: new Date(Date.now() - daysAgo * 86400000),
  });

describe("classifyCustomer (pure)", () => {
  test("1 order -> new", () =>
    expect(
      classifyCustomer({
        orderCount: 1,
        recentOrderCount: 1,
        recentDeliveredCount: 1,
      }),
    ).toBe("new"));
  test("2 orders -> returning", () =>
    expect(
      classifyCustomer({
        orderCount: 2,
        recentOrderCount: 2,
        recentDeliveredCount: 2,
      }),
    ).toBe("returning"));
  test("3 recent orders, 2 delivered -> regular", () =>
    expect(
      classifyCustomer({
        orderCount: 3,
        recentOrderCount: 3,
        recentDeliveredCount: 2,
      }),
    ).toBe("regular"));
  test("3 recent orders but only 1 delivered -> returning", () =>
    expect(
      classifyCustomer({
        orderCount: 3,
        recentOrderCount: 3,
        recentDeliveredCount: 1,
      }),
    ).toBe("returning"));
  test("old history without recent activity -> returning", () =>
    expect(
      classifyCustomer({
        orderCount: 5,
        recentOrderCount: 1,
        recentDeliveredCount: 1,
      }),
    ).toBe("returning"));
});

describe("follow / unfollow", () => {
  test("buyer can follow, is idempotent, and can unfollow", async () => {
    const { shopId } = await setupSeller();
    const { agent: buyer } = await register("b@x.com");

    const first = await buyer.post(`/api/follows/shop/${shopId}`);
    expect(first.statusCode).toBe(201);
    expect(first.body.data).toEqual({ following: true, followerCount: 1 });

    const again = await buyer.post(`/api/follows/shop/${shopId}`);
    expect(again.body.data.followerCount).toBe(1); // no duplicate

    const status = await buyer.get(`/api/follows/shop/${shopId}/status`);
    expect(status.body.data.following).toBe(true);

    const un = await buyer.delete(`/api/follows/shop/${shopId}`);
    expect(un.body.data).toEqual({ following: false, followerCount: 0 });
  });

  test("owner cannot follow own shop", async () => {
    const { agent, shopId } = await setupSeller();
    const res = await agent.post(`/api/follows/shop/${shopId}`);
    expect(res.statusCode).toBe(400);
  });

  test("requires login and a valid id", async () => {
    const { shopId } = await setupSeller();
    expect(
      (await request(app).post(`/api/follows/shop/${shopId}`)).statusCode,
    ).toBe(401);
    const { agent } = await register("b2@x.com");
    expect((await agent.post("/api/follows/shop/not-an-id")).statusCode).toBe(
      400,
    );
  });

  test("lists followed shops, newest first", async () => {
    const a = await setupSeller("a@x.com", "Shop A");
    const b = await setupSeller("b@x.com", "Shop B");
    const { agent } = await register("buyer@x.com");
    await agent.post(`/api/follows/shop/${a.shopId}`);
    await agent.post(`/api/follows/shop/${b.shopId}`);

    const res = await agent.get("/api/follows/me");
    expect(res.body.data.items.map((i) => i.shop.shopName)).toEqual([
      "Shop B",
      "Shop A",
    ]);
    expect(res.body.data.items[0].shop.businessHours).toBeUndefined();
  });

  test("public stats expose only counts", async () => {
    const { shopId } = await setupSeller();
    const { agent, id } = await register("b3@x.com");
    await agent.post(`/api/follows/shop/${shopId}`);
    await makeOrder(shopId, id);

    const res = await request(app).get(`/api/follows/shop/${shopId}/stats`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual({ followerCount: 1, customerCount: 1 });
  });
});

describe("GET /api/shops/:shopId/customers", () => {
  test("segments customers from order history; cancelled orders ignored", async () => {
    const { agent: seller, shopId } = await setupSeller();
    const newC = await register("new@x.com", "Newbie");
    const retC = await register("ret@x.com", "Returner");
    const regC = await register("reg@x.com", "Regular Ram");
    const ghost = await register("ghost@x.com", "Cancelled Only");

    await makeOrder(shopId, newC.id, "pending", 2);
    await makeOrder(shopId, retC.id, "delivered", 400);
    await makeOrder(shopId, retC.id, "delivered", 300);
    await makeOrder(shopId, regC.id, "delivered", 30, 200);
    await makeOrder(shopId, regC.id, "delivered", 20, 300);
    await makeOrder(shopId, regC.id, "pending", 5, 100);
    await makeOrder(shopId, ghost.id, "cancelled", 1);

    const res = await seller.get(`/api/shops/${shopId}/customers`);
    expect(res.statusCode).toBe(200);
    const { summary, items } = res.body.data;
    expect(summary).toMatchObject({
      total: 3,
      new: 1,
      returning: 1,
      regular: 1,
    });
    const reg = items.find((c) => c.name === "Regular Ram");
    expect(reg).toMatchObject({
      segment: "regular",
      orderCount: 3,
      totalSpent: 600,
    });
    expect(items.find((c) => c.name === "Cancelled Only")).toBeUndefined();

    const onlyRegular = await seller.get(
      `/api/shops/${shopId}/customers?segment=regular`,
    );
    expect(onlyRegular.body.data.items).toHaveLength(1);
  });

  test("following alone does not make someone a customer or regular", async () => {
    const { agent: seller, shopId } = await setupSeller();
    const { agent: fan } = await register("fan@x.com");
    await fan.post(`/api/follows/shop/${shopId}`);

    const res = await seller.get(`/api/shops/${shopId}/customers`);
    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.data.summary.followers).toBe(1);
  });

  test("other sellers, buyers and guests are rejected", async () => {
    const { shopId } = await setupSeller();
    const other = await setupSeller("other@x.com", "Other Shop");
    const { agent: buyer } = await register("buyer9@x.com");

    expect(
      (await other.agent.get(`/api/shops/${shopId}/customers`)).statusCode,
    ).toBe(403);
    expect((await buyer.get(`/api/shops/${shopId}/customers`)).statusCode).toBe(
      403,
    );
    expect(
      (await request(app).get(`/api/shops/${shopId}/customers`)).statusCode,
    ).toBe(401);
  });
});
