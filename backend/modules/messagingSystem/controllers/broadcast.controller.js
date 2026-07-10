import Broadcast from "../models/broadcast.model.js";
import Shop from "../../shop/models/shop.model.js";
import { ROLES } from "../../../constants/roles.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../../exceptions/ApiError.js";
import {
  emitShopBroadcast,
  emitPlatformBroadcast,
} from "../../../sockets/emit.js";

/**
 * BROADCAST CONTROLLER
 * ------------------------------------------------------------------
 *   1. createShopBroadcast     -> POST   /api/messages/broadcasts/shop      (seller)
 *   2. createPlatformBroadcast -> POST   /api/messages/broadcasts/platform  (admin)
 *   3. getShopBroadcasts       -> GET    /api/messages/broadcasts/shop/:slug     (public - shown on dukan page)
 *   4. getPlatformBroadcasts   -> GET    /api/messages/broadcasts/platform       (public - shown site-wide)
 *   5. deactivateBroadcast     -> PATCH  /api/messages/broadcasts/:id/deactivate (owner seller or admin)
 * ------------------------------------------------------------------
 */

// Helper - a broadcast is "live" if active, and either has no expiry or hasn't expired yet
const activeQuery = () => ({
  isActive: true,
  $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
});

// 1. Seller posts an offer/announcement for visitors of their own dukan page
// @route   POST /api/messages/broadcasts/shop
// @access  Private (seller)
export const createShopBroadcast = async (req, res, next) => {
  try {
    const { message, type = "offer", expiresAt } = req.body;
    if (!message || !message.trim()) {
      throw new BadRequestError("Broadcast message is required");
    }

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      throw new BadRequestError(
        "Please create your shop before posting a broadcast",
      );
    }

    const broadcast = await Broadcast.create({
      scope: "shop",
      shop: shop._id,
      createdBy: req.user._id,
      message: message.trim(),
      type,
      expiresAt: expiresAt || null,
    });

    emitShopBroadcast(shop.slug, broadcast);

    res.status(201).json(broadcast);
  } catch (error) {
    next(error);
  }
};

// 2. Admin posts a platform-wide toast, visible to every visitor on every page
// @route   POST /api/messages/broadcasts/platform
// @access  Private (admin)
export const createPlatformBroadcast = async (req, res, next) => {
  try {
    const { message, type = "info", expiresAt } = req.body;
    if (!message || !message.trim()) {
      throw new BadRequestError("Broadcast message is required");
    }

    const broadcast = await Broadcast.create({
      scope: "platform",
      shop: null,
      createdBy: req.user._id,
      message: message.trim(),
      type,
      expiresAt: expiresAt || null,
    });

    emitPlatformBroadcast(broadcast);

    res.status(201).json(broadcast);
  } catch (error) {
    next(error);
  }
};

// 3. Public - active broadcasts for one shop's dukan page
// @route   GET /api/messages/broadcasts/shop/:slug
// @access  Public
export const getShopBroadcasts = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug.toLowerCase() });
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    const broadcasts = await Broadcast.find({
      scope: "shop",
      shop: shop._id,
      ...activeQuery(),
    }).sort({
      createdAt: -1,
    });

    res.json(broadcasts);
  } catch (error) {
    next(error);
  }
};

// 4. Public - active platform-wide toasts (frontend polls this on every page load)
// @route   GET /api/messages/broadcasts/platform
// @access  Public
export const getPlatformBroadcasts = async (req, res, next) => {
  try {
    const broadcasts = await Broadcast.find({
      scope: "platform",
      ...activeQuery(),
    }).sort({ createdAt: -1 });
    res.json(broadcasts);
  } catch (error) {
    next(error);
  }
};

// 5. Turn off a broadcast early (seller for their own shop broadcast, or admin for any)
// @route   PATCH /api/messages/broadcasts/:id/deactivate
// @access  Private (owning seller or admin)
export const deactivateBroadcast = async (req, res, next) => {
  try {
    const broadcast = await Broadcast.findById(req.params.id);
    if (!broadcast) {
      throw new NotFoundError("Broadcast not found");
    }

    if (req.user.role === ROLES.ADMIN) {
      // admins can deactivate anything
    } else if (broadcast.scope === "shop") {
      const shop = await Shop.findOne({
        _id: broadcast.shop,
        owner: req.user._id,
      });
      if (!shop) {
        throw new ForbiddenError(
          "You are not allowed to manage this broadcast",
        );
      }
    } else {
      throw new ForbiddenError("Only an admin can manage platform broadcasts");
    }

    broadcast.isActive = false;
    await broadcast.save();

    res.json({ _id: broadcast._id, isActive: broadcast.isActive });
  } catch (error) {
    next(error);
  }
};
