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
import authRoutes from "../../modules/auth/auth.routes.js";
import shopRoutes from "../../modules/shop/routes/shop.routes.js";
import productRoutes from "../../modules/product/routes/product.routes.js";
import errorHandler from "../../middleware/errorHandler.js";
import Category from "../../modules/product/models/category.model.js";

const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);
  app.use("/api/shops", shopRoutes);
  app.use("/api/products", productRoutes);
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

// Category creation is admin-only via the API, so for test setup we insert
// one directly through the model - a normal, accepted way to arrange
// unrelated setup data without needing a full admin auth flow in every test.
const createTestCategory = async (name = "Electronics") => {
  return Category.create({ name });
};

let sellerAgent;
let shopId;
let category;

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

const setupSellerWithShop = async () => {
  const agent = await registerAndLogin("productSeller@example.com");
  const shopRes = await agent
    .post("/api/shops")
    .send({ shopName: "Product Test Shop" });
  const cat = await createTestCategory();
  return { agent, shopId: shopRes.body._id, category: cat };
};

describe("POST /api/products", () => {
  test("creates a product for the seller's own shop", async () => {
    const { agent, category } = await setupSellerWithShop();

    const res = await agent.post("/api/products").send({
      name: "Wireless Mouse",
      price: 999,
      category: category.slug,
      stock: 20,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Wireless Mouse");
    expect(res.body.stock).toBe(20);
  });

  test("rejects product creation if the seller has no shop yet", async () => {
    const agent = await registerAndLogin("noShopSeller@example.com");
    const category = await createTestCategory();

    const res = await agent.post("/api/products").send({
      name: "No Shop Product",
      price: 100,
      category: category.slug,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/create your shop/i);
  });

  test("rejects a category slug that doesn't exist", async () => {
    const { agent } = await setupSellerWithShop();

    const res = await agent.post("/api/products").send({
      name: "Bad Category Product",
      price: 100,
      category: "this-slug-does-not-exist",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid category/i);
  });
});

describe("GET /api/products", () => {
  test("lists products with populated shop info (for the supplier -> dukan redirect)", async () => {
    const { agent, category } = await setupSellerWithShop();
    await agent
      .post("/api/products")
      .send({ name: "Keyboard", price: 1500, category: category.slug });

    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].shop.slug).toBe("product-test-shop");
  });
});

describe("GET /api/products/:id", () => {
  test("includes computed effectivePrice and discountPercent", async () => {
    const { agent, category } = await setupSellerWithShop();
    const createRes = await agent.post("/api/products").send({
      name: "Discounted Item",
      price: 100,
      discountPrice: 80,
      category: category.slug,
    });

    const res = await request(app).get(`/api/products/${createRes.body._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.effectivePrice).toBe(80);
    expect(res.body.discountPercent).toBe(20);
  });
});

describe("PUT /api/products/:id and DELETE /api/products/:id", () => {
  test("prevents a seller from editing another seller's product", async () => {
    const { agent: ownerAgent, category } = await setupSellerWithShop();
    const createRes = await ownerAgent
      .post("/api/products")
      .send({ name: "Owner's Item", price: 100, category: category.slug });

    const otherAgent = await registerAndLogin("otherSeller@example.com");
    await otherAgent.post("/api/shops").send({ shopName: "Other Shop" });

    const res = await otherAgent
      .put(`/api/products/${createRes.body._id}`)
      .send({ price: 1 });

    expect(res.statusCode).toBe(403);
  });

  test("allows the owning seller to delete their own product", async () => {
    const { agent, category } = await setupSellerWithShop();
    const createRes = await agent
      .post("/api/products")
      .send({ name: "Deletable Item", price: 50, category: category.slug });

    const res = await agent.delete(`/api/products/${createRes.body._id}`);

    expect(res.statusCode).toBe(200);

    const getRes = await request(app).get(
      `/api/products/${createRes.body._id}`,
    );
    expect(getRes.statusCode).toBe(404);
  });
});
