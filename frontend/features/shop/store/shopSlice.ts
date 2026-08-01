import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type {
    BusinessHours,
    BusinessHoursUpdatePayload,
    CreateShopPayload,
    GetAllShopsResponse,
    HolidayUpdatePayload,
    IsOpenResponse,
    Shop,
    ShopQueryParams,
    SlugCheckResponse,
    ToggleActiveResponse,
    UpdateShopPayload,
    UpdateSlugPayload,
} from "../types/shop.types";

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

const BASE_URL = "/shops";

/* =========================================================
   1. GET ALL SHOPS (directory)
   GET /api/shops
========================================================= */

export const fetchAllShops = createAsyncThunk<
    GetAllShopsResponse,
    ShopQueryParams | void,
    { rejectValue: string }
>("shop/fetchAll", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get<GetAllShopsResponse>(BASE_URL, {
            params: params ?? undefined,
        });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   2. GET SHOP BY SLUG (public dukan page)
   GET /api/shops/:slug
========================================================= */

export const fetchShopBySlug = createAsyncThunk<
    Shop,
    string,
    { rejectValue: string }
>("shop/fetchBySlug", async (slug, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Shop>(`${BASE_URL}/${slug}`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   3. CHECK IF SHOP IS OPEN
   GET /api/shops/:slug/is-open
========================================================= */

export const checkShopIsOpen = createAsyncThunk<
    IsOpenResponse,
    string,
    { rejectValue: string }
>("shop/checkIsOpen", async (slug, { rejectWithValue }) => {
    try {
        const { data } = await api.get<IsOpenResponse>(`${BASE_URL}/${slug}/is-open`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   4. GET MY SHOP
   GET /api/shops/me
========================================================= */

export const fetchMyShop = createAsyncThunk<
    Shop,
    void,
    { rejectValue: string }
>("shop/fetchMine", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Shop>(`${BASE_URL}/me`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   5. CREATE SHOP
   POST /api/shops
========================================================= */

export const createShop = createAsyncThunk<
    Shop,
    CreateShopPayload,
    { rejectValue: string }
>("shop/create", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post<Shop>(BASE_URL, payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   6. UPDATE MY SHOP
   PUT /api/shops/me
========================================================= */

export const updateMyShop = createAsyncThunk<
    Shop,
    UpdateShopPayload,
    { rejectValue: string }
>("shop/update", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.put<Shop>(`${BASE_URL}/me`, payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   7. TOGGLE SHOP ACTIVE
   PATCH /api/shops/me/toggle-active
========================================================= */

export const toggleShopActive = createAsyncThunk<
    ToggleActiveResponse,
    void,
    { rejectValue: string }
>("shop/toggleActive", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<ToggleActiveResponse>(
            `${BASE_URL}/me/toggle-active`,
        );
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   8. CHECK SLUG AVAILABILITY
   GET /api/shops/slug-check/:slug
========================================================= */

export const checkSlugAvailability = createAsyncThunk<
    SlugCheckResponse,
    string,
    { rejectValue: string }
>("shop/checkSlug", async (slug, { rejectWithValue }) => {
    try {
        const { data } = await api.get<SlugCheckResponse>(
            `${BASE_URL}/slug-check/${encodeURIComponent(slug)}`,
        );
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   9. UPDATE SHOP SLUG
   PUT /api/shops/me/slug
========================================================= */

export const updateShopSlug = createAsyncThunk<
    Shop,
    UpdateSlugPayload,
    { rejectValue: string }
>("shop/updateSlug", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.put<Shop>(`${BASE_URL}/me/slug`, payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   10. UPDATE BUSINESS HOURS
   PUT /api/shops/me/hours
========================================================= */

export const updateBusinessHours = createAsyncThunk<
    { businessHours: BusinessHours },
    BusinessHoursUpdatePayload,
    { rejectValue: string }
>("shop/updateHours", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.put<{ businessHours: BusinessHours }>(
            `${BASE_URL}/me/hours`,
            payload,
        );
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   11. UPDATE HOLIDAY DATES
   PATCH /api/shops/me/holidays
========================================================= */

export const updateHolidayDates = createAsyncThunk<
    { holidayDates: string[] },
    HolidayUpdatePayload,
    { rejectValue: string }
>("shop/updateHolidays", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<{ holidayDates: string[] }>(
            `${BASE_URL}/me/holidays`,
            payload,
        );
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   STATE
========================================================= */

interface ShopState {
    // Directory
    shops: GetAllShopsResponse["shops"];
    total: number;
    page: number;
    pages: number;
    directoryLoading: boolean;

    // Public shop-by-slug
    viewedShop: Shop | null;
    viewedShopLoading: boolean;
    isOpenInfo: IsOpenResponse | null;

    // Seller's own shop
    myShop: Shop | null;
    myShopLoading: boolean;
    /** null = not checked yet, false = confirmed no shop exists */
    hasCheckedMyShop: boolean;

    // Slug availability check (create/edit flows)
    slugCheck: SlugCheckResponse | null;
    slugChecking: boolean;

    mutating: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: ShopState = {
    shops: [],
    total: 0,
    page: 1,
    pages: 1,
    directoryLoading: false,

    viewedShop: null,
    viewedShopLoading: false,
    isOpenInfo: null,

    myShop: null,
    myShopLoading: false,
    hasCheckedMyShop: false,

    slugCheck: null,
    slugChecking: false,

    mutating: false,
    error: null,
    successMessage: null,
};

const shopSlice = createSlice({
    name: "shop",
    initialState,
    reducers: {
        clearShopError(state) {
            state.error = null;
        },
        clearShopMessage(state) {
            state.successMessage = null;
        },
        clearSlugCheck(state) {
            state.slugCheck = null;
        },
        clearViewedShop(state) {
            state.viewedShop = null;
            state.isOpenInfo = null;
        },
    },
    extraReducers: (builder) => {
        /* ---------- fetchAllShops ---------- */
        builder
            .addCase(fetchAllShops.pending, (state) => {
                state.directoryLoading = true;
                state.error = null;
            })
            .addCase(fetchAllShops.fulfilled, (state, action) => {
                state.directoryLoading = false;
                state.shops = action.payload.shops;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
            })
            .addCase(fetchAllShops.rejected, (state, action) => {
                state.directoryLoading = false;
                state.error = action.payload || "Failed to load shops";
            });

        /* ---------- fetchShopBySlug ---------- */
        builder
            .addCase(fetchShopBySlug.pending, (state) => {
                state.viewedShopLoading = true;
                state.error = null;
                state.viewedShop = null;
            })
            .addCase(fetchShopBySlug.fulfilled, (state, action) => {
                state.viewedShopLoading = false;
                state.viewedShop = action.payload;
            })
            .addCase(fetchShopBySlug.rejected, (state, action) => {
                state.viewedShopLoading = false;
                state.error = action.payload || "Shop not found";
            });

        /* ---------- checkShopIsOpen ---------- */
        builder.addCase(checkShopIsOpen.fulfilled, (state, action) => {
            state.isOpenInfo = action.payload;
        });

        /* ---------- fetchMyShop ---------- */
        builder
            .addCase(fetchMyShop.pending, (state) => {
                state.myShopLoading = true;
                state.error = null;
            })
            .addCase(fetchMyShop.fulfilled, (state, action) => {
                state.myShopLoading = false;
                state.myShop = action.payload;
                state.hasCheckedMyShop = true;
            })
            .addCase(fetchMyShop.rejected, (state, action) => {
                state.myShopLoading = false;
                state.myShop = null;
                state.hasCheckedMyShop = true;
                // "You have not created a shop yet" is expected, not a real error
                state.error = action.payload?.includes("not created")
                    ? null
                    : action.payload || "Failed to load your shop";
            });

        /* ---------- createShop ---------- */
        builder
            .addCase(createShop.pending, (state) => {
                state.mutating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createShop.fulfilled, (state, action) => {
                state.mutating = false;
                state.myShop = action.payload;
                state.hasCheckedMyShop = true;
                state.successMessage = "Shop created successfully!";
            })
            .addCase(createShop.rejected, (state, action) => {
                state.mutating = false;
                state.error = action.payload || "Failed to create shop";
            });

        /* ---------- updateMyShop ---------- */
        builder
            .addCase(updateMyShop.pending, (state) => {
                state.mutating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateMyShop.fulfilled, (state, action) => {
                state.mutating = false;
                state.myShop = action.payload;
                state.successMessage = "Shop updated successfully";
            })
            .addCase(updateMyShop.rejected, (state, action) => {
                state.mutating = false;
                state.error = action.payload || "Failed to update shop";
            });

        /* ---------- toggleShopActive ---------- */
        builder
            .addCase(toggleShopActive.fulfilled, (state, action) => {
                if (state.myShop) state.myShop.isActive = action.payload.isActive;
                state.successMessage = action.payload.isActive
                    ? "Shop is now visible to buyers"
                    : "Shop is now hidden from buyers";
            })
            .addCase(toggleShopActive.rejected, (state, action) => {
                state.error = action.payload || "Failed to toggle shop visibility";
            });

        /* ---------- checkSlugAvailability ---------- */
        builder
            .addCase(checkSlugAvailability.pending, (state) => {
                state.slugChecking = true;
            })
            .addCase(checkSlugAvailability.fulfilled, (state, action) => {
                state.slugChecking = false;
                state.slugCheck = action.payload;
            })
            .addCase(checkSlugAvailability.rejected, (state, action) => {
                state.slugChecking = false;
                state.error = action.payload || "Failed to check URL availability";
            });

        /* ---------- updateShopSlug ---------- */
        builder
            .addCase(updateShopSlug.pending, (state) => {
                state.mutating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateShopSlug.fulfilled, (state, action) => {
                state.mutating = false;
                state.myShop = action.payload;
                state.slugCheck = null;
                state.successMessage = "Shop URL updated successfully";
            })
            .addCase(updateShopSlug.rejected, (state, action) => {
                state.mutating = false;
                state.error = action.payload || "Failed to update shop URL";
            });

        /* ---------- updateBusinessHours ---------- */
        builder
            .addCase(updateBusinessHours.pending, (state) => {
                state.mutating = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateBusinessHours.fulfilled, (state, action) => {
                state.mutating = false;
                if (state.myShop) state.myShop.businessHours = action.payload.businessHours;
                state.successMessage = "Business hours updated";
            })
            .addCase(updateBusinessHours.rejected, (state, action) => {
                state.mutating = false;
                state.error = action.payload || "Failed to update business hours";
            });

        /* ---------- updateHolidayDates ---------- */
        builder
            .addCase(updateHolidayDates.pending, (state) => {
                state.error = null;
            })
            .addCase(updateHolidayDates.fulfilled, (state, action) => {
                if (state.myShop) state.myShop.holidayDates = action.payload.holidayDates;
                state.successMessage = "Holiday dates updated";
            })
            .addCase(updateHolidayDates.rejected, (state, action) => {
                state.error = action.payload || "Failed to update holiday dates";
            });
    },
});

export const { clearShopError, clearShopMessage, clearSlugCheck, clearViewedShop } =
    shopSlice.actions;

export default shopSlice.reducer;