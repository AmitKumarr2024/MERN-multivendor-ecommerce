import Staff from "../../modules/staff/models/staff.model.js";
import StaffAttendance from "../../modules/staff/models/staffAttendance.model.js";
import StaffFeedback from "../../modules/staff/models/staffFeedback.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import Order from "../../modules/order/models/order.model.js";
import { ApiError } from "../../exceptions/ApiError.js";
import { createNotification } from "../../services/notification.service.js";

async function assertShopOwnership(shopId, userId) {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, "Shop not found");
  if (shop.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not own this shop");
  }
  return shop;
}

async function getStaffOr404(staffId) {
  const staff = await Staff.findById(staffId);
  if (!staff || staff.isRemoved()) throw new ApiError(404, "Staff not found");
  return staff;
}

async function assertStaffOwnership(staffId, userId) {
  const staff = await getStaffOr404(staffId);
  await assertShopOwnership(staff.shop, userId);
  return staff;
}

export async function createStaff(shopId, ownerId, data, photo) {
  await assertShopOwnership(shopId, ownerId);
  const staff = await Staff.create({
    shop: shopId,
    name: data.name,
    role: data.role,
    bio: data.bio,
    joiningDate: data.joiningDate,
    profilePhoto: photo
      ? { url: photo.url, publicId: photo.publicId }
      : { url: null, publicId: null },
  });
  return staff;
}

export async function updateStaff(staffId, ownerId, data, photo) {
  const staff = await assertStaffOwnership(staffId, ownerId);

  if (photo) {
    staff.profilePhoto = { url: photo.url, publicId: photo.publicId };
  }

  Object.assign(staff, {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.role !== undefined && { role: data.role }),
    ...(data.bio !== undefined && { bio: data.bio }),
    ...(data.joiningDate !== undefined && { joiningDate: data.joiningDate }),
  });

  await staff.save();
  return staff;
}

export async function setStaffStatus(staffId, ownerId, isActive) {
  const staff = await assertStaffOwnership(staffId, ownerId);
  staff.isActive = isActive;
  await staff.save();
  return staff;
}

export async function removeStaff(staffId, ownerId) {
  const staff = await assertStaffOwnership(staffId, ownerId);
  staff.isActive = false;
  staff.removedAt = new Date();
  await staff.save();
  return staff;
}

export async function listStaffForOwner(shopId, ownerId) {
  await assertShopOwnership(shopId, ownerId);
  return Staff.find({ shop: shopId, removedAt: null }).sort({ createdAt: -1 });
}

export async function getStaffForOwner(staffId, ownerId) {
  return assertStaffOwnership(staffId, ownerId);
}

export async function listPublicStaff(shopId) {
  return Staff.find({ shop: shopId, isActive: true, removedAt: null })
    .select(
      "name role bio profilePhoto joiningDate ratingAverage feedbackCount",
    )
    .sort({ createdAt: -1 });
}

export async function getPublicStaffProfile(staffId) {
  const staff = await Staff.findOne({
    _id: staffId,
    isActive: true,
    removedAt: null,
  }).select(
    "name role bio profilePhoto joiningDate ratingAverage feedbackCount",
  );
  if (!staff) throw new ApiError(404, "Staff not found");
  return staff;
}

function normalizeToUtcMidnight(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function markAttendance(staffId, ownerId, { date, status, note }) {
  const staff = await assertStaffOwnership(staffId, ownerId);
  const day = normalizeToUtcMidnight(date);

  const record = await StaffAttendance.findOneAndUpdate(
    { staff: staff._id, date: day },
    {
      staff: staff._id,
      shop: staff.shop,
      date: day,
      status,
      note,
      markedBy: ownerId,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return record;
}

export async function getMonthlyAttendance(staffId, ownerId, month, year) {
  await assertStaffOwnership(staffId, ownerId);

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const records = await StaffAttendance.find({
    staff: staffId,
    date: { $gte: start, $lt: end },
  }).sort({ date: 1 });

  const totalMarked = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const leave = records.filter((r) => r.status === "leave").length;

  const attendancePercentage =
    totalMarked > 0 ? Math.round((present / totalMarked) * 1000) / 10 : 0;

  return {
    month,
    year,
    totalWorkingDays: totalMarked,
    presentDays: present,
    absentDays: absent,
    leaveDays: leave,
    attendancePercentage,
    records,
  };
}

export async function recomputeStaffRating(staffId) {
  const agg = await StaffFeedback.aggregate([
    { $match: { staff: staffId } },
    { $group: { _id: "$staff", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = agg[0] || {};
  await Staff.findByIdAndUpdate(staffId, {
    ratingAverage: Math.round(avg * 10) / 10,
    feedbackCount: count,
  });
}

export async function checkFeedbackEligibility(staffId, buyerId) {
  const staff = await getStaffOr404(staffId);

  const alreadyGiven = await StaffFeedback.exists({
    staff: staffId,
    buyer: buyerId,
  });

  const deliveredOrder = await Order.findOne({
    buyer: buyerId,
    shop: staff.shop,
    orderStatus: "delivered",
  }).sort({ createdAt: -1 });

  if (!deliveredOrder) {
    return { eligible: false, reason: "no_delivered_order" };
  }
  if (alreadyGiven) {
    return {
      eligible: false,
      reason: "already_reviewed",
      orderId: deliveredOrder._id,
    };
  }
  return { eligible: true, orderId: deliveredOrder._id };
}

export async function createStaffFeedback(
  staffId,
  buyerId,
  { orderId, rating, comment },
) {
  const staff = await getStaffOr404(staffId);

  const order = await Order.findOne({
    _id: orderId,
    buyer: buyerId,
    shop: staff.shop,
    orderStatus: "delivered",
  });
  if (!order) {
    throw new ApiError(
      403,
      "You can only rate staff from a delivered order at this shop",
    );
  }

  let feedback;
  try {
    feedback = await StaffFeedback.create({
      staff: staffId,
      shop: staff.shop,
      buyer: buyerId,
      order: orderId,
      rating,
      comment,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(
        409,
        "You already gave feedback for this staff member on this order",
      );
    }
    throw err;
  }

  await recomputeStaffRating(staffId);

  const shop = await Shop.findById(staff.shop);
  await createNotification({
    recipient: shop.owner,
    type: "feedback",
    title:
      rating <= 2 ? "Staff feedback needs attention" : "New staff feedback",
    message: `${staff.name} received a ${rating}★ rating.`,
    meta: { staffId: staff._id, feedbackId: feedback._id },
  });

  return feedback;
}

export async function listStaffFeedback(staffId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    StaffFeedback.find({ staff: staffId })
      .select("rating comment createdAt buyer")
      .populate("buyer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    StaffFeedback.countDocuments({ staff: staffId }),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
}

export async function getStaffPerformance(staffId, ownerId, month, year) {
  await assertStaffOwnership(staffId, ownerId);
  const staff = await Staff.findById(staffId);
  const attendance = await getMonthlyAttendance(staffId, ownerId, month, year);
  return {
    staff: {
      id: staff._id,
      name: staff.name,
      role: staff.role,
      isActive: staff.isActive,
      experience: staff.getExperienceLabel(),
      ratingAverage: staff.ratingAverage,
      feedbackCount: staff.feedbackCount,
    },
    attendance,
  };
}
