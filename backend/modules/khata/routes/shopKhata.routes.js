import express from "express";
import validate from "../../../middleware/validate.js";
import { protect } from "../../../middleware/authMiddleware.js";
import * as ctrl from "../controllers/khata.controller.js";
import { applyKhataSchema } from "../khata.validation.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

// Specific paths before any catch-all
router.get("/status", ctrl.getShopKhataStatus); // buyer: is khata offered + my request status
router.post("/apply", validate(applyKhataSchema), ctrl.applyForKhata); // buyer
router.patch("/settings", ctrl.enableKhataForShop); // seller: enable/disable
router.get("/", ctrl.listShopKhatas); // seller: list requests (?status=pending)

export default router;
