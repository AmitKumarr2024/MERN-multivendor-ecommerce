import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/store/authSlice";
import passkeyReducer from "@/features/auth/store/passkeySlice";
import categoryReducer from "@/features/category/store/categorySlice";
import productReducer from "@/features/products/store/Productslice";
import shopReducer from "@/features/shop/store/shopSlice";
import orderReducer from "@/features/order/store/orderSlice";
import cartReducer from "@/features/cart/store/cartSlice";
import messagingReducer from "@/features/messaging/store/messagingSlice";
import logisticsReducer from "@/features/logistics/store/logisticsSlice";
import wishlistReducer from "@/features/wishlist/store/wishlistSlice";
import adminReducer from "@/features/admin/store/Adminslice";
import notificationReducer from "@/features/notification/store/notificationSlice";
import reviewReducer from "@/features/reviews/store/reviewSlice";
import searchReducer from "@/features/search/store/searchSlice";
import { staffReducer } from "@/features/staff";
import { khataReducer } from "@/features/khata";
import { followReducer } from "@/features/follow";


/**
 * =========================================================
 * REDUX STORE
 * =========================================================
 *
 * Creates a new Redux store instance for the application.
 *
 * Why makeStore():
 *
 * Next.js App Router supports server-side rendering.
 * Using a store factory helps prevent sharing one global
 * Redux store instance across different render contexts.
 *
 * Each mounted ReduxProvider creates and keeps its own
 * stable store instance using useRef().
 *
 * Current reducers:
 *
 * auth
 *    └── Login, register, logout, current user, etc.
 *
 * passkey
 *    └── WebAuthn / passkey authentication state.
 *
 * khata
 *    └── Shop-specific buyer credit ledger: apply/approve/
 *        reject/suspend, credit limit, transactions,
 *        monthly statements, month-close settlements.
 * =========================================================
 */

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      passkey: passkeyReducer,
      category: categoryReducer,
      products: productReducer,
      shop: shopReducer,
      order: orderReducer,
      cart: cartReducer,
      messaging: messagingReducer,
      logistics: logisticsReducer,
      wishlist: wishlistReducer,
      admin: adminReducer,
      notification: notificationReducer,
      reviews: reviewReducer,
      search: searchReducer,
      staff: staffReducer,
      khata: khataReducer,
      follow: followReducer
    },
  });
};

/* =========================================================
   REDUX TYPES
========================================================= */

/**
 * Type representing the Redux store created by makeStore().
 */
export type AppStore = ReturnType<typeof makeStore>;

/**
 * Type representing the complete Redux state.
 *
 * Example:
 *
 * state.auth
 * state.passkey
 */
export type RootState = ReturnType<AppStore["getState"]>;

/**
 * Type representing the Redux dispatch function.
 *
 * Required for correctly typed async thunks.
 */
export type AppDispatch = AppStore["dispatch"];
