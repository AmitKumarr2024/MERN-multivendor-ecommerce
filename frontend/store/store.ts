import {
    configureStore,
} from "@reduxjs/toolkit";

import authReducer from "@/features/auth/store/authSlice";
import passkeyReducer from "@/features/auth/store/passkeySlice";
import categoryReducer from "@/features/category/store/categorySlice";
import productReducer from "@/features/products/store/Productslice";
import shopReducer from "@/features/shop/store/shopSlice";
import orderReducer from "@/features/order/store/orderSlice";



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
        },
    });
};


/* =========================================================
   REDUX TYPES
========================================================= */

/**
 * Type representing the Redux store created by makeStore().
 */
export type AppStore = ReturnType<
    typeof makeStore
>;


/**
 * Type representing the complete Redux state.
 *
 * Example:
 *
 * state.auth
 * state.passkey
 */
export type RootState = ReturnType<
    AppStore["getState"]
>;


/**
 * Type representing the Redux dispatch function.
 *
 * Required for correctly typed async thunks.
 */
export type AppDispatch =
    AppStore["dispatch"];