import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Shop from "../../shop/models/shop.model.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../../exceptions/ApiError.js";

/**
 * CONVERSATION CONTROLLER
 * ------------------------------------------------------------------
 *   1. startOrGetConversation -> POST /api/messages/conversations
 *   2. getMyConversations      -> GET  /api/messages/conversations
 *   3. getMessages             -> GET  /api/messages/conversations/:id/messages
 *   4. sendMessage              -> POST /api/messages/conversations/:id/messages
 *
 * Access rule for every conversation: only the buyer who started it, or
 * the seller who owns the shop it's with, can read/send in it.
 * ------------------------------------------------------------------
 */

const assertParticipant = async (conversation, user) => {
  const isBuyer = conversation.buyer.toString() === user._id.toString();

  if (isBuyer) return "buyer";

  const shop = await Shop.findOne({ _id: conversation.shop, owner: user._id });
  if (shop) return "seller";

  throw new ForbiddenError("You are not part of this conversation");
};

// 1. Buyer starts a conversation with a shop, or fetches the existing one if already started
// @route   POST /api/messages/conversations
// @access  Private (buyer)
export const startOrGetConversation = async (req, res, next) => {
  try {
    const { shopId } = req.body;
    if (!shopId) {
      throw new BadRequestError("shopId is required");
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    let conversation = await Conversation.findOne({ buyer: req.user._id, shop: shopId });
    if (!conversation) {
      conversation = await Conversation.create({ buyer: req.user._id, shop: shopId });
    }

    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

// 2. List all conversations for the logged-in user (works for both buyer and seller)
// @route   GET /api/messages/conversations
// @access  Private
export const getMyConversations = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === "seller") {
      const shop = await Shop.findOne({ owner: req.user._id });
      if (!shop) {
        return res.json([]); // no shop yet -> no conversations possible
      }
      query = { shop: shop._id };
    } else {
      query = { buyer: req.user._id };
    }

    const conversations = await Conversation.find(query)
      .populate("buyer", "name")
      .populate("shop", "shopName slug logo")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

// 3. Get messages within a conversation (paginated, oldest-first for a chat thread)
// @route   GET /api/messages/conversations/:id/messages
// @access  Private (participant only)
export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const role = await assertParticipant(conversation, req.user);

    const { page = 1, limit = 50 } = req.query;
    const safeLimit = Math.min(Number(limit) || 50, 100);

    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: -1 }) // newest first from DB...
      .skip((Number(page) - 1) * safeLimit)
      .limit(safeLimit);

    messages.reverse(); // ...then reversed so the response reads oldest -> newest, like a chat log

    // Mark messages sent by the other party as read
    await Message.updateMany(
      { conversation: conversation._id, sender: { $ne: req.user._id }, readAt: null },
      { readAt: new Date() }
    );

    if (role === "buyer") {
      conversation.unreadCountForBuyer = 0;
    } else {
      conversation.unreadCountForSeller = 0;
    }
    await conversation.save();

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// 4. Send a message in a conversation
// @route   POST /api/messages/conversations/:id/messages
// @access  Private (participant only)
export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      throw new BadRequestError("Message text is required");
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const role = await assertParticipant(conversation, req.user);

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text.trim(),
    });

    conversation.lastMessage = { text: message.text, sentBy: req.user._id, sentAt: message.createdAt };
    // Increment the unread count for whichever side didn't send this message
    if (role === "buyer") {
      conversation.unreadCountForSeller += 1;
    } else {
      conversation.unreadCountForBuyer += 1;
    }
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};