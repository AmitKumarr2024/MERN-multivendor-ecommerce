import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type {
    CreateProductPayload,
    GetAllProductsResponse,
    GetProductsByShopSlugResponse,
    MessageResponse,
    Product,
    ProductQueryParams,
    ToggleActiveResponse,
    UpdateProductArgs,
    UpdateStockArgs,
    UpdateStockResponse,
} from "../types/product.types";

/* =========================================================
   ERROR HELPER
========================================================= */

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

const BASE_URL = "/products";

/* =========================================================
   1. GET ALL PRODUCTS (homepage feed)
   GET /api/products
========================================================= */

export const fetchAllProducts = createAsyncThunk<
    GetAllProductsResponse,
    ProductQueryParams | void,
    { rejectValue: string }
>("products/fetchAll", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get<GetAllProductsResponse>(BASE_URL, {
            params: params ?? undefined,
        });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   2. GET SINGLE PRODUCT
   GET /api/products/:id
========================================================= */

export const fetchProductById = createAsyncThunk<
    Product,
    string,
    { rejectValue: string }
>("products/fetchById", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Product>(`${BASE_URL}/${id}`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   3. GET PRODUCTS BY SHOP SLUG (dukan page)
   GET /api/products/shop/:slug
========================================================= */

export const fetchProductsByShopSlug = createAsyncThunk<
    GetProductsByShopSlugResponse,
    string,
    { rejectValue: string }
>("products/fetchByShopSlug", async (slug, { rejectWithValue }) => {
    try {
        const { data } = await api.get<GetProductsByShopSlugResponse>(
            `${BASE_URL}/shop/${slug}`,
        );
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   4. GET MY PRODUCTS (seller dashboard)
   GET /api/products/me
========================================================= */

export const fetchMyProducts = createAsyncThunk<
    Product[],
    void,
    { rejectValue: string }
>("products/fetchMine", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Product[]>(`${BASE_URL}/me`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   5. CREATE PRODUCT
   POST /api/products
========================================================= */

export const createProduct = createAsyncThunk<
    Product,
    CreateProductPayload,
    { rejectValue: string }
>("products/create", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post<Product>(BASE_URL, payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   6. UPDATE PRODUCT
   PUT /api/products/:id
========================================================= */

export const updateProduct = createAsyncThunk<
    Product,
    UpdateProductArgs,
    { rejectValue: string }
>("products/update", async ({ id, data: payload }, { rejectWithValue }) => {
    try {
        const { data } = await api.put<Product>(`${BASE_URL}/${id}`, payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   7. UPDATE STOCK ONLY
   PATCH /api/products/:id/stock
========================================================= */

export const updateProductStock = createAsyncThunk<
    UpdateStockResponse,
    UpdateStockArgs,
    { rejectValue: string }
>("products/updateStock", async ({ id, stock }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<UpdateStockResponse>(
            `${BASE_URL}/${id}/stock`,
            { stock },
        );
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   8. TOGGLE ACTIVE
   PATCH /api/products/:id/toggle-active
========================================================= */

export const toggleProductActive = createAsyncThunk<
    ToggleActiveResponse,
    string,
    { rejectValue: string }
>("products/toggleActive", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<ToggleActiveResponse>(
            `${BASE_URL}/${id}/toggle-active`,
        );
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   9. DELETE PRODUCT
   DELETE /api/products/:id
========================================================= */

export const deleteProduct = createAsyncThunk<
    { id: string; message: string },
    string,
    { rejectValue: string }
>("products/delete", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.delete<MessageResponse>(`${BASE_URL}/${id}`);
        return { id, message: data.message };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   STATE
========================================================= */

interface ProductState {
    // Homepage feed
    items: Product[];
    total: number;
    page: number;
    pages: number;
    sort: string;
    listLoading: boolean;

    // Single product detail
    currentProduct: Product | null;
    detailLoading: boolean;

    // Shop / dukan page
    shopProducts: Product[];
    shopInfo: GetProductsByShopSlugResponse["shop"] | null;
    shopLoading: boolean;

    // Seller's own products (dashboard)
    myProducts: Product[];
    myProductsLoading: boolean;

    // Create/update/delete/stock/toggle
    mutating: boolean;

    error: string | null;
    successMessage: string | null;
}

const initialState: ProductState = {
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    sort: "newest",
    listLoading: false,

    currentProduct: null,
    detailLoading: false,

    shopProducts: [],
    shopInfo: null,
    shopLoading: false,

    myProducts: [],
    myProductsLoading: false,

    mutating: false,

    error: null,
    successMessage: null,
};

/* =========================================================
   SLICE
========================================================= */

const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        clearProductError(state) {
            state.error = null;
        },
        clearProductMessage(state) {
            state.successMessage = null;
        },
        clearCurrentProduct(state) {
            state.currentProduct = null;
        },
        /** Optimistic local stock/active patch for instant UI feedback. */
        patchMyProductLocal(
            state,
            action: PayloadAction<{ id: string; changes: Partial<Product> }>,
        ) {
            const idx = state.myProducts.findIndex((p) => p._id === action.payload.id);
            if (idx !== -1) {
                state.myProducts[idx] = { ...state.myProducts[idx], ...action.payload.changes };
            }
        },
    },
    extraReducers: (builder) => {
        /* ---------- fetchAllProducts ---------- */
        builder
            .addCase(fetchAllProducts.pending, (state) => {
                state.listLoading = true;
                state.error = null;
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.listLoading = false;
                state.items = action.payload.products;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                state.sort = action.payload.sort;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.listLoading = false;
                state.error = action.payload || "Failed to load products";
            });

        /* ---------- fetchProductById ---------- */
        builder
            .addCase(fetchProductById.pending, (state) => {
                state.detailLoading = true;
                state.error = null;
                state.currentProduct = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = action.payload || "Failed to load product";
            });

        /* ---------- fetchProductsByShopSlug ---------- */
        builder
            .addCase(fetchProductsByShopSlug.pending, (state) => {
                state.shopLoading = true;
                state.error = null;
            })
            .addCase(fetchProductsByShopSlug.fulfilled, (state, action) => {
                state.shopLoading = false;
                state.shopInfo = action.payload.shop;
                state.shopProducts = action.payload.products;
            })
            .addCase(fetchProductsByShopSlug.rejected, (state, action) => {
                state.shopLoading = false;
                state.error = action.payload || "Failed to load shop products";
            });

        /* ---------- fetchMyProducts ---------- */
        builder
            .addCase(fetchMyProducts.pending, (state) => {
                state.myProductsLoading = true;
                state.error = null;
            })
            .addCase(fetchMyProducts.fulfilled, (state, action) => {
                state.myProductsLoading = false;
                state.myProducts = action.payload;
            })
            .addCase(fetchMyProducts.rejected, (state, action) => {
                state.myProductsLoading = false;
                state.error = action.payload || "Failed to load your products";
            });

        /* ---------- createProduct ---------- */
        builder
            .addCase(createProduct.pending, (state) => {
                state.mutating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.mutating = false;
                state.myProducts.unshift(action.payload);
                state.successMessage = "Product created successfully";
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.mutating = false;
                state.error = action.payload || "Failed to create product";
            });

        /* ---------- updateProduct ---------- */
        builder
            .addCase(updateProduct.pending, (state) => {
                state.mutating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.mutating = false;
                const idx = state.myProducts.findIndex((p) => p._id === action.payload._id);
                if (idx !== -1) state.myProducts[idx] = action.payload;
                if (state.currentProduct?._id === action.payload._id) {
                    state.currentProduct = action.payload;
                }
                state.successMessage = "Product updated successfully";
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.mutating = false;
                state.error = action.payload || "Failed to update product";
            });

        /* ---------- updateProductStock ---------- */
        builder
            .addCase(updateProductStock.pending, (state) => {
                state.error = null;
            })
            .addCase(updateProductStock.fulfilled, (state, action) => {
                const idx = state.myProducts.findIndex((p) => p._id === action.payload._id);
                if (idx !== -1) state.myProducts[idx].stock = action.payload.stock;
                state.successMessage = "Stock updated";
            })
            .addCase(updateProductStock.rejected, (state, action) => {
                state.error = action.payload || "Failed to update stock";
            });

        /* ---------- toggleProductActive ---------- */
        builder
            .addCase(toggleProductActive.fulfilled, (state, action) => {
                const idx = state.myProducts.findIndex((p) => p._id === action.payload._id);
                if (idx !== -1) state.myProducts[idx].isActive = action.payload.isActive;
            })
            .addCase(toggleProductActive.rejected, (state, action) => {
                state.error = action.payload || "Failed to toggle product visibility";
            });

        /* ---------- deleteProduct ---------- */
        builder
            .addCase(deleteProduct.pending, (state) => {
                state.mutating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.mutating = false;
                state.myProducts = state.myProducts.filter((p) => p._id !== action.payload.id);
                state.successMessage = action.payload.message || "Product deleted";
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.mutating = false;
                state.error = action.payload || "Failed to delete product";
            });
    },
});

export const {
    clearProductError,
    clearProductMessage,
    clearCurrentProduct,
    patchMyProductLocal,
} = productSlice.actions;

export default productSlice.reducer;