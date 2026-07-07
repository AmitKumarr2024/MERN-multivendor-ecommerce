import express from "express";
import {
  startOrGetConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from "../controllers/conversation.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Every conversation route requires login
router.use(protect);

router.post("/conversations", startOrGetConversation);
router.get("/conversations", getMyConversations);
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", sendMessage);

export default router;