import * as offerService from "../../../services/offer/offer.service.js";

export const createOffer = async (req, res, next) => {
  try {
    const offer = await offerService.createOffer(
      req.params.shopId,
      req.user._id,
      req.body,
    );
    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    const offer = await offerService.updateOffer(
      req.params.shopId,
      req.params.id,
      req.user._id,
      req.body,
    );
    res.json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    await offerService.deleteOffer(
      req.params.shopId,
      req.params.id,
      req.user._id,
    );
    res.json({ success: true, message: "Offer deleted" });
  } catch (err) {
    next(err);
  }
};

export const listShopOffers = async (req, res, next) => {
  try {
    const offers = await offerService.listShopOffers(
      req.params.shopId,
      req.user._id,
    );
    res.json({ success: true, data: offers });
  } catch (err) {
    next(err);
  }
};

export const getOffer = async (req, res, next) => {
  try {
    const offer = await offerService.getOfferForOwner(
      req.params.shopId,
      req.params.id,
      req.user._id,
    );
    res.json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

export const getPublicOffers = async (req, res, next) => {
  try {
    const offers = await offerService.getPublicShopOffers(req.params.shopId);
    res.json({ success: true, data: offers });
  } catch (err) {
    next(err);
  }
};
