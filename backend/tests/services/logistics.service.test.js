import { describe, test, expect, jest } from "@jest/globals";

jest.unstable_mockModule("../../modules/order/models/order.model.js", () => ({
  default: { findOne: jest.fn() },
}));
jest.unstable_mockModule("../../sockets/emit.js", () => ({
  emitOrderStatusUpdate: jest.fn(),
}));

const { handleShipmentWebhook, selectBestCourier } =
  await import("../../services/logistics/logistics.service.js");
const { default: Order } =
  await import("../../modules/order/models/order.model.js");
const { emitOrderStatusUpdate } = await import("../../sockets/emit.js");

describe("logistics.service - selectBestCourier", () => {
  // Regression test: selectBestCourier used to just return options[0], which
  // only worked if the caller had already sorted the array. Deliberately
  // passing an UNSORTED array here to make sure it computes the correct
  // answer itself rather than trusting input order.
  const unsortedOptions = [
    {
      provider: "shiprocket",
      courierName: "Delhivery Surface",
      rate: 65,
      estimatedDeliveryDays: 4,
    },
    {
      provider: "shiprocket",
      courierName: "Xpressbees Express",
      rate: 45,
      estimatedDeliveryDays: 6,
    },
    {
      provider: "shiprocket",
      courierName: "Bluedart Air",
      rate: 120,
      estimatedDeliveryDays: 2,
    },
  ];

  test("'cheapest' strategy picks the lowest rate regardless of input order", () => {
    const result = selectBestCourier(unsortedOptions, "cheapest");
    expect(result.courierName).toBe("Xpressbees Express");
    expect(result.rate).toBe(45);
  });

  test("'fastest' strategy picks the lowest estimatedDeliveryDays", () => {
    const result = selectBestCourier(unsortedOptions, "fastest");
    expect(result.courierName).toBe("Bluedart Air");
    expect(result.estimatedDeliveryDays).toBe(2);
  });

  test("defaults to 'cheapest' when no strategy is given", () => {
    const result = selectBestCourier(unsortedOptions);
    expect(result.rate).toBe(45);
  });

  test("throws when there are no options at all", () => {
    expect(() => selectBestCourier([])).toThrow(
      /No courier is currently serviceable/,
    );
  });
});

describe("logistics.service - handleShipmentWebhook", () => {
  test("maps 'delivered' shipment status to orderStatus 'delivered' and notifies buyer", async () => {
    const mockOrder = {
      buyer: "buyer-id-123",
      shipment: { awbCode: "AWB123", history: [] },
      orderStatus: "shipped",
      save: jest.fn().mockResolvedValue(true),
    };
    Order.findOne.mockResolvedValue(mockOrder);

    await handleShipmentWebhook("shiprocket", {
      awb: "AWB123",
      current_status: "Delivered",
      activity: "Package delivered",
    });

    expect(mockOrder.orderStatus).toBe("delivered");
    expect(mockOrder.shipment.status).toBe("delivered");
    expect(mockOrder.shipment.history).toHaveLength(1);
    expect(mockOrder.save).toHaveBeenCalledTimes(1);
    expect(emitOrderStatusUpdate).toHaveBeenCalledWith(
      "buyer-id-123",
      expect.objectContaining({ orderStatus: "delivered" }),
    );
  });

  test("rejects a webhook payload missing awb/status", async () => {
    await expect(handleShipmentWebhook("shiprocket", {})).rejects.toThrow(
      /awb\/status/,
    );
  });

  test("throws when no order matches the awb code", async () => {
    Order.findOne.mockResolvedValue(null);
    await expect(
      handleShipmentWebhook("shiprocket", {
        awb: "UNKNOWN",
        status: "in_transit",
      }),
    ).rejects.toThrow(/No order found/);
  });
});
