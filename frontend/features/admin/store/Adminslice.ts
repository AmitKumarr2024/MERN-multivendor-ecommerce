import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type {
    AdminOrderQueryParams,
    AdminProductQueryParams,
    AdminResetPasswordArgs,
    AdminResetPasswordResponse,
    DashboardStats,
    PaginatedAdminOrders,
    PaginatedAdminProducts,
    PaginatedShops,
    PaginatedUsers,
    ShopQueryParams,
    UpdateUserRoleArgs,
    UserQueryParams,
} from "../types/Admin.types";

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Something went wrong"
        );
    }
    if (error instanceof Error) return error.message;
    return "Something went wrong";
}

const BASE_URL = "/admin";

/* =========================================================
   DASHBOARD
========================================================= */

export const fetchDashboardStats = createAsyncThunk<
    DashboardStats,
    void,
    { rejectValue: string }
>("admin/fetchDashboardStats", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get<DashboardStats>(`${BASE_URL}/dashboard`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   USERS
========================================================= */

export const fetchUsers = createAsyncThunk<
    PaginatedUsers,
    UserQueryParams | void,
    { rejectValue: string }
>("admin/fetchUsers", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get<PaginatedUsers>(`${BASE_URL}/users`, {
            params: params ?? undefined,
        });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const updateUserRole = createAsyncThunk<
    { id: string; role: string },
    UpdateUserRoleArgs,
    { rejectValue: string }
>("admin/updateUserRole", async ({ id, role }, { rejectWithValue }) => {
    try {
        const { data } = await api.put<{ _id: string; role: string }>(
            `${BASE_URL}/users/${id}/role`,
            { role },
        );
        return { id: data._id, role: data.role };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const toggleUserBan = createAsyncThunk<
    { id: string; isActive: boolean },
    string,
    { rejectValue: string }
>("admin/toggleUserBan", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<{ _id: string; isActive: boolean }>(
            `${BASE_URL}/users/${id}/ban`,
        );
        return { id: data._id, isActive: data.isActive };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const adminResetPassword = createAsyncThunk<
    AdminResetPasswordResponse,
    AdminResetPasswordArgs,
    { rejectValue: string }
>("admin/resetPassword", async ({ id, newPassword }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<AdminResetPasswordResponse>(
            `${BASE_URL}/users/${id}/reset-password`,
            newPassword ? { newPassword } : {},
        );
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   SHOPS
========================================================= */

export const fetchShopsAdmin = createAsyncThunk<
    PaginatedShops,
    ShopQueryParams | void,
    { rejectValue: string }
>("admin/fetchShops", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get<PaginatedShops>(`${BASE_URL}/shops`, {
            params: params ?? undefined,
        });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const verifyShopAdmin = createAsyncThunk<
    { id: string; isVerified: boolean },
    string,
    { rejectValue: string }
>("admin/verifyShop", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<{ _id: string; isVerified: boolean }>(
            `${BASE_URL}/shops/${id}/verify`,
        );
        return { id: data._id, isVerified: data.isVerified };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const toggleShopActiveAdmin = createAsyncThunk<
    { id: string; isActive: boolean },
    string,
    { rejectValue: string }
>("admin/toggleShopActive", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<{ _id: string; isActive: boolean }>(
            `${BASE_URL}/shops/${id}/toggle-active`,
        );
        return { id: data._id, isActive: data.isActive };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   PRODUCTS
========================================================= */

export const fetchProductsAdmin = createAsyncThunk<
    PaginatedAdminProducts,
    AdminProductQueryParams | void,
    { rejectValue: string }
>("admin/fetchProducts", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get<PaginatedAdminProducts>(`${BASE_URL}/products`, {
            params: params ?? undefined,
        });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const toggleProductActiveAdmin = createAsyncThunk<
    { id: string; isActive: boolean },
    string,
    { rejectValue: string }
>("admin/toggleProductActive", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<{ _id: string; isActive: boolean }>(
            `${BASE_URL}/products/${id}/toggle-active`,
        );
        return { id: data._id, isActive: data.isActive };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const forceDeleteProductAdmin = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("admin/deleteProduct", async (id, { rejectWithValue }) => {
    try {
        await api.delete(`${BASE_URL}/products/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   ORDERS
========================================================= */

export const fetchOrdersAdmin = createAsyncThunk<
    PaginatedAdminOrders,
    AdminOrderQueryParams | void,
    { rejectValue: string }
>("admin/fetchOrders", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get<PaginatedAdminOrders>(`${BASE_URL}/orders`, {
            params: params ?? undefined,
        });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const forceDeleteOrderAdmin = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("admin/deleteOrder", async (id, { rejectWithValue }) => {
    try {
        await api.delete(`${BASE_URL}/orders/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   STATE
========================================================= */

interface AdminState {
    stats: DashboardStats | null;
    statsLoading: boolean;

    users: PaginatedUsers["users"];
    usersTotal: number;
    usersPage: number;
    usersPages: number;
    usersLoading: boolean;

    shops: PaginatedShops["shops"];
    shopsTotal: number;
    shopsPage: number;
    shopsPages: number;
    shopsLoading: boolean;

    products: PaginatedAdminProducts["products"];
    productsTotal: number;
    productsPage: number;
    productsPages: number;
    productsLoading: boolean;

    orders: PaginatedAdminOrders["orders"];
    ordersTotal: number;
    ordersPage: number;
    ordersPages: number;
    ordersLoading: boolean;

    mutatingId: string | null;
    lastResetPassword: AdminResetPasswordResponse | null;
    error: string | null;
    successMessage: string | null;
}

const initialState: AdminState = {
    stats: null,
    statsLoading: false,

    users: [],
    usersTotal: 0,
    usersPage: 1,
    usersPages: 1,
    usersLoading: false,

    shops: [],
    shopsTotal: 0,
    shopsPage: 1,
    shopsPages: 1,
    shopsLoading: false,

    products: [],
    productsTotal: 0,
    productsPage: 1,
    productsPages: 1,
    productsLoading: false,

    orders: [],
    ordersTotal: 0,
    ordersPage: 1,
    ordersPages: 1,
    ordersLoading: false,

    mutatingId: null,
    lastResetPassword: null,
    error: null,
    successMessage: null,
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        clearAdminError(state) {
            state.error = null;
        },
        clearAdminMessage(state) {
            state.successMessage = null;
        },
        clearLastResetPassword(state) {
            state.lastResetPassword = null;
        },
    },
    extraReducers: (builder) => {
        /* dashboard */
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.statsLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.error = action.payload || "Failed to load dashboard stats";
            });

        /* users */
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.usersLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.users = action.payload.users;
                state.usersTotal = action.payload.total;
                state.usersPage = action.payload.page;
                state.usersPages = action.payload.pages;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.usersLoading = false;
                state.error = action.payload || "Failed to load users";
            });

        builder
            .addCase(updateUserRole.pending, (state, action) => {
                state.mutatingId = action.meta.arg.id;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.mutatingId = null;
                const user = state.users.find((u) => u._id === action.payload.id);
                if (user) user.role = action.payload.role as AdminState["users"][number]["role"];
                state.successMessage = "Role updated";
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.mutatingId = null;
                state.error = action.payload || "Failed to update role";
            });

        builder
            .addCase(toggleUserBan.pending, (state, action) => {
                state.mutatingId = action.meta.arg;
            })
            .addCase(toggleUserBan.fulfilled, (state, action) => {
                state.mutatingId = null;
                const user = state.users.find((u) => u._id === action.payload.id);
                if (user) user.isActive = action.payload.isActive;
                state.successMessage = action.payload.isActive ? "User unbanned" : "User banned";
            })
            .addCase(toggleUserBan.rejected, (state, action) => {
                state.mutatingId = null;
                state.error = action.payload || "Failed to update user status";
            });

        builder
            .addCase(adminResetPassword.pending, (state, action) => {
                state.mutatingId = action.meta.arg.id;
                state.lastResetPassword = null;
            })
            .addCase(adminResetPassword.fulfilled, (state, action) => {
                state.mutatingId = null;
                state.lastResetPassword = action.payload;
            })
            .addCase(adminResetPassword.rejected, (state, action) => {
                state.mutatingId = null;
                state.error = action.payload || "Failed to reset password";
            });

        /* shops */
        builder
            .addCase(fetchShopsAdmin.pending, (state) => {
                state.shopsLoading = true;
                state.error = null;
            })
            .addCase(fetchShopsAdmin.fulfilled, (state, action) => {
                state.shopsLoading = false;
                state.shops = action.payload.shops;
                state.shopsTotal = action.payload.total;
                state.shopsPage = action.payload.page;
                state.shopsPages = action.payload.pages;
            })
            .addCase(fetchShopsAdmin.rejected, (state, action) => {
                state.shopsLoading = false;
                state.error = action.payload || "Failed to load shops";
            });

        builder
            .addCase(verifyShopAdmin.pending, (state, action) => {
                state.mutatingId = action.meta.arg;
            })
            .addCase(verifyShopAdmin.fulfilled, (state, action) => {
                state.mutatingId = null;
                const shop = state.shops.find((s) => s._id === action.payload.id);
                if (shop) shop.isVerified = action.payload.isVerified;
                state.successMessage = "Shop verified";
            })
            .addCase(verifyShopAdmin.rejected, (state, action) => {
                state.mutatingId = null;
                state.error = action.payload || "Failed to verify shop";
            });

        builder
            .addCase(toggleShopActiveAdmin.pending, (state, action) => {
                state.mutatingId = action.meta.arg;
            })
            .addCase(toggleShopActiveAdmin.fulfilled, (state, action) => {
                state.mutatingId = null;
                const shop = state.shops.find((s) => s._id === action.payload.id);
                if (shop) shop.isActive = action.payload.isActive;
                state.successMessage = action.payload.isActive ? "Shop enabled" : "Shop disabled";
            })
            .addCase(toggleShopActiveAdmin.rejected, (state, action) => {
                state.mutatingId = null;
                state.error = action.payload || "Failed to update shop status";
            });

        /* products */
        builder
            .addCase(fetchProductsAdmin.pending, (state) => {
                state.productsLoading = true;
                state.error = null;
            })
            .addCase(fetchProductsAdmin.fulfilled, (state, action) => {
                state.productsLoading = false;
                state.products = action.payload.products;
                state.productsTotal = action.payload.total;
                state.productsPage = action.payload.page;
                state.productsPages = action.payload.pages;
            })
            .addCase(fetchProductsAdmin.rejected, (state, action) => {
                state.productsLoading = false;
                state.error = action.payload || "Failed to load products";
            });

        builder
            .addCase(toggleProductActiveAdmin.pending, (state, action) => {
                state.mutatingId = action.meta.arg;
            })
            .addCase(toggleProductActiveAdmin.fulfilled, (state, action) => {
                state.mutatingId = null;
                const product = state.products.find((p) => p._id === action.payload.id);
                if (product) product.isActive = action.payload.isActive;
            })
            .addCase(toggleProductActiveAdmin.rejected, (state, action) => {
                state.mutatingId = null;
                state.error = action.payload || "Failed to update product status";
            });

        builder
            .addCase(forceDeleteProductAdmin.pending, (state, action) => {
                state.mutatingId = action.meta.arg;
            })
            .addCase(forceDeleteProductAdmin.fulfilled, (state, action) => {
                state.mutatingId = null;
                state.products = state.products.filter((p) => p._id !== action.payload);
                state.successMessage = "Product deleted";
            })
            .addCase(forceDeleteProductAdmin.rejected, (state, action) => {
                state.mutatingId = null;
                state.error = action.payload || "Failed to delete product";
            });

        /* orders */
        builder
            .addCase(fetchOrdersAdmin.pending, (state) => {
                state.ordersLoading = true;
                state.error = null;
            })
            .addCase(fetchOrdersAdmin.fulfilled, (state, action) => {
                state.ordersLoading = false;
                state.orders = action.payload.orders;
                state.ordersTotal = action.payload.total;
                state.ordersPage = action.payload.page;
                state.ordersPages = action.payload.pages;
            })
            .addCase(fetchOrdersAdmin.rejected, (state, action) => {
                state.ordersLoading = false;
                state.error = action.payload || "Failed to load orders";
            });

        builder
            .addCase(forceDeleteOrderAdmin.pending, (state, action) => {
                state.mutatingId = action.meta.arg;
            })
            .addCase(forceDeleteOrderAdmin.fulfilled, (state, action) => {
                state.mutatingId = null;
                state.orders = state.orders.filter((o) => o._id !== action.payload);
                state.successMessage = "Order deleted";
            })
            .addCase(forceDeleteOrderAdmin.rejected, (state, action) => {
                state.mutatingId = null;
                state.error = action.payload || "Failed to delete order";
            });
    },
});

export const { clearAdminError, clearAdminMessage, clearLastResetPassword } = adminSlice.actions;

export default adminSlice.reducer;