import * as svc from "../../../services/loyalty/loyalty.service.js";

const wrap = (fn) => async (req, res, next) => {
  try {
    const { status = 200, data } = await fn(req);
    res.status(status).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Public
export const getPublicProgram = wrap(async (r) => ({
  data: await svc.getPublicProgram(r.params.shopId),
}));

// Seller / admin
export const getProgram = wrap(async (r) => ({
  data: await svc.getProgram(r.params.shopId, r.user),
}));
export const saveProgram = wrap(async (r) => ({
  data: await svc.saveProgram(r.params.shopId, r.user, r.body),
}));
export const listCustomers = wrap(async (r) => ({
  data: await svc.listShopCustomers(r.params.shopId, r.user, r.query),
}));
export const topCustomers = wrap(async (r) => ({
  data: await svc.getTopCustomers(r.params.shopId, r.user, r.query),
}));
export const customerTransactions = wrap(async (r) => ({
  data: await svc.getCustomerTransactions(
    r.params.shopId,
    r.user,
    r.params.buyerId,
    r.query,
  ),
}));
export const adjust = wrap(async (r) => ({
  status: 201,
  data: await svc.adjustPoints(
    r.params.shopId,
    r.user,
    r.params.buyerId,
    r.body,
  ),
}));
export const listRedemptions = wrap(async (r) => ({
  data: await svc.listShopRedemptions(r.params.shopId, r.user, r.query),
}));
export const fulfill = wrap(async (r) => ({
  data: await svc.fulfillRedemption(r.params.shopId, r.user, r.params.id),
}));

// Buyer
export const myAccounts = wrap(async (r) => ({
  data: await svc.getMyAccounts(r.user._id),
}));
export const shopLoyalty = wrap(async (r) => ({
  data: await svc.getShopLoyalty(r.params.shopId, r.user._id),
}));
export const myTransactions = wrap(async (r) => ({
  data: await svc.getMyTransactions(r.params.shopId, r.user._id, r.query),
}));
export const redeem = wrap(async (r) => ({
  status: 201,
  data: await svc.redeemPoints(r.params.shopId, r.user._id, r.body),
}));
export const myRedemptions = wrap(async (r) => ({
  data: await svc.getMyRedemptions(r.user._id, r.query),
}));
