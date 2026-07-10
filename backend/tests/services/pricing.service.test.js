import { describe, test, expect } from "@jest/globals";
import {
  getEffectivePrice,
  getDiscountPercent,
  calculateLineItemTotal,
  calculateOrderTotal,
} from "../../services/pricing.service.js";

describe("pricing.service", () => {
  describe("getEffectivePrice", () => {
    test("returns discountPrice when it's lower than price", () => {
      const product = { price: 100, discountPrice: 80 };
      expect(getEffectivePrice(product)).toBe(80);
    });

    test("returns price when no discountPrice is set", () => {
      const product = { price: 100, discountPrice: null };
      expect(getEffectivePrice(product)).toBe(100);
    });

    test("ignores discountPrice if it's not actually lower than price", () => {
      const product = { price: 100, discountPrice: 120 };
      expect(getEffectivePrice(product)).toBe(100);
    });
  });

  describe("getDiscountPercent", () => {
    test("calculates a 20% discount correctly", () => {
      const product = { price: 100, discountPrice: 80 };
      expect(getDiscountPercent(product)).toBe(20);
    });

    test("returns 0 when there is no discount", () => {
      const product = { price: 100, discountPrice: null };
      expect(getDiscountPercent(product)).toBe(0);
    });

    test("rounds to the nearest whole percent", () => {
      const product = { price: 99, discountPrice: 66 };
      expect(getDiscountPercent(product)).toBe(33);
    });
  });

  describe("calculateLineItemTotal", () => {
    test("calculates subtotal, tax, and total for a quantity", () => {
      const product = { price: 100, discountPrice: null };
      const result = calculateLineItemTotal(product, 2, 0.18);

      expect(result.unitPrice).toBe(100);
      expect(result.subtotal).toBe(200);
      expect(result.tax).toBe(36);
      expect(result.total).toBe(236);
    });

    test("uses the discounted price when calculating", () => {
      const product = { price: 100, discountPrice: 50 };
      const result = calculateLineItemTotal(product, 1, 0.1);

      expect(result.subtotal).toBe(50);
      expect(result.tax).toBe(5);
    });
  });

  describe("calculateOrderTotal", () => {
    test("sums multiple line items plus shipping, minus a coupon discount", () => {
      const items = [
        { product: { price: 100, discountPrice: null }, quantity: 1 },
        { product: { price: 50, discountPrice: null }, quantity: 2 },
      ];

      const result = calculateOrderTotal(items, {
        shippingCost: 20,
        couponDiscount: 10,
      });

      expect(result.itemsSubtotal).toBe(200);
      expect(result.shippingCost).toBe(20);
      expect(result.couponDiscount).toBe(10);
      expect(result.grandTotal).toBeGreaterThan(0);
    });

    test("never returns a negative grand total even with a huge coupon", () => {
      const items = [
        { product: { price: 10, discountPrice: null }, quantity: 1 },
      ];
      const result = calculateOrderTotal(items, { couponDiscount: 9999 });

      expect(result.grandTotal).toBe(0);
    });
  });
});
