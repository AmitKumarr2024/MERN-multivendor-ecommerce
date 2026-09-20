import mongoose from "mongoose";
import Order from "../../modules/order/models/order.model.js";
import User from "../../modules/auth/models/auth.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import ShopFollow from "../../modules/follow/models/shopFollow.model.js";
import { ApiError } from "../../exceptions/ApiError.js";

/**
 * CUSTOMER SEGMENTS - derived from real (non-cancelled) Order history.
 *   new       : exactly 1 qualifying order
 *   returning : 2+ qualifying orders
 *   regular   : returning AND, inside the last WINDOW_DAYS, at least
 *               REGULAR_MIN_ORDERS orders of which REGULAR_MIN_DELIVERED
 *               were actually delivered (completed, not just placed).
 * Following a shop never affects segment.
 */
export const CUSTOMER_RULES = {
  WINDOW_DAYS: 180,
  REGULAR_MIN_ORDERS: 3,
  REGULAR_MIN_DELIVERED: 2,
};

export const classifyCustomer = ({
  orderCount,
  recentOrderCount,
  recentDeliveredCount,
}) => {
  if (
    orderCount >= 2 &&
    recentOrderCount >= CUSTOMER_RULES.REGULAR_MIN_ORDERS &&
    recentDeliveredCount >= CUSTOMER_RULES.REGULAR_MIN_DELIVERED
  ) {
    return "regular";
  }
  if (orderCount >= 2) return "returning";
  return "new";
};

const SORTERS = {
  lastOrder: (a, b) => b.lastOrderAt - a.lastOrderAt,
  firstOrder: (a, b) => a.firstOrderAt - b.firstOrderAt,
  orders: (a, b) =>
    b.orderCount - a.orderCount || b.lastOrderAt - a.lastOrderAt,
  spent: (a, b) => b.totalSpent - a.totalSpent,
};

export const getShopCustomers = async (
  shopId,
  ownerId,
  {
    segment = "all",
    search = "",
    sort = "lastOrder",
    page = 1,
    limit = 20,
  } = {},
  now = new Date(),
) => {
  // Ownership-over-role, same pattern as staff/khata
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, "Shop not found");
  if (String(shop.owner) !== String(ownerId))
    throw new ApiError(403, "Not authorized for this shop");

  const since = new Date(now.getTime() - CUSTOMER_RULES.WINDOW_DAYS * 86400000);
  const isDelivered = { $eq: ["$orderStatus", "delivered"] };
  const isRecent = { $gte: ["$createdAt", since] };

  const grouped = await Order.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(String(shopId)),
        orderStatus: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: "$buyer",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$grandTotal" },
        firstOrderAt: { $min: "$createdAt" },
        lastOrderAt: { $max: "$createdAt" },
        lastOrderActivityAt: { $max: "$updatedAt" },
        recentOrderCount: { $sum: { $cond: [isRecent, 1, 0] } },
        recentDeliveredCount: {
          $sum: { $cond: [{ $and: [isDelivered, isRecent] }, 1, 0] },
        },
      },
    },
  ]);

  const buyerIds = grouped.map((g) => g._id);
  const [users, follows, followerCount] = await Promise.all([
    User.find({ _id: { $in: buyerIds } }).select("name email"),
    ShopFollow.find({ shop: shopId, user: { $in: buyerIds } }).select(
      "user createdAt",
    ),
    ShopFollow.countDocuments({ shop: shopId }),
  ]);
  const userById = new Map(users.map((u) => [String(u._id), u]));
  const followById = new Map(follows.map((f) => [String(f.user), f.createdAt]));

  const all = grouped.map((g) => {
    const user = userById.get(String(g._id));
    const followedAt = followById.get(String(g._id)) ?? null;
    const lastActivityAt = [g.lastOrderActivityAt, followedAt]
      .filter(Boolean)
      .sort((a, b) => b - a)[0];
    return {
      buyerId: g._id,
      name: user?.name ?? "Deleted user",
      email: user?.email ?? null,
      segment: classifyCustomer(g),
      orderCount: g.orderCount,
      totalSpent: Number(g.totalSpent.toFixed(2)),
      firstOrderAt: g.firstOrderAt,
      lastOrderAt: g.lastOrderAt,
      lastActivityAt,
      isFollower: followedAt !== null,
    };
  });

  const summary = {
    total: all.length,
    new: all.filter((c) => c.segment === "new").length,
    returning: all.filter((c) => c.segment === "returning").length,
    regular: all.filter((c) => c.segment === "regular").length,
    followers: followerCount,
    totalRevenue: Number(all.reduce((s, c) => s + c.totalSpent, 0).toFixed(2)),
  };

  const q = search.trim().toLowerCase();
  const filtered = all
    .filter((c) => segment === "all" || c.segment === segment)
    .filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q),
    )
    .sort(SORTERS[sort] ?? SORTERS.lastOrder);

  const safeLimit = Math.min(Number(limit) || 20, 100);
  const currentPage = Math.max(Number(page) || 1, 1);
  const items = filtered.slice(
    (currentPage - 1) * safeLimit,
    currentPage * safeLimit,
  );

  return {
    items,
    summary,
    rules: CUSTOMER_RULES,
    total: filtered.length,
    page: currentPage,
    pages: Math.ceil(filtered.length / safeLimit),
  };
};
