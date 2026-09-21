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
import shopLoyaltyRoutes from "../../modules/loyalty/routes/shopLoyalty.routes.js";
import loyaltyRoutes from "../../modules/loyalty/routes/loyalty.routes.js";
import errorHandler from "../../middleware/errorHandler.js";
import Order from "../../modules/order/models/order.model.js";
import { syncLoyaltyForOrder } from "../../services/loyalty/loyalty.service.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/shops/:shopId/loyalty", shopLoyaltyRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use(errorHandler);

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "7d";
  await connectTestDB();
});
afterEach(clearTestDB);
afterAll(closeTestDB);

const register = async (email) => {
  const agent = request.agent(app);
  const res = await agent
    .post("/api/auth/register")
    .send({ name: "U", email, password: "password123" });
  return { agent, id: res.body._id };
};
const program = {
  enabled: true,
  pointsPerUnit: 1,
  spendAmount: 100,
  minRedeemPoints: 50,
  rewardValue: 25,
};

const setup = async () => {
  const { agent: seller } = await register("s@x.com");
  const shop = await seller.post("/api/shops").send({ shopName: "Loyal Shop" });
  return { seller, shopId: shop.body._id };
};

describe("loyalty HTTP", () => {
  test("owner saves program; public endpoint exposes only rules", async () => {
    const { seller, shopId } = await setup();
    const put = await seller
      .put(`/api/shops/${shopId}/loyalty/program`)
      .send(program);
    expect(put.statusCode).toBe(200);
    const pub = await request(app).get(
      `/api/shops/${shopId}/loyalty/program/public`,
    );
    expect(pub.body.data.minRedeemPoints).toBe(50);
  });

  test("validation rejects a bad program; non-owner gets 403; guest gets 401", async () => {
    const { seller, shopId } = await setup();
    expect(
      (
        await seller
          .put(`/api/shops/${shopId}/loyalty/program`)
          .send({ ...program, spendAmount: 0 })
      ).statusCode,
    ).toBe(400);
    const { agent: buyer } = await register("b@x.com");
    expect(
      (await buyer.put(`/api/shops/${shopId}/loyalty/program`).send(program))
        .statusCode,
    ).toBe(403);
    expect(
      (await request(app).get(`/api/shops/${shopId}/loyalty/customers`))
        .statusCode,
    ).toBe(401);
  });

  test("buyer sees balance + can redeem; too-few points is 400", async () => {
    const { seller, shopId } = await setup();
    await seller.put(`/api/shops/${shopId}/loyalty/program`).send(program);
    const { agent: buyer, id } = await register("b2@x.com");
    await syncLoyaltyForOrder(
      await Order.create({
        buyer: id,
        shop: shopId,
        items: [],
        itemsSubtotal: 1000,
        grandTotal: 1000,
        orderStatus: "delivered",
      }),
    );

    const view = await buyer.get(`/api/loyalty/shop/${shopId}`);
    expect(view.body.data.account.balance).toBe(10);
    expect(
      (await buyer.post(`/api/loyalty/shop/${shopId}/redeem`).send({}))
        .statusCode,
    ).toBe(400);

    await syncLoyaltyForOrder(
      await Order.create({
        buyer: id,
        shop: shopId,
        items: [],
        itemsSubtotal: 5000,
        grandTotal: 5000,
        orderStatus: "delivered",
      }),
    );
    const ok = await buyer.post(`/api/loyalty/shop/${shopId}/redeem`).send({});
    expect(ok.statusCode).toBe(201);
    const hist = await buyer.get(`/api/loyalty/shop/${shopId}/transactions`);
    expect(hist.body.data.items.map((t) => t.type)).toEqual([
      "redeem",
      "earn",
      "earn",
    ]);
  });

  test("seller adjust validation + top customers", async () => {
    const { seller, shopId } = await setup();
    const { id } = await register("b3@x.com");
    expect(
      (
        await seller
          .post(`/api/shops/${shopId}/loyalty/customers/${id}/adjust`)
          .send({ points: 5 })
      ).statusCode,
    ).toBe(400); // reason missing
    expect(
      (
        await seller
          .post(`/api/shops/${shopId}/loyalty/customers/${id}/adjust`)
          .send({ points: 5, reason: "Welcome" })
      ).statusCode,
    ).toBe(201);
    const top = await seller.get(`/api/shops/${shopId}/loyalty/customers/top`);
    expect(top.body.data).toHaveLength(1);
  });
});
