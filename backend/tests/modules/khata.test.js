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
import shopKhataRoutes from "../../modules/khata/routes/shopKhata.routes.js";
import khataRoutes from "../../modules/khata/routes/khata.routes.js";
import errorHandler from "../../middleware/errorHandler.js";
import Khata from "../../modules/khata/models/khata.model.js";

const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);
  app.use("/api/shops", shopRoutes);
  app.use("/api/shops/:shopId/khata", shopKhataRoutes);
  app.use("/api/khata", khataRoutes);
  app.use(errorHandler);
  return app;
};

const app = buildTestApp();

// Registering and then creating a shop automatically switches the account
// to "seller" (see auth.controller's updateMyRole comment: "user only
// becomes a seller through creating a shop"). Returns the agent (with the
// auth cookie already attached) plus the created shop's body.
const registerSellerWithShop = async (email, shopName) => {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({ name: "Seller", email, password: "password123" });

  const shopRes = await agent.post("/api/shops").send({ shopName });

  // Enable khata on the shop right after creation, since every test in
  // this file needs it enabled to exercise the flow.
  await agent
    .patch(`/api/shops/${shopRes.body._id}/khata/settings`)
    .send({ enabled: true });

  return { agent, shop: shopRes.body };
};

const registerBuyer = async (email) => {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({ name: "Buyer", email, password: "password123" });
  return agent;
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "7d";
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Khata module — end-to-end flow", () => {
  test("full flow: apply → approve → record payment → statement → close month", async () => {
    const { agent: sellerAgent, shop } = await registerSellerWithShop(
      "khata-seller1@example.com",
      "Khata Test Store",
    );
    const buyerAgent = await registerBuyer("khata-buyer1@example.com");

    // 1. Buyer sees the shop's khata status before applying
    const statusBefore = await buyerAgent.get(
      `/api/shops/${shop._id}/khata/status`,
    );
    expect(statusBefore.statusCode).toBe(200);
    expect(statusBefore.body.data.khataEnabled).toBe(true);
    expect(statusBefore.body.data.khata).toBeNull();

    // 2. Buyer applies
    const applyRes = await buyerAgent
      .post(`/api/shops/${shop._id}/khata/apply`)
      .send({ requestNote: "regular customer here" });
    expect(applyRes.statusCode).toBe(201);
    expect(applyRes.body.data.status).toBe("pending");

    const khataId = applyRes.body.data._id;

    // 3. Seller sees the pending request
    const listRes = await sellerAgent.get(
      `/api/shops/${shop._id}/khata?status=pending`,
    );
    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.data).toHaveLength(1);

    // 4. Seller approves with a credit limit
    const approveRes = await sellerAgent
      .patch(`/api/khata/${khataId}/approve`)
      .send({ creditLimit: 3000 });
    expect(approveRes.statusCode).toBe(200);
    expect(approveRes.body.data.status).toBe("approved");
    expect(approveRes.body.data.creditLimit).toBe(3000);

    // 5. Buyer's khata status now shows approved
    const statusAfter = await buyerAgent.get(
      `/api/shops/${shop._id}/khata/status`,
    );
    expect(statusAfter.body.data.khata.status).toBe("approved");

    // Simulate a prior khata-paid purchase — chargeKhataForOrder is only
    // ever triggered internally from order checkout (there's no direct
    // HTTP route for it), so we set the outstanding balance directly here
    // to exercise the payment endpoint realistically. Without this, any
    // payment against a khata with a zero balance is correctly rejected by
    // writeLedgerEntry's "Payment exceeds outstanding balance" guard.
    await Khata.findByIdAndUpdate(khataId, { outstandingBalance: 500 });

    // 6. Seller records a customer payment
    const paymentRes = await sellerAgent
      .post(`/api/khata/${khataId}/payments`)
      .send({ amount: 100, note: "cash received" });
    expect(paymentRes.statusCode).toBe(201);
    expect(paymentRes.body.data.amount).toBe(-100);

    // 7. Both buyer and seller can view transaction history
    const buyerHistory = await buyerAgent.get(
      `/api/khata/${khataId}/transactions?as=buyer`,
    );
    expect(buyerHistory.statusCode).toBe(200);
    expect(buyerHistory.body.data).toHaveLength(1);

    const sellerHistory = await sellerAgent.get(
      `/api/khata/${khataId}/transactions?as=seller`,
    );
    expect(sellerHistory.statusCode).toBe(200);
    expect(sellerHistory.body.data).toHaveLength(1);

    // 8. Statement for current month — only the recorded payment transaction
    // exists (the ₹500 balance was set directly, not via a transaction), so
    // totalPayments is the only figure we assert on here.
    const month = new Date().toISOString().slice(0, 7);
    const statementRes = await sellerAgent.get(
      `/api/khata/${khataId}/statement?month=${month}&as=seller`,
    );
    expect(statementRes.statusCode).toBe(200);
    expect(statementRes.body.data.totalPayments).toBe(100);

    // 9. Seller closes the month
    const closeRes = await sellerAgent
      .post(`/api/khata/${khataId}/close-month`)
      .send({ statementMonth: month });
    expect(closeRes.statusCode).toBe(201);
    expect(closeRes.body.data.statementMonth).toBe(month);
  });
});

