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
import errorHandler from "../../middleware/errorHandler.js";

const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);
  app.use("/api/shops", shopRoutes);
  app.use(errorHandler);
  return app;
};

const app = buildTestApp();

const registerAndLogin = async (email) => {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({ name: "Seller", email, password: "password123" });
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

describe("POST /api/shops", () => {
  test("creates a shop and auto-generates a slug from the name", async () => {
    const agent = await registerAndLogin("owner1@example.com");

    const res = await agent.post("/api/shops").send({ shopName: "Cool Store" });

    expect(res.statusCode).toBe(201);
    expect(res.body.slug).toBe("cool-store");
  });

  test("auto-increments the slug when the name collides with an existing shop", async () => {
    const agentA = await registerAndLogin("ownerA@example.com");
    const agentB = await registerAndLogin("ownerB@example.com");

    const resA = await agentA
      .post("/api/shops")
      .send({ shopName: "Cool Store" });
    const resB = await agentB
      .post("/api/shops")
      .send({ shopName: "Cool Store" });

    expect(resA.body.slug).toBe("cool-store");
    expect(resB.body.slug).toBe("cool-store-1");
  });

  test("rejects creating a second shop for the same user", async () => {
    const agent = await registerAndLogin("owner2@example.com");

    await agent.post("/api/shops").send({ shopName: "First Shop" });
    const res = await agent
      .post("/api/shops")
      .send({ shopName: "Second Shop" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already have a shop/i);
  });

  test("rejects creating a shop while not logged in", async () => {
    const res = await request(app)
      .post("/api/shops")
      .send({ shopName: "No Auth Shop" });
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/shops/:slug", () => {
  test("returns the shop with a computed isOpen field", async () => {
    const agent = await registerAndLogin("owner3@example.com");
    await agent.post("/api/shops").send({ shopName: "Public Shop" });

    const res = await request(app).get("/api/shops/public-shop");

    expect(res.statusCode).toBe(200);
    expect(res.body.shopName).toBe("Public Shop");
    expect(typeof res.body.isOpen).toBe("boolean");
  });

  test("returns 404 for a slug that doesn't exist", async () => {
    const res = await request(app).get("/api/shops/does-not-exist");
    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/shops/me/slug", () => {
  test("lets the owner change their shop's custom URL", async () => {
    const agent = await registerAndLogin("owner4@example.com");
    await agent.post("/api/shops").send({ shopName: "Old Name Shop" });

    const res = await agent
      .put("/api/shops/me/slug")
      .send({ slug: "my-custom-url" });

    expect(res.statusCode).toBe(200);
    expect(res.body.slug).toBe("my-custom-url");

    const publicRes = await request(app).get("/api/shops/my-custom-url");
    expect(publicRes.statusCode).toBe(200);
  });

  test("rejects a slug that's already taken by another shop", async () => {
    const agentA = await registerAndLogin("slugA@example.com");
    const agentB = await registerAndLogin("slugB@example.com");

    await agentA.post("/api/shops").send({ shopName: "Shop A" });
    await agentB.post("/api/shops").send({ shopName: "Shop B" });

    const res = await agentB.put("/api/shops/me/slug").send({ slug: "shop-a" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already taken/i);
  });
});
