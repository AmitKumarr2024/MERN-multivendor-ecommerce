import * as khataService from "../../../services/khata/khata.service.js";

export const enableKhataForShop = async (req, res, next) => {
  try {
    const shop = await khataService.setShopKhataEnabled(
      req.params.shopId,
      req.user._id,
      req.body.enabled,
    );
    res.json({ success: true, data: shop });
  } catch (err) {
    next(err);
  }
};

export const applyForKhata = async (req, res, next) => {
  try {
    const khata = await khataService.applyForKhata(
      req.params.shopId,
      req.user._id,
      req.body,
    );
    res.status(201).json({ success: true, data: khata });
  } catch (err) {
    next(err);
  }
};

export const listShopKhatas = async (req, res, next) => {
  try {
    const khatas = await khataService.listShopKhatas(
      req.params.shopId,
      req.user._id,
      req.query,
    );
    res.json({ success: true, data: khatas });
  } catch (err) {
    next(err);
  }
};

export const approveKhata = async (req, res, next) => {
  try {
    const khata = await khataService.approveKhata(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.json({ success: true, data: khata });
  } catch (err) {
    next(err);
  }
};

export const rejectKhata = async (req, res, next) => {
  try {
    const khata = await khataService.rejectKhata(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.json({ success: true, data: khata });
  } catch (err) {
    next(err);
  }
};

export const suspendKhata = async (req, res, next) => {
  try {
    const khata = await khataService.suspendKhata(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.json({ success: true, data: khata });
  } catch (err) {
    next(err);
  }
};

export const reactivateKhata = async (req, res, next) => {
  try {
    const khata = await khataService.reactivateKhata(
      req.params.id,
      req.user._id,
    );
    res.json({ success: true, data: khata });
  } catch (err) {
    next(err);
  }
};

export const updateCreditLimit = async (req, res, next) => {
  try {
    const khata = await khataService.updateCreditLimit(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.json({ success: true, data: khata });
  } catch (err) {
    next(err);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const txn = await khataService.recordPayment(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.status(201).json({ success: true, data: txn });
  } catch (err) {
    next(err);
  }
};

export const getTransactionHistory = async (req, res, next) => {
  try {
    const isSeller = req.query.as === "seller";
    const txns = await khataService.getTransactionHistory(
      req.params.id,
      req.user._id,
      isSeller,
    );
    res.json({ success: true, data: txns });
  } catch (err) {
    next(err);
  }
};

export const getMonthlyStatement = async (req, res, next) => {
  try {
    const isSeller = req.query.as === "seller";
    const stmt = await khataService.getMonthlyStatement(
      req.params.id,
      req.user._id,
      isSeller,
      req.query.month,
    );
    res.json({ success: true, data: stmt });
  } catch (err) {
    next(err);
  }
};

export const closeMonth = async (req, res, next) => {
  try {
    const settlement = await khataService.closeMonth(
      req.params.id,
      req.user._id,
      req.body,
    );
    res.status(201).json({ success: true, data: settlement });
  } catch (err) {
    next(err);
  }
};

export const getMyKhatas = async (req, res, next) => {
  try {
    const khatas = await khataService.getMyKhatas(req.user._id);
    res.json({ success: true, data: khatas });
  } catch (err) {
    next(err);
  }
};

export const getShopKhataStatus = async (req, res, next) => {
  try {
    const status = await khataService.getShopKhataStatus(
      req.params.shopId,
      req.user._id,
    );
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};
