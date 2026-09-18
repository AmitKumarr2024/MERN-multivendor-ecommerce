import asyncHandler from "express-async-handler";
import * as staffService from "../../../services/staff/staff.service.js";

export const markAttendance = asyncHandler(async (req, res) => {
  const record = await staffService.markAttendance(req.params.id, req.user._id, req.body);
  res.status(201).json({ success: true, data: record });
});

export const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const data = await staffService.getMonthlyAttendance(
    req.params.id,
    req.user._id,
    Number(month),
    Number(year)
  );
  res.json({ success: true, data });
});