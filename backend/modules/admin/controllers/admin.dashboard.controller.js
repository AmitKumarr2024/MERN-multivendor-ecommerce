import User from "../../auth/auth.model.js";
import Shop from "../../shop/models/shop.model.js";
import Product from "../../product/models/product.model.js";

/**
 * ADMIN - DASHBOARD
 * ------------------------------------------------------------------
 *   1. getDashboardStats -> GET /api/admin/dashboard
 * ------------------------------------------------------------------
 * Platform-wide counts. Once the Order module exists, add total
 * orders, total revenue, and pending shipments here too.
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
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller" }),
      Shop.countDocuments(),
      Shop.countDocuments({ isVerified: true }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
    ]);

    res.json({
      users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers },
      shops: { total: totalShops, verified: verifiedShops },
      products: { total: totalProducts, active: activeProducts },
    });
  } catch (error) {
    next(error);
  }
};
