import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup/db.js";
import User from "../../modules/auth/models/auth.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import Category from "../../modules/product/models/category.model.js";
import Product from "../../modules/product/models/product.model.js";
import Cart from "../../modules/cart/models/cart.model.js";
import Order from "../../modules/order/models/order.model.js";
import { checkoutCart, cancelOrder } from "../../services/order.service.js";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

const shippingAddress = {
  fullName: "Test Buyer",
  phone: "9999999999",
  street: "123 Test Street",
  city: "Testville",
  state: "TS",
  pincode: "123456",
};

// Creates a real shop + product with a given stock level
const createShopWithProduct = async ({ stock = 10, price = 100 } = {}) => {
  const seller = await User.create({
    name: "Seller",
    email: `seller-${Date.now()}-${Math.random()}@test.com`,
    password: "password123",
  });
  const shop = await Shop.create({
    owner: seller._id,
    shopName: `Shop ${Date.now()}-${Math.random()}`,
  });
  const category = await Category.create({
    name: `Category ${Date.now()}-${Math.random()}`,
  });
  const product = await Product.create({
    shop: shop._id,
    name: "Test Product",
    price,
    category: category._id,
    stock,
  });

  return { seller, shop, product };
};

const createBuyerWithCart = async (items) => {
  const buyer = await User.create({
    name: "Buyer",
    email: `buyer-${Date.now()}-${Math.random()}@test.com`,
    password: "password123",
  });
  await Cart.create({ user: buyer._id, items });
  return buyer;
};

describe("order.service - checkoutCart", () => {
  test("creates an order, decrements stock, and empties the cart", async () => {
    const { shop, product } = await createShopWithProduct({ stock: 10 });
    const buyer = await createBuyerWithCart([
      { product: product._id, quantity: 3 },
    ]);

    const orders = await checkoutCart(buyer._id, {
      shippingAddress,
      paymentMethod: "cod",
    });

    expect(orders).toHaveLength(1);
    expect(orders[0].shop.toString()).toBe(shop._id.toString());
    expect(orders[0].items[0].quantity).toBe(3);
    expect(orders[0].grandTotal).toBeGreaterThan(0);

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).toBe(7); // 10 - 3

    const cart = await Cart.findOne({ user: buyer._id });
    expect(cart.items).toHaveLength(0);
  });

  test("splits a multi-vendor cart into one order per shop", async () => {
    const shopA = await createShopWithProduct({ stock: 10 });
    const shopB = await createShopWithProduct({ stock: 10 });
    const buyer = await createBuyerWithCart([
      { product: shopA.product._id, quantity: 1 },
      { product: shopB.product._id, quantity: 2 },
    ]);

    const orders = await checkoutCart(buyer._id, {
      shippingAddress,
      paymentMethod: "cod",
    });

    expect(orders).toHaveLength(2);
    const shopIds = orders.map((o) => o.shop.toString()).sort();
    expect(shopIds).toEqual(
      [shopA.shop._id.toString(), shopB.shop._id.toString()].sort(),
    );
  });

  test("throws when the cart is empty", async () => {
    const buyer = await User.create({
      name: "Buyer",
      email: "empty-cart@test.com",
      password: "password123",
    });

    await expect(checkoutCart(buyer._id, { shippingAddress })).rejects.toThrow(
      "Your cart is empty",
    );
  });

  test("throws when there's no cart at all for the user", async () => {
    const buyer = await User.create({
      name: "Buyer",
      email: "no-cart@test.com",
      password: "password123",
    });

    await expect(checkoutCart(buyer._id, { shippingAddress })).rejects.toThrow(
      "Your cart is empty",
    );
  });

  test("throws when shipping address is incomplete", async () => {
    const { product } = await createShopWithProduct({ stock: 10 });
    const buyer = await createBuyerWithCart([
      { product: product._id, quantity: 1 },
    ]);

    await expect(
      checkoutCart(buyer._id, { shippingAddress: { phone: "9999999999" } }), // missing street/city
    ).rejects.toThrow(/shipping address/i);
  });

  test("throws when requested quantity exceeds current stock", async () => {
    const { product } = await createShopWithProduct({ stock: 2 });
    const buyer = await createBuyerWithCart([
      { product: product._id, quantity: 5 },
    ]);

    await expect(checkoutCart(buyer._id, { shippingAddress })).rejects.toThrow(
      /insufficient stock/i,
    );
  });

  // The most important test: verifies the manual rollback logic actually
  // restores stock and removes partially-created orders when checkout fails
  // partway through a multi-shop cart.
  test("rolls back stock and deletes partial orders if checkout fails partway through", async () => {
    const shopA = await createShopWithProduct({ stock: 10 });
    const shopB = await createShopWithProduct({ stock: 10 });
    const buyer = await createBuyerWithCart([
      { product: shopA.product._id, quantity: 2 },
      { product: shopB.product._id, quantity: 2 },
    ]);

    // Simulate someone else buying shop B's stock down to 1 right before this checkout runs
    await Product.findByIdAndUpdate(shopB.product._id, { stock: 1 });

    await expect(checkoutCart(buyer._id, { shippingAddress })).rejects.toThrow(
      /insufficient stock/i,
    );

    // Shop A's stock must be restored to its original value, not left decremented
    const shopAProduct = await Product.findById(shopA.product._id);
    expect(shopAProduct.stock).toBe(10);

    // No Order documents should exist for either shop
    const orders = await Order.find({});
    expect(orders).toHaveLength(0);

    // The cart should NOT have been cleared, since checkout didn't actually succeed
    const cart = await Cart.findOne({ user: buyer._id });
    expect(cart.items).toHaveLength(2);
  });

  test("throws when a product in the cart has been deactivated since it was added", async () => {
    const { product } = await createShopWithProduct({ stock: 10 });
    const buyer = await createBuyerWithCart([
      { product: product._id, quantity: 1 },
    ]);

    await Product.findByIdAndUpdate(product._id, { isActive: false });

    await expect(checkoutCart(buyer._id, { shippingAddress })).rejects.toThrow(
      /no longer available/i,
    );
  });
});

