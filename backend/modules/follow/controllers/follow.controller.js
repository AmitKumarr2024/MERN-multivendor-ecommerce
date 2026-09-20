import * as followService from "../../../services/follow/follow.service.js";
import * as customerStats from "../../../services/follow/customerStats.service.js";

const wrap = (fn) => async (req, res, next) => {
  try {
    const { status = 200, data } = await fn(req);
    res.status(status).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Public - aggregate numbers only
export const getShopPublicStats = wrap(async (req) => ({
  data: await followService.getPublicShopStats(req.params.shopId),
}));

export const getStatus = wrap(async (req) => ({
  data: await followService.getFollowStatus(req.user._id, req.params.shopId),
}));

export const follow = wrap(async (req) => ({
  status: 201,
  data: await followService.followShop(req.user._id, req.params.shopId),
}));

export const unfollow = wrap(async (req) => ({
  data: await followService.unfollowShop(req.user._id, req.params.shopId),
}));

export const listMyFollowed = wrap(async (req) => ({
  data: await followService.getMyFollowedShops(req.user._id, req.query),
}));

// Seller only (ownership enforced in service)
export const listShopCustomers = wrap(async (req) => ({
  data: await customerStats.getShopCustomers(
    req.params.shopId,
    req.user._id,
    req.query,
  ),
}));
