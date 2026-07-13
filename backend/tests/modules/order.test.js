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
import productRoutes from "../../modules/product/routes/product.routes.js";
import cartRoutes from "../../modules/cart/routes/cart.routes.js";
import orderRoutes from "../../modules/order/routes/order.routes.js";
import errorHandler from "../../middleware/errorHandler.js";
import Category from "../../modules/product/models/category.model.js";
import Product from "../../modules/product/models/product.model.js";
import Order from "../../modules/order/models/order.model.js";

const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);
  app.use("/api/shops", shopRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use(errorHandler);
  return app;
};

const app = buildTestApp();

const registerAndLogin = async (email) => {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({ name: "Test User", email, password: "password123" });
  return agent;
};

const shippingAddress = {
  fullName: "Test Buyer",
  phone: "9999999999",
  street: "123 Test Street",
  city: "Testville",
  state: "TS",
  pincode: "123456",
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

// Sets up: a seller with a shop, a category, and one product with a known stock level
const setupShopWithProduct = async (stock = 10) => {
  const sellerAgent = await registerAndLogin(
    `seller-${Date.now()}@example.com`,
  );
  const shopRes = await sellerAgent
    .post("/api/shops")
    .send({ shopName: `Shop ${Date.now()}` });
  const category = await Category.create({ name: `Category ${Date.now()}` });

  const productRes = await sellerAgent.post("/api/products").send({
    name: "Test Product",
    price: 100,
    category: category.slug,
    stock,
  });

  return {
    sellerAgent,
    shopId: shopRes.body._id,
    category,
    product: productRes.body,
  };
};

describe("POST /api/orders/checkout", () => {
  test("places an order, decrements stock, and empties the cart", async () => {
    const { product } = await setupShopWithProduct(10);
    const buyerAgent = await registerAndLogin("buyer1@example.com");

    await buyerAgent
      .post("/api/cart/items")
      .send({ productId: product._id, quantity: 3 });

    const checkoutRes = await buyerAgent
      .post("/api/orders/checkout")
      .send({ shippingAddress, paymentMethod: "cod" });

    expect(checkoutRes.statusCode).toBe(201);
    expect(checkoutRes.body.orders).toHaveLength(1);
    expect(checkoutRes.body.orders[0].items[0].quantity).toBe(3);

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).toBe(7); // 10 - 3

    const cartRes = await buyerAgent.get("/api/cart");
    expect(cartRes.body.items).toHaveLength(0); // cart cleared after successful checkout
  });

  test("splits a multi-vendor cart into one order per shop", async () => {
    const shopA = await setupShopWithProduct(10);
    const shopB = await setupShopWithProduct(10);
    const buyerAgent = await registerAndLogin("buyer2@example.com");

    await buyerAgent
      .post("/api/cart/items")
      .send({ productId: shopA.product._id, quantity: 1 });
    await buyerAgent
      .post("/api/cart/items")
      .send({ productId: shopB.product._id, quantity: 1 });

    const res = await buyerAgent
      .post("/api/orders/checkout")
      .send({ shippingAddress, paymentMethod: "cod" });

    expect(res.statusCode).toBe(201);
    expect(res.body.orders).toHaveLength(2); // one order per shop, not one combined order
  });

  test("rejects checkout with an empty cart", async () => {
    const buyerAgent = await registerAndLogin("buyer3@example.com");

    const res = await buyerAgent
      .post("/api/orders/checkout")
      .send({ shippingAddress, paymentMethod: "cod" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cart is empty/i);
  });

  test("rejects checkout without a complete shipping address", async () => {
    const { product } = await setupShopWithProduct(10);
    const buyerAgent = await registerAndLogin("buyer4@example.com");
    await buyerAgent
      .post("/api/cart/items")
      .send({ productId: product._id, quantity: 1 });

    const res = await buyerAgent.post("/api/orders/checkout").send({
      shippingAddress: { phone: "9999999999" }, // missing street/city
      paymentMethod: "cod",
    });

    expect(res.statusCode).toBe(400);
  });

  // This is the most important test in the suite: it verifies the rollback
  // logic in services/order.service.js actually works. We add two items from
  // two different shops to the cart, then - simulating a race condition where
  // someone else buys the last unit in between add-to-cart and checkout -
  // reduce one product's stock to less than what's in the cart. Checkout
  // should fail entirely, AND the stock it already decremented for the first
  // (successful) shop's order should be rolled back to its original value.
  test("rolls back stock and doesn't leave partial orders when checkout fails partway through", async () => {
    const shopA = await setupShopWithProduct(10);
    const shopB = await setupShopWithProduct(10);
    const buyerAgent = await registerAndLogin("buyer5@example.com");

    await buyerAgent
      .post("/api/cart/items")
      .send({ productId: shopA.product._id, quantity: 2 });
    await buyerAgent
      .post("/api/cart/items")
      .send({ productId: shopB.product._id, quantity: 2 });

    // Simulate someone else buying almost all of shop B's stock right before checkout
    await Product.findByIdAndUpdate(shopB.product._id, { stock: 1 });

    const res = await buyerAgent
      .post("/api/orders/checkout")
      .send({ shippingAddress, paymentMethod: "cod" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/insufficient stock/i);

    // Shop A's stock must be rolled back to its original value (10), not left at 8
    const shopAProduct = await Product.findById(shopA.product._id);
    expect(shopAProduct.stock).toBe(10);

    // No orders should have been created for either shop
    const orders = await Order.find({});
    expect(orders).toHaveLength(0);
  });
});

describe("PATCH /api/orders/:id/cancel", () => {
  test("cancelling an order restores stock", async () => {
    const { product } = await setupShopWithProduct(10);
    const buyerAgent = await registerAndLogin("buyer6@example.com");

    await buyerAgent
      .post("/api/cart/items")
      .send({ productId: product._id, quantity: 4 });
    const checkoutRes = await buyerAgent
      .post("/api/orders/checkout")
      .send({ shippingAddress, paymentMethod: "cod" });
    const orderId = checkoutRes.body.orders[0]._id;

    const afterCheckoutProduct = await Product.findById(product._id);
    expect(afterCheckoutProduct.stock).toBe(6); // 10 - 4

    const cancelRes = await buyerAgent
      .patch(`/api/orders/${orderId}/cancel`)
      .send({ reason: "Changed my mind" });
    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.body.orderStatus).toBe("cancelled");

    const afterCancelProduct = await Product.findById(product._id);
    expect(afterCancelProduct.stock).toBe(10); // restored
  });

  test("a buyer cannot cancel someone else's order", async () => {
    const { product } = await setupShopWithProduct(10);
    const buyerAgent = await registerAndLogin("buyer7@example.com");
    await buyerAgent
      .post("/api/cart/items")
      .send({ productId: product._id, quantity: 1 });
    const checkoutRes = await buyerAgent
      .post("/api/orders/checkout")
      .send({ shippingAddress, paymentMethod: "cod" });
    const orderId = checkoutRes.body.orders[0]._id;

    const otherBuyerAgent = await registerAndLogin("buyer8@example.com");
    const res = await otherBuyerAgent.patch(`/api/orders/${orderId}/cancel`);

    expect(res.statusCode).toBe(403);
  });
});
