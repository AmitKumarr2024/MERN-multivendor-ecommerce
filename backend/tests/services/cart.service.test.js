import { describe, test, expect, beforeAll, afterAll, afterEach } from "@jest/globals";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup/db.js";
import User from "../../modules/auth/models/auth.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import Category from "../../modules/product/models/category.model.js";
import Product from "../../modules/product/models/product.model.js";
import Cart from "../../modules/cart/models/cart.model.js";
import {
  getOrCreateCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
} from "../../services/cart.service.js";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

// Creates a real seller + shop + category + product in the in-memory DB,
// and a separate buyer user - everything cart.service actually queries.
const setupProductAndBuyer = async ({ stock = 10, isActive = true } = {}) => {
  const seller = await User.create({ name: "Seller", email: `seller-${Date.now()}@test.com`, password: "password123" });
  const shop = await Shop.create({ owner: seller._id, shopName: `Shop ${Date.now()}` });
  const category = await Category.create({ name: `Category ${Date.now()}` });
  const product = await Product.create({
    shop: shop._id,
    name: "Test Product",
    price: 100,
    category: category._id,
    stock,
    isActive,
  });
  const buyer = await User.create({ name: "Buyer", email: `buyer-${Date.now()}@test.com`, password: "password123" });

  return { buyer, product };
};

describe("cart.service", () => {
  describe("getOrCreateCart", () => {
    test("creates an empty cart the first time it's called for a user", async () => {
      const buyer = await User.create({ name: "Buyer", email: "u1@test.com", password: "password123" });

      const cart = await getOrCreateCart(buyer._id);

      expect(cart.user.toString()).toBe(buyer._id.toString());
      expect(cart.items).toHaveLength(0);
    });

    test("returns the same cart on subsequent calls, not a new one", async () => {
      const buyer = await User.create({ name: "Buyer", email: "u2@test.com", password: "password123" });

      const cartA = await getOrCreateCart(buyer._id);
      const cartB = await getOrCreateCart(buyer._id);

      expect(cartA._id.toString()).toBe(cartB._id.toString());
    });
  });

  describe("addItemToCart", () => {
    test("adds a new product to an empty cart", async () => {
      const { buyer, product } = await setupProductAndBuyer({ stock: 10 });

      const cart = await addItemToCart(buyer._id, product._id.toString(), 2);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
    });

    test("increases quantity if the product is already in the cart", async () => {
      const { buyer, product } = await setupProductAndBuyer({ stock: 10 });

      await addItemToCart(buyer._id, product._id.toString(), 2);
      const cart = await addItemToCart(buyer._id, product._id.toString(), 3);

      expect(cart.items).toHaveLength(1); // still one line item
      expect(cart.items[0].quantity).toBe(5); // 2 + 3
    });

    test("rejects a quantity of zero or less", async () => {
      const { buyer, product } = await setupProductAndBuyer();
      await expect(addItemToCart(buyer._id, product._id.toString(), 0)).rejects.toThrow(
        "Quantity must be at least 1"
      );
    });

    test("rejects adding a product that doesn't exist", async () => {
      const buyer = await User.create({ name: "Buyer", email: "u3@test.com", password: "password123" });
      const fakeProductId = "000000000000000000000000";

      await expect(addItemToCart(buyer._id, fakeProductId, 1)).rejects.toThrow(/not found/i);
    });

    test("rejects adding an inactive product", async () => {
      const { buyer, product } = await setupProductAndBuyer({ isActive: false });
      await expect(addItemToCart(buyer._id, product._id.toString(), 1)).rejects.toThrow(/not found or unavailable/i);
    });

    test("rejects when the requested quantity exceeds available stock", async () => {
      const { buyer, product } = await setupProductAndBuyer({ stock: 2 });
      await expect(addItemToCart(buyer._id, product._id.toString(), 5)).rejects.toThrow(/available/i);
    });

    test("rejects when adding more would push total quantity over stock (existing + new)", async () => {
      const { buyer, product } = await setupProductAndBuyer({ stock: 3 });

      await addItemToCart(buyer._id, product._id.toString(), 2); // 2 of 3 used
      await expect(addItemToCart(buyer._id, product._id.toString(), 2)).rejects.toThrow(/available/i); // 2+2=4 > 3
    });
  });

  describe("updateItemQuantity", () => {
    test("sets the quantity to an exact value", async () => {
      const { buyer, product } = await setupProductAndBuyer({ stock: 10 });
      await addItemToCart(buyer._id, product._id.toString(), 2);

      const cart = await updateItemQuantity(buyer._id, product._id.toString(), 7);

      expect(cart.items[0].quantity).toBe(7);
    });

    test("rejects updating an item that isn't in the cart", async () => {
      const { buyer, product } = await setupProductAndBuyer();
      await expect(updateItemQuantity(buyer._id, product._id.toString(), 3)).rejects.toThrow("Item not in cart");
    });

    test("rejects a quantity that exceeds available stock", async () => {
      const { buyer, product } = await setupProductAndBuyer({ stock: 5 });
      await addItemToCart(buyer._id, product._id.toString(), 1);

      await expect(updateItemQuantity(buyer._id, product._id.toString(), 20)).rejects.toThrow(/available/i);
    });
  });

  describe("removeItemFromCart", () => {
    test("removes the item from the cart", async () => {
      const { buyer, product } = await setupProductAndBuyer();
      await addItemToCart(buyer._id, product._id.toString(), 1);

      const cart = await removeItemFromCart(buyer._id, product._id.toString());

      expect(cart.items).toHaveLength(0);
    });

    test("does nothing if the product isn't in the cart (no error thrown)", async () => {
      const buyer = await User.create({ name: "Buyer", email: "u4@test.com", password: "password123" });
      const cart = await removeItemFromCart(buyer._id, "000000000000000000000000");

      expect(cart.items).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    test("empties all items from the cart", async () => {
      const { buyer, product } = await setupProductAndBuyer({ stock: 10 });
      await addItemToCart(buyer._id, product._id.toString(), 2);

      const cart = await clearCart(buyer._id);

      expect(cart.items).toHaveLength(0);
    });
  });
});