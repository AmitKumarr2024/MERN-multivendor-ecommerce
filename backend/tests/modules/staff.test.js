import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup/db.js";
import User from "../../modules/auth/models/auth.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import generateToken from "../../utils/generateToken.js";
import shopStaffRoutes from "../../modules/staff/routes/shopStaff.routes.js";
import staffRoutes from "../../modules/staff/routes/staff.routes.js";
import errorHandler from "../../middleware/errorHandler.js";

const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/shops/:shopId/staff", shopStaffRoutes);
  app.use("/api/staff", staffRoutes);
  app.use(errorHandler);
  return app;
};

const app = buildTestApp();

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

describe("Staff routes", () => {
  let owner, ownerToken, shop;

  beforeEach(async () => {
    owner = await User.create({
      name: "Seller Owner",
      email: `owner-${Date.now()}@test.com`,
      password: "password123",
      role: "seller",
    });
    ownerToken = generateToken(owner._id, owner.role);
    shop = await Shop.create({
      owner: owner._id,
      shopName: "Shop",
      slug: "shop",
    });
  });

  test("POST /api/shops/:shopId/staff creates a staff member", async () => {
    const res = await request(app)
      .post(`/api/shops/${shop._id}/staff`)
      .set("Cookie", [`token=${ownerToken}`])
      .field("name", "Aman")
      .field("role", "Delivery Lead")
      .field("joiningDate", "2026-01-01");

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Aman");
  });

  test("GET /api/shops/:shopId/staff/public excludes inactive staff", async () => {
    const created = await request(app)
      .post(`/api/shops/${shop._id}/staff`)
      .set("Cookie", [`token=${ownerToken}`])
      .field("name", "Aman")
      .field("role", "Lead")
      .field("joiningDate", "2026-01-01");

    await request(app)
      .patch(`/api/staff/${created.body.data._id}/status`)
      .set("Cookie", [`token=${ownerToken}`])
      .send({ isActive: false });

    const res = await request(app).get(`/api/shops/${shop._id}/staff/public`);
    expect(
      res.body.data.find((s) => s._id === created.body.data._id),
    ).toBeUndefined();
  });

  test("GET /api/staff/:id/attendance is rejected without auth", async () => {
    const res = await request(app).get(
      `/api/staff/${new mongoose.Types.ObjectId()}/attendance?month=8&year=2026`,
    );
    expect(res.status).toBe(401);
  });

  test("a different seller cannot mark attendance for staff they don't own", async () => {
    const created = await request(app)
      .post(`/api/shops/${shop._id}/staff`)
      .set("Cookie", [`token=${ownerToken}`])
      .field("name", "Aman")
      .field("role", "Lead")
      .field("joiningDate", "2026-01-01");

    const otherUser = await User.create({
      name: "Other Seller",
      email: `other-${Date.now()}@test.com`,
      password: "password123",
      role: "seller",
    });
    const otherToken = generateToken(otherUser._id, otherUser.role);

    const res = await request(app)
      .post(`/api/staff/${created.body.data._id}/attendance`)
      .set("Cookie", [`token=${otherToken}`])
      .send({ date: "2026-08-01", status: "present" });

    expect(res.status).toBe(403);
  });
});