describe("Khata module — authorization", () => {
  test("a buyer cannot approve their own khata request", async () => {
    const { shop } = await registerSellerWithShop(
      "khata-seller2@example.com",
      "Auth Test Store",
    );
    const buyerAgent = await registerBuyer("khata-buyer2@example.com");

    const applyRes = await buyerAgent
      .post(`/api/shops/${shop._id}/khata/apply`)
      .send({});
    const khataId = applyRes.body.data._id;

    const res = await buyerAgent
      .patch(`/api/khata/${khataId}/approve`)
      .send({ creditLimit: 1000 });

    expect(res.statusCode).toBe(403);
  });

  test("a seller who does not own the shop cannot approve", async () => {
    const { shop } = await registerSellerWithShop(
      "khata-seller3@example.com",
      "Owned Shop",
    );
    const { agent: otherSellerAgent } = await registerSellerWithShop(
      "khata-seller4@example.com",
      "Other Seller Shop",
    );
    const buyerAgent = await registerBuyer("khata-buyer3@example.com");

    const applyRes = await buyerAgent
      .post(`/api/shops/${shop._id}/khata/apply`)
      .send({});
    const khataId = applyRes.body.data._id;

    const res = await otherSellerAgent
      .patch(`/api/khata/${khataId}/approve`)
      .send({ creditLimit: 1000 });

    expect(res.statusCode).toBe(403);
  });

  test("unauthenticated request is rejected", async () => {
    const res = await request(app).get(`/api/khata/my`);
    expect(res.statusCode).toBe(401);
  });
});

describe("Khata module — business rules", () => {
  test("applying is rejected when shop has khata disabled", async () => {
    const sellerAgent = request.agent(app);
    await sellerAgent.post("/api/auth/register").send({
      name: "Seller",
      email: "khata-seller5@example.com",
      password: "password123",
    });
    const shopRes = await sellerAgent
      .post("/api/shops")
      .send({ shopName: "Disabled Khata Shop" });
    // Deliberately NOT enabling khata for this shop.

    const buyerAgent = await registerBuyer("khata-buyer5@example.com");

    const res = await buyerAgent
      .post(`/api/shops/${shopRes.body._id}/khata/apply`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  test("rejecting requires a rejectionReason (Zod validation)", async () => {
    const { agent: sellerAgent, shop } = await registerSellerWithShop(
      "khata-seller6@example.com",
      "Reject Reason Shop",
    );
    const buyerAgent = await registerBuyer("khata-buyer6@example.com");

    const applyRes = await buyerAgent
      .post(`/api/shops/${shop._id}/khata/apply`)
      .send({});
    const khataId = applyRes.body.data._id;

    const res = await sellerAgent
      .patch(`/api/khata/${khataId}/reject`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  test("approving requires a positive creditLimit (Zod validation)", async () => {
    const { agent: sellerAgent, shop } = await registerSellerWithShop(
      "khata-seller7@example.com",
      "Credit Limit Shop",
    );
    const buyerAgent = await registerBuyer("khata-buyer7@example.com");

    const applyRes = await buyerAgent
      .post(`/api/shops/${shop._id}/khata/apply`)
      .send({});
    const khataId = applyRes.body.data._id;

    const res = await sellerAgent
      .patch(`/api/khata/${khataId}/approve`)
      .send({ creditLimit: -500 });

    expect(res.statusCode).toBe(400);
  });
});
