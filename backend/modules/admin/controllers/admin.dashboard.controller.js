import User from "../../auth/auth.model.js";
import Shop from "../../shop/models/shop.model.js";
import Product from "../../product/models/product.model.js";
import Order from "../../order/models/order.model.js";

/**
 * ADMIN - DASHBOARD
 * ------------------------------------------------------------------
 *   1. getDashboardStats -> GET /api/admin/dashboard
 * ------------------------------------------------------------------
 * Platform-wide counts.
 */

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalShops,
      verifiedShops,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller" }),
      Shop.countDocuments(),
      Shop.countDocuments({ isVerified: true }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({
        orderStatus: { $in: ["pending", "confirmed", "shipped"] },
      }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
      // Revenue only counts paid orders that weren't cancelled
      Order.aggregate([
        {
          $match: { paymentStatus: "paid", orderStatus: { $ne: "cancelled" } },
        },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
    ]);

    res.json({
      users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers },
      shops: { total: totalShops, verified: verifiedShops },
      products: { total: totalProducts, active: activeProducts },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: revenueResult[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};
