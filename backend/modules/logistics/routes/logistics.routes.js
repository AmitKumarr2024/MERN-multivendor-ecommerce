import express from "express";
import {
  checkServiceability,
  shiprocketWebhook,
} from "../controllers/logistics.controller.js";
import { checkServiceabilitySchema } from "../logistics.validation.js";
import validate from "../../../middleware/validate.js";
import { apiLimiter } from "../../../middleware/rateLimiter.js";

const router = express.Router();

// Public - used on the checkout page before an order exists
router.post(
  "/check",
  apiLimiter,
  validate(checkServiceabilitySchema),
  checkServiceability,
);

// Public - Shiprocket calls this directly (no browser session).
// TODO: once Shiprocket's dashboard provides a webhook signing secret,
// verify it here (e.g. an HMAC header check) before trusting the payload -
// right now anyone who discovers this URL could POST fake status updates.
router.post("/webhook/shiprocket", shiprocketWebhook);

export default router;
