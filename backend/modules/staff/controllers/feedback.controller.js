import asyncHandler from "express-async-handler";
import * as staffService from "../../../services/staff/staff.service.js";

export const checkFeedbackEligibility = asyncHandler(async (req, res) => {
  const result = await staffService.checkFeedbackEligibility(req.params.id, req.user._id);
  res.json({ success: true, data: result });
});

export const createStaffFeedback = asyncHandler(async (req, res) => {
  const feedback = await staffService.createStaffFeedback(req.params.id, req.user._id, req.body);
  res.status(201).json({ success: true, data: feedback });
});

export const listStaffFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await staffService.listStaffFeedback(req.params.id, Number(page), Number(limit));
  res.json({ success: true, data: result });
});