describe("order.service - cancelOrder", () => {
  test("restores stock and marks the order cancelled", async () => {
    const { product } = await createShopWithProduct({ stock: 10 });
    const buyer = await createBuyerWithCart([
      { product: product._id, quantity: 4 },
    ]);

    const [order] = await checkoutCart(buyer._id, { shippingAddress });
    const afterCheckoutProduct = await Product.findById(product._id);
    expect(afterCheckoutProduct.stock).toBe(6);

    const cancelled = await cancelOrder(order, "Changed my mind");

    expect(cancelled.orderStatus).toBe("cancelled");
    expect(cancelled.cancelReason).toBe("Changed my mind");
    expect(cancelled.stockRestored).toBe(true);

    const afterCancelProduct = await Product.findById(product._id);
    expect(afterCancelProduct.stock).toBe(10); // fully restored
  });

  test("uses a default cancel reason when none is given", async () => {
    const { product } = await createShopWithProduct({ stock: 10 });
    const buyer = await createBuyerWithCart([
      { product: product._id, quantity: 1 },
    ]);

    const [order] = await checkoutCart(buyer._id, { shippingAddress });
    const cancelled = await cancelOrder(order);

    expect(cancelled.cancelReason).toBe("Cancelled by user");
  });

  test("refuses to cancel an order that's already shipped", async () => {
    const { product } = await createShopWithProduct({ stock: 10 });
    const buyer = await createBuyerWithCart([
      { product: product._id, quantity: 1 },
    ]);

    const [order] = await checkoutCart(buyer._id, { shippingAddress });
    order.orderStatus = "shipped";
    await order.save();

    await expect(cancelOrder(order)).rejects.toThrow(/cannot be cancelled/i);
  });

  test("refuses to cancel an already-cancelled order", async () => {
    const { product } = await createShopWithProduct({ stock: 10 });
    const buyer = await createBuyerWithCart([
      { product: product._id, quantity: 1 },
    ]);

    const [order] = await checkoutCart(buyer._id, { shippingAddress });
    await cancelOrder(order);

    await expect(cancelOrder(order)).rejects.toThrow(/cannot be cancelled/i);
  });
});
