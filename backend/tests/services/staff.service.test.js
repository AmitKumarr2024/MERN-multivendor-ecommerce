import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "@jest/globals";
import mongoose from "mongoose";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup/db.js";
import Staff from "../../modules/staff/models/staff.model.js";
import StaffAttendance from "../../modules/staff/models/staffAttendance.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import Order from "../../modules/order/models/order.model.js";
import * as staffService from "../../services/staff/staff.service.js";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("staff.service", () => {
  let owner, otherOwner, shop, staff;

  beforeEach(async () => {
    owner = new mongoose.Types.ObjectId();
    otherOwner = new mongoose.Types.ObjectId();
    shop = await Shop.create({
      owner,
      shopName: "Test Shop",
      slug: "test-shop",
    });
    staff = await staffService.createStaff(
      shop._id,
      owner,
      {
        name: "Riya",
        role: "Tailor",
        bio: "",
        joiningDate: new Date("2026-01-01"),
      },
      null,
    );
  });

  test("blocks a non-owner from updating staff", async () => {
    await expect(
      staffService.updateStaff(staff._id, otherOwner, { name: "Hacked" }),
    ).rejects.toThrow();
  });

  test("soft-deletes on remove, preserves the document", async () => {
    await staffService.removeStaff(staff._id, owner);
    const raw = await Staff.findById(staff._id);
    expect(raw.removedAt).not.toBeNull();
    expect(raw.isActive).toBe(false);
  });

  test("removed staff is excluded from public + owner listings", async () => {
    await staffService.removeStaff(staff._id, owner);
    const publicList = await staffService.listPublicStaff(shop._id);
    const ownerList = await staffService.listStaffForOwner(shop._id, owner);
    expect(publicList.find((s) => s._id.equals(staff._id))).toBeUndefined();
    expect(ownerList.find((s) => s._id.equals(staff._id))).toBeUndefined();
  });

  test("marking attendance twice for the same day upserts, not duplicates", async () => {
    await staffService.markAttendance(staff._id, owner, {
      date: "2026-08-01",
      status: "present",
    });
    await staffService.markAttendance(staff._id, owner, {
      date: "2026-08-01",
      status: "absent",
    });
    const count = await StaffAttendance.countDocuments({ staff: staff._id });
    expect(count).toBe(1);
  });

  test("monthly attendance percentage only counts marked days", async () => {
    await staffService.markAttendance(staff._id, owner, {
      date: "2026-08-01",
      status: "present",
    });
    await staffService.markAttendance(staff._id, owner, {
      date: "2026-08-02",
      status: "present",
    });
    await staffService.markAttendance(staff._id, owner, {
      date: "2026-08-03",
      status: "absent",
    });

    const result = await staffService.getMonthlyAttendance(
      staff._id,
      owner,
      8,
      2026,
    );
    expect(result.totalWorkingDays).toBe(3);
    expect(result.presentDays).toBe(2);
    expect(result.absentDays).toBe(1);
    expect(result.attendancePercentage).toBeCloseTo(66.7, 1);
  });

  test("feedback eligibility is false without a delivered order", async () => {
    const buyer = new mongoose.Types.ObjectId();
    const result = await staffService.checkFeedbackEligibility(
      staff._id,
      buyer,
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("no_delivered_order");
  });

  test("feedback eligibility is true with a delivered order, false after feedback given", async () => {
    const buyer = new mongoose.Types.ObjectId();
    const order = await Order.create({
      buyer,
      shop: shop._id,
      orderStatus: "delivered",
      items: [],
      itemsSubtotal: 100,
      grandTotal: 100,
    });

    const before = await staffService.checkFeedbackEligibility(
      staff._id,
      buyer,
    );
    expect(before.eligible).toBe(true);

    await staffService.createStaffFeedback(staff._id, buyer, {
      orderId: order._id,
      rating: 5,
      comment: "Great!",
    });

    const after = await staffService.checkFeedbackEligibility(staff._id, buyer);
    expect(after.eligible).toBe(false);
    expect(after.reason).toBe("already_reviewed");
  });

  test("createStaffFeedback recomputes denormalized rating on Staff", async () => {
    const buyer = new mongoose.Types.ObjectId();
    const order = await Order.create({
      buyer,
      shop: shop._id,
      orderStatus: "delivered",
      items: [],
      itemsSubtotal: 100,
      grandTotal: 100,
    });
    await staffService.createStaffFeedback(staff._id, buyer, {
      orderId: order._id,
      rating: 4,
    });

    const updated = await Staff.findById(staff._id);
    expect(updated.ratingAverage).toBe(4);
    expect(updated.feedbackCount).toBe(1);
  });

  test("duplicate feedback for the same (staff, buyer, order) is rejected", async () => {
    const buyer = new mongoose.Types.ObjectId();
    const order = await Order.create({
      buyer,
      shop: shop._id,
      orderStatus: "delivered",
      items: [],
      itemsSubtotal: 100,
      grandTotal: 100,
    });
    await staffService.createStaffFeedback(staff._id, buyer, {
      orderId: order._id,
      rating: 5,
    });
    await expect(
      staffService.createStaffFeedback(staff._id, buyer, {
        orderId: order._id,
        rating: 3,
      }),
    ).rejects.toThrow();
  });

  test("staff cannot rate against an order from a different shop", async () => {
    const buyer = new mongoose.Types.ObjectId();
    const otherShop = await Shop.create({
      owner: otherOwner,
      shopName: "Other",
      slug: "other",
    });
    const order = await Order.create({
      buyer,
      shop: otherShop._id,
      orderStatus: "delivered",
      items: [],
      itemsSubtotal: 100,
      grandTotal: 100,
    });
    await expect(
      staffService.createStaffFeedback(staff._id, buyer, {
        orderId: order._id,
        rating: 5,
      }),
    ).rejects.toThrow();
  });
});
