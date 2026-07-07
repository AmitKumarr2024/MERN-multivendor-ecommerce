/**
 * PRICING SERVICE
 * ------------------------------------------------------------------
 * Pure business logic for price calculations. No req/res here -
 * takes plain data in, returns plain data out. This means:
 *   - It can be unit tested without spinning up Express or a DB.
 *   - It can be reused anywhere pricing math is needed: product
 *     detail page, cart, checkout, invoice generation, admin reports.
 * ------------------------------------------------------------------
 */

const DEFAULT_TAX_RATE = 0.18; // 18% GST - move to config/env if this varies by category

/**
 * Calculates the effective selling price of a product, factoring in
 * an optional discount price. Falls back to `price` if no discount set.
 */
export const getEffectivePrice = (product) => {
  if (product.discountPrice && product.discountPrice < product.price) {
    return product.discountPrice;
  }
  return product.price;
};

/**
 * Calculates discount percentage for display, e.g. "20% OFF" badge.
 */
export const getDiscountPercent = (product) => {
  const effectivePrice = getEffectivePrice(product);
  if (effectivePrice >= product.price) return 0;

  const percent = ((product.price - effectivePrice) / product.price) * 100;
  return Math.round(percent);
};

/**
 * Calculates the full price breakdown for a single line item (product + quantity).
 * This is the kind of calculation reused across cart, checkout, and invoices.
 */
export const calculateLineItemTotal = (product, quantity, taxRate = DEFAULT_TAX_RATE) => {
  const unitPrice = getEffectivePrice(product);
  const subtotal = unitPrice * quantity;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    unitPrice,
    quantity,
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};

/**
 * Calculates the grand total for a full cart/order: sum of line items,
 * plus shipping, minus any coupon discount.
 * `items` = [{ product, quantity }]
 */
export const calculateOrderTotal = (items, { shippingCost = 0, couponDiscount = 0 } = {}) => {
  const lineItems = items.map(({ product, quantity }) => calculateLineItemTotal(product, quantity));

  const itemsSubtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalTax = lineItems.reduce((sum, item) => sum + item.tax, 0);

  const grandTotal = itemsSubtotal + totalTax + shippingCost - couponDiscount;

  return {
    lineItems,
    itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    shippingCost,
    couponDiscount,
    grandTotal: Number(Math.max(grandTotal, 0).toFixed(2)), // never go negative
  };
};