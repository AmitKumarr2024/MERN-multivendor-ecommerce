import asyncHandler from "express-async-handler";
import * as staffService from "../../../services/staff/staff.service.js";
import { uploadImageBuffer } from "../../../services/upload.service.js";

export const createStaff = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  let photo = null;
  if (req.file) {
    const result = await uploadImageBuffer(
      req.file.buffer,
      "staff-photos",
      req.user._id,
    );
    photo = { url: result.url, publicId: result.publicId };
  }
  const staff = await staffService.createStaff(
    shopId,
    req.user._id,
    req.body,
    photo,
  );
  res.status(201).json({ success: true, data: staff });
});

export const updateStaff = asyncHandler(async (req, res) => {
  let photo = null;
  if (req.file) {
    const result = await uploadImageBuffer(
      req.file.buffer,
      "staff-photos",
      req.user._id,
    );
    photo = { url: result.url, publicId: result.publicId };
  }
  const staff = await staffService.updateStaff(
    req.params.id,
    req.user._id,
    req.body,
    photo,
  );
  res.json({ success: true, data: staff });
});

export const setStaffStatus = asyncHandler(async (req, res) => {
  const staff = await staffService.setStaffStatus(
    req.params.id,
    req.user._id,
    req.body.isActive,
  );
  res.json({ success: true, data: staff });
});

export const removeStaff = asyncHandler(async (req, res) => {
  await staffService.removeStaff(req.params.id, req.user._id);
  res.json({ success: true, message: "Staff removed" });
});

export const listStaffForOwner = asyncHandler(async (req, res) => {
  const staff = await staffService.listStaffForOwner(
    req.params.shopId,
    req.user._id,
  );
  res.json({ success: true, data: staff });
});

export const getStaffForOwner = asyncHandler(async (req, res) => {
  const staff = await staffService.getStaffForOwner(
    req.params.id,
    req.user._id,
  );
  res.json({ success: true, data: staff });
});

export const listPublicStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.listPublicStaff(req.params.shopId);
  res.json({ success: true, data: staff });
});

export const getPublicStaffProfile = asyncHandler(async (req, res) => {
  const staff = await staffService.getPublicStaffProfile(req.params.id);
  res.json({ success: true, data: staff });
});

export const getStaffPerformance = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const perf = await staffService.getStaffPerformance(
    req.params.id,
    req.user._id,
    Number(month),
    Number(year),
  );
  res.json({ success: true, data: perf });
});
