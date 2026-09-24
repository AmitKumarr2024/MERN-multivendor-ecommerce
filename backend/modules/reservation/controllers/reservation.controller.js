import * as svc from "../../../services/reservation/reservation.service.js";

const wrap = (fn) => async (req, res, next) => {
  try {
    const { status = 200, data } = await fn(req);
    res.status(status).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Seller settings
export const setShopReservationSettings = wrap(async (req) => ({
  data: await svc.setShopReservationSettings(
    req.params.shopId,
    req.user._id,
    req.body,
  ),
}));

export const toggleProductReservation = wrap(async (req) => ({
  data: await svc.toggleProductReservation(
    req.params.id,
    req.user._id,
    req.body.enabled,
  ),
}));

// Public / buyer
export const getShopReservationStatus = wrap(async (req) => ({
  data: await svc.getShopReservationStatus(req.params.shopId),
}));

export const createReservation = wrap(async (req) => ({
  status: 201,
  data: await svc.createReservation(req.user._id, req.body),
}));

export const getMyReservations = wrap(async (req) => ({
  data: await svc.getMyReservations(req.user._id, req.query),
}));

export const getReservationById = wrap(async (req) => ({
  data: await svc.getReservationById(
    req.params.id,
    req.user._id,
    req.query.as === "seller",
  ),
}));

export const cancelReservation = wrap(async (req) => ({
  data: await svc.cancelReservation(
    req.params.id,
    req.user._id,
    req.body.as === "seller",
    req.body,
  ),
}));

// Seller lifecycle
export const getShopReservations = wrap(async (req) => ({
  data: await svc.getShopReservations(
    req.params.shopId,
    req.user._id,
    req.query,
  ),
}));

export const confirmReservation = wrap(async (req) => ({
  data: await svc.confirmReservation(req.params.id, req.user._id),
}));

export const rejectReservation = wrap(async (req) => ({
  data: await svc.rejectReservation(req.params.id, req.user._id, req.body),
}));

export const markReady = wrap(async (req) => ({
  data: await svc.markReady(req.params.id, req.user._id),
}));

export const markCollected = wrap(async (req) => ({
  data: await svc.markCollected(req.params.id, req.user._id),
}));
