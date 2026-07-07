import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/Category-controller/category.controller.js";
import { protect, authorizeRoles } from "../../../middleware/authMiddleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", protect, authorizeRoles(ROLES.ADMIN), createCategory);
router.put("/:id", protect, authorizeRoles(ROLES.ADMIN), updateCategory);
router.delete("/:id", protect, authorizeRoles(ROLES.ADMIN), deleteCategory);

export default router;
