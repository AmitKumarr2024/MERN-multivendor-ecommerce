import ShopFollow from "../../modules/follow/models/shopFollow.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import Order from "../../modules/order/models/order.model.js";
import { ApiError } from "../../exceptions/ApiError.js";

const getActiveShopOr404 = async (shopId) => {
  const shop = await Shop.findOne({ _id: shopId, isActive: true });
  if (!shop) throw new ApiError(404, "Shop not found");
  return shop;
};

export const getFollowerCount = (shopId) =>
  ShopFollow.countDocuments({ shop: shopId });

// Public aggregate only - numbers, never identities.
export const getPublicShopStats = async (shopId) => {
  await getActiveShopOr404(shopId);
  const [followerCount, customers] = await Promise.all([
    getFollowerCount(shopId),
    Order.distinct("buyer", {
      shop: shopId,
      orderStatus: { $ne: "cancelled" },
    }),
  ]);
  return { followerCount, customerCount: customers.length };
};

export const getFollowStatus = async (userId, shopId) => {
  const [follow, followerCount] = await Promise.all([
    ShopFollow.exists({ user: userId, shop: shopId }),
    getFollowerCount(shopId),
  ]);
  return { following: Boolean(follow), followerCount };
};

// Idempotent: following twice is not an error.
export const followShop = async (userId, shopId) => {
  const shop = await getActiveShopOr404(shopId);
  if (String(shop.owner) === String(userId)) {
    throw new ApiError(400, "You cannot follow your own shop");
  }
  try {
    await ShopFollow.create({ user: userId, shop: shopId });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  return getFollowStatus(userId, shopId);
};

export const unfollowShop = async (userId, shopId) => {
  await ShopFollow.deleteOne({ user: userId, shop: shopId });
  return getFollowStatus(userId, shopId);
};

export const getMyFollowedShops = async (
  userId,
  { page = 1, limit = 20 } = {},
) => {
  const safeLimit = Math.min(Number(limit) || 20, 50);
  const currentPage = Math.max(Number(page) || 1, 1);

  const [follows, total] = await Promise.all([
    ShopFollow.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * safeLimit)
      .limit(safeLimit)
      .populate({
        path: "shop",
        match: { isActive: true },
        select:
          "shopName slug logo banner description address isVerified businessHours holidayDates",
      }),
    ShopFollow.countDocuments({ user: userId }),
  ]);

  const items = follows
    .filter((f) => f.shop) // shop deactivated/deleted -> hide
    .map((f) => {
      const shop = f.shop.toObject();
      shop.isOpen = f.shop.isCurrentlyOpen();
      delete shop.businessHours;
      delete shop.holidayDates;
      return { followedAt: f.createdAt, shop };
    });

  return {
    items,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
  };
};
