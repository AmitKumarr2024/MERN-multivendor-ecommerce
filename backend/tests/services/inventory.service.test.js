import { describe, test, expect, jest as jestGlobal } from "@jest/globals";
import {
  setStock,
  decrementStock,
  restoreStock,
  canFulfill,
  LOW_STOCK_THRESHOLD,
} from "../../services/inventory.service.js";

const makeMockProduct = (overrides = {}) => ({
  name: "Test Product",
  stock: 10,
  isActive: true,
  save: jestGlobal.fn().mockResolvedValue(true),
  ...overrides,
});

describe("inventory.service", () => {
  describe("setStock", () => {
    test("sets stock to the given value and saves", async () => {
      const product = makeMockProduct();
      const result = await setStock(product, 25);

      expect(product.stock).toBe(25);
      expect(product.save).toHaveBeenCalledTimes(1);
      expect(result.isLowStock).toBe(false);
      expect(result.isOutOfStock).toBe(false);
    });

    test("flags isLowStock when stock is at or below the threshold", async () => {
      const product = makeMockProduct();
      const result = await setStock(product, LOW_STOCK_THRESHOLD);

      expect(result.isLowStock).toBe(true);
    });

    test("flags isOutOfStock when stock is set to 0", async () => {
      const product = makeMockProduct();
      const result = await setStock(product, 0);

      expect(result.isOutOfStock).toBe(true);
      expect(result.isLowStock).toBe(false);
    });

    test("rejects a negative stock value", async () => {
      const product = makeMockProduct();
      await expect(setStock(product, -5)).rejects.toThrow(
        "Stock must be a non-negative number",
      );
    });
  });

  describe("decrementStock", () => {
    test("reduces stock by the given quantity", async () => {
      const product = makeMockProduct({ stock: 10 });
      await decrementStock(product, 3);

      expect(product.stock).toBe(7);
      expect(product.save).toHaveBeenCalledTimes(1);
    });

    test("throws when there isn't enough stock", async () => {
      const product = makeMockProduct({ stock: 2, name: "Rare Item" });
      await expect(decrementStock(product, 5)).rejects.toThrow(
        /Insufficient stock/,
      );
    });

    test("rejects a zero or negative quantity", async () => {
      const product = makeMockProduct();
      await expect(decrementStock(product, 0)).rejects.toThrow(
        "Quantity must be greater than zero",
      );
    });
  });

  describe("restoreStock", () => {
    test("adds the quantity back to stock", async () => {
      const product = makeMockProduct({ stock: 5 });
      await restoreStock(product, 3);

      expect(product.stock).toBe(8);
    });
  });

  describe("canFulfill", () => {
    test("returns true when product is active and has enough stock", () => {
      const product = makeMockProduct({ stock: 10, isActive: true });
      expect(canFulfill(product, 5)).toBe(true);
    });

    test("returns false when requested quantity exceeds stock", () => {
      const product = makeMockProduct({ stock: 2 });
      expect(canFulfill(product, 5)).toBe(false);
    });

    test("returns false when product is inactive, even with enough stock", () => {
      const product = makeMockProduct({ stock: 10, isActive: false });
      expect(canFulfill(product, 5)).toBe(false);
    });
  });
});
