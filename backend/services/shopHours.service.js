import { BadRequestError } from "../../../exceptions/ApiError.js";

/**
 * SHOP HOURS SERVICE
 * ------------------------------------------------------------------
 * Validation rules and computed logic around business hours.
 * The actual "is it open right now" calculation lives on the Shop
 * model itself (shop.isCurrentlyOpen()) since it only needs the
 * document's own data - that's a reasonable place for it. But
 * validation rules and multi-day update rules belong here, since
 * they're business rules, not data shape.
 * ------------------------------------------------------------------
 */

const VALID_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // "HH:mm" 24-hour format

/**
 * Validates and applies a batch of day updates onto a shop document's
 * businessHours. Mutates the passed-in shop document (caller saves it).
 */
export const applyBusinessHoursUpdate = (shop, updates) => {
  const daysProvided = Object.keys(updates);

  if (daysProvided.length === 0) {
    throw new BadRequestError("Provide at least one day's hours to update");
  }

  for (const day of daysProvided) {
    if (!VALID_DAYS.includes(day)) {
      throw new BadRequestError(`Invalid day: ${day}`);
    }

    const { open, close, isClosed } = updates[day];

    if (isClosed === true) {
      shop.businessHours[day].isClosed = true;
      continue;
    }

    if (open && !TIME_REGEX.test(open)) {
      throw new BadRequestError(`Invalid open time for ${day}, expected HH:mm format`);
    }
    if (close && !TIME_REGEX.test(close)) {
      throw new BadRequestError(`Invalid close time for ${day}, expected HH:mm format`);
    }

    // Business rule: close time must be after open time (same-day hours only, no overnight shops yet)
    const effectiveOpen = open || shop.businessHours[day].open;
    const effectiveClose = close || shop.businessHours[day].close;
    if (toMinutes(effectiveClose) <= toMinutes(effectiveOpen)) {
      throw new BadRequestError(`Close time must be after open time for ${day}`);
    }

    if (open) shop.businessHours[day].open = open;
    if (close) shop.businessHours[day].close = close;
    if (isClosed !== undefined) shop.businessHours[day].isClosed = isClosed;
  }

  return shop;
};

/**
 * Adds or removes a holiday date, with validation and de-duplication.
 */
export const applyHolidayDateChange = (shop, action, date) => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestError("A valid date in YYYY-MM-DD format is required");
  }
  if (!["add", "remove"].includes(action)) {
    throw new BadRequestError("Action must be either 'add' or 'remove'");
  }

  if (action === "add") {
    if (!shop.holidayDates.includes(date)) {
      shop.holidayDates.push(date);
    }
  } else {
    shop.holidayDates = shop.holidayDates.filter((d) => d !== date);
  }

  return shop;
};

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};