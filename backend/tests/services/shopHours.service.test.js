import { describe, test, expect } from "@jest/globals";
import { applyBusinessHoursUpdate, applyHolidayDateChange } from "../../services/shopHours.service.js";

const makeMockShop = () => ({
  businessHours: {
    monday: { open: "09:00", close: "21:00", isClosed: false },
    tuesday: { open: "09:00", close: "21:00", isClosed: false },
    wednesday: { open: "09:00", close: "21:00", isClosed: false },
    thursday: { open: "09:00", close: "21:00", isClosed: false },
    friday: { open: "09:00", close: "21:00", isClosed: false },
    saturday: { open: "09:00", close: "21:00", isClosed: false },
    sunday: { open: "09:00", close: "21:00", isClosed: false },
  },
  holidayDates: [],
});

describe("shopHours.service", () => {
  describe("applyBusinessHoursUpdate", () => {
    test("updates open/close time for a given day", () => {
      const shop = makeMockShop();
      applyBusinessHoursUpdate(shop, { monday: { open: "10:00", close: "18:00" } });

      expect(shop.businessHours.monday.open).toBe("10:00");
      expect(shop.businessHours.monday.close).toBe("18:00");
      expect(shop.businessHours.tuesday.open).toBe("09:00");
    });

    test("marks a day as closed", () => {
      const shop = makeMockShop();
      applyBusinessHoursUpdate(shop, { sunday: { isClosed: true } });

      expect(shop.businessHours.sunday.isClosed).toBe(true);
    });

    test("rejects an invalid day name", () => {
      const shop = makeMockShop();
      expect(() => applyBusinessHoursUpdate(shop, { funday: { open: "09:00" } })).toThrow("Invalid day");
    });

    test("rejects a badly formatted time", () => {
      const shop = makeMockShop();
      expect(() => applyBusinessHoursUpdate(shop, { monday: { open: "9am" } })).toThrow(/Invalid open time/);
    });

    test("rejects when close time is not after open time", () => {
      const shop = makeMockShop();
      expect(() => applyBusinessHoursUpdate(shop, { monday: { open: "18:00", close: "10:00" } })).toThrow(
        /Close time must be after open time/
      );
    });

    test("rejects an empty update", () => {
      const shop = makeMockShop();
      expect(() => applyBusinessHoursUpdate(shop, {})).toThrow("Provide at least one day's hours to update");
    });
  });

  describe("applyHolidayDateChange", () => {
    test("adds a new holiday date", () => {
      const shop = makeMockShop();
      applyHolidayDateChange(shop, "add", "2026-08-15");

      expect(shop.holidayDates).toContain("2026-08-15");
    });

    test("does not duplicate a date that's already a holiday", () => {
      const shop = makeMockShop();
      applyHolidayDateChange(shop, "add", "2026-08-15");
      applyHolidayDateChange(shop, "add", "2026-08-15");

      expect(shop.holidayDates.filter((d) => d === "2026-08-15")).toHaveLength(1);
    });

    test("removes a holiday date", () => {
      const shop = makeMockShop();
      shop.holidayDates = ["2026-08-15"];
      applyHolidayDateChange(shop, "remove", "2026-08-15");

      expect(shop.holidayDates).not.toContain("2026-08-15");
    });

    test("rejects an invalid date format", () => {
      const shop = makeMockShop();
      expect(() => applyHolidayDateChange(shop, "add", "15-08-2026")).toThrow(/YYYY-MM-DD/);
    });

    test("rejects an invalid action", () => {
      const shop = makeMockShop();
      expect(() => applyHolidayDateChange(shop, "delete", "2026-08-15")).toThrow(/must be either/);
    });
  });
});