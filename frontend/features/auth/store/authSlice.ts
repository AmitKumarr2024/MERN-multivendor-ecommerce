import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";

import axios from "axios";

import api from "@/services/axios";

import type {
    AuthState,
    AuthUser,
    ChangePasswordPayload,
    ForgotPasswordPayload,
    LoginPayload,
    MessageResponse,
    RegisterPayload,
    ResetPasswordPayload,
    UpdateMePayload,
    UpdateRolePayload,
} from "../types/auth.types";


/* =========================================================
   ERROR HELPER

   Extracts a readable error message from:
   - Backend Axios responses
   - JavaScript Error objects
   - Unknown errors
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

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong";
}


/* =========================================================
   REGISTER
   POST /api/auth/register

   Backend returns the user DIRECTLY:

   {
       _id,
       name,
       email,
       phone,
       role,
       shop
   }

   Therefore this thunk returns AuthUser,
   NOT { user: AuthUser }.
========================================================= */

export const registerUser = createAsyncThunk<
    AuthUser,
    RegisterPayload,
    { rejectValue: string }
>(
    "auth/register",

    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post<AuthUser>(
                "/auth/register",
                payload,
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);


/* =========================================================
   LOGIN
   POST /api/auth/login

   Successful login returns the authenticated user directly.
========================================================= */

export const loginUser = createAsyncThunk<
    AuthUser,
    LoginPayload,
    { rejectValue: string }
>(
    "auth/login",

    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post<AuthUser>(
                "/auth/login",
                payload,
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);


/* =========================================================
   GET CURRENT USER
   GET /api/auth/me
========================================================= */

export const getMe = createAsyncThunk<
    AuthUser,
    void,
    { rejectValue: string }
>(
    "auth/getMe",

    async (_, { rejectWithValue }) => {
        try {
            const response =
                await api.get<AuthUser>(
                    "/auth/me",
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);


/* =========================================================
   UPDATE CURRENT USER
   PUT /api/auth/me
========================================================= */

export const updateMe = createAsyncThunk<
    AuthUser,
    UpdateMePayload,
    { rejectValue: string }
>(
    "auth/updateMe",

    async (payload, { rejectWithValue }) => {
        try {
            const response =
                await api.put<AuthUser>(
                    "/auth/me",
                    payload,
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);


/* =========================================================
   CHANGE PASSWORD
   PUT /api/auth/change-password

   This endpoint only needs a success message.
========================================================= */

export const changePassword = createAsyncThunk<
    MessageResponse,
    ChangePasswordPayload,
    { rejectValue: string }
>(
    "auth/changePassword",

    async (payload, { rejectWithValue }) => {
        try {
            const response =
                await api.put<MessageResponse>(
                    "/auth/change-password",
                    payload,
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);


/* =========================================================
   UPDATE ROLE
   PUT /api/auth/role

   Backend returns the updated user directly.
========================================================= */

export const updateMyRole = createAsyncThunk<
    AuthUser,
    UpdateRolePayload,
    { rejectValue: string }
>(
    "auth/updateRole",

    async (payload, { rejectWithValue }) => {
        try {
            const response =
                await api.put<AuthUser>(
                    "/auth/role",
                    payload,
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);


/* =========================================================
   FORGOT PASSWORD
   POST /api/auth/forgot-password
========================================================= */

export const forgotPassword = createAsyncThunk<
    MessageResponse,
    ForgotPasswordPayload,
    { rejectValue: string }
>(
    "auth/forgotPassword",

    async (payload, { rejectWithValue }) => {
        try {
            const response =
                await api.post<MessageResponse>(
                    "/auth/forgot-password",
                    payload,
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);


/* =========================================================
   RESET PASSWORD
   POST /api/auth/reset-password
========================================================= */

export const resetPassword = createAsyncThunk<
    MessageResponse,
    ResetPasswordPayload,
    { rejectValue: string }
>(
    "auth/resetPassword",

    async (payload, { rejectWithValue }) => {
        try {
            const response =
                await api.post<MessageResponse>(
                    "/auth/reset-password",
                    payload,
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);


/* =========================================================
   LOGOUT
   POST /api/auth/logout
========================================================= */

export const logoutUser = createAsyncThunk<
    MessageResponse,
    void,
    { rejectValue: string }
>(
    "auth/logout",

    async (_, { rejectWithValue }) => {
        try {
            const response =
                await api.post<MessageResponse>(
                    "/auth/logout",
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);


/* =========================================================
   INITIAL AUTH STATE
========================================================= */

const initialState: AuthState = {
    user: null,

    loading: false,
    initialized: false,

    error: null,
    successMessage: null,
};


/* =========================================================
   AUTH SLICE
========================================================= */

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {

        /* Clear API/auth error */
        clearAuthError(state) {
            state.error = null;
        },


        /* Clear success message */
        clearAuthMessage(state) {
            state.successMessage = null;
        },


        /* Manually update authenticated user */
        setUser(
            state,
            action: PayloadAction<AuthUser | null>,
        ) {
            state.user = action.payload;
        },


        /* Reset complete authentication state */
        resetAuthState(state) {
            state.user = null;

            state.loading = false;
            state.initialized = true;

            state.error = null;
            state.successMessage = null;
        },
    },


    /* =====================================================
       ASYNC THUNK REDUCERS
    ===================================================== */

    extraReducers: (builder) => {

        /* =================================================
           REGISTER
        ================================================= */

        builder
            .addCase(
                registerUser.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.successMessage = null;
                },
            )

            .addCase(
                registerUser.fulfilled,
                (state, action) => {
                    state.loading = false;

                    /*
                     * action.payload IS the user.
                     *
                     * NOT:
                     * action.payload.user
                     */
                    state.user = action.payload;

                    state.initialized = true;

                    state.successMessage =
                        "Registration successful";
                },
            )

            .addCase(
                registerUser.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Registration failed";
                },
            );


        /* =================================================
           LOGIN
        ================================================= */

        builder
            .addCase(
                loginUser.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.successMessage = null;
                },
            )

            .addCase(
                loginUser.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload;

                    state.initialized = true;

                    state.successMessage =
                        "Login successful";
                },
            )

            .addCase(
                loginUser.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Login failed";
                },
            );


        /* =================================================
           GET CURRENT USER
        ================================================= */

        builder
            .addCase(
                getMe.pending,
                (state) => {
                    state.loading = true;
                },
            )

            .addCase(
                getMe.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload;

                    state.initialized = true;
                    state.error = null;
                },
            )

            .addCase(
                getMe.rejected,
                (state) => {
                    state.loading = false;

                    state.user = null;

                    /*
                     * Authentication initialization has
                     * completed even if no session exists.
                     */
                    state.initialized = true;
                },
            );


        /* =================================================
           UPDATE PROFILE
        ================================================= */

        builder
            .addCase(
                updateMe.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                },
            )

            .addCase(
                updateMe.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload;

                    state.successMessage =
                        "Profile updated";
                },
            )

            .addCase(
                updateMe.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Profile update failed";
                },
            );


        /* =================================================
           CHANGE PASSWORD
        ================================================= */

        builder
            .addCase(
                changePassword.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.successMessage = null;
                },
            )

            .addCase(
                changePassword.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.successMessage =
                        action.payload.message ||
                        "Password changed";
                },
            )

            .addCase(
                changePassword.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Password change failed";
                },
            );


        /* =================================================
           UPDATE ROLE
        ================================================= */

        builder
            .addCase(
                updateMyRole.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                },
            )

            .addCase(
                updateMyRole.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload;

                    state.successMessage =
                        "Role updated";
                },
            )

            .addCase(
                updateMyRole.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Role update failed";
                },
            );


        /* =================================================
           FORGOT PASSWORD
        ================================================= */

        builder
            .addCase(
                forgotPassword.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.successMessage = null;
                },
            )

            .addCase(
                forgotPassword.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.successMessage =
                        action.payload.message ||
                        "Reset instructions sent";
                },
            )

            .addCase(
                forgotPassword.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Request failed";
                },
            );


        /* =================================================
           RESET PASSWORD
        ================================================= */

        builder
            .addCase(
                resetPassword.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.successMessage = null;
                },
            )

            .addCase(
                resetPassword.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.successMessage =
                        action.payload.message ||
                        "Password reset successful";
                },
            )

            .addCase(
                resetPassword.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Password reset failed";
                },
            );


        /* =================================================
           LOGOUT
        ================================================= */

        builder
            .addCase(
                logoutUser.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                },
            )

            .addCase(
                logoutUser.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user = null;
                    state.initialized = true;

                    state.successMessage =
                        action.payload.message ||
                        "Logged out successfully";
                },
            )

            .addCase(
                logoutUser.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Logout failed";
                },
            );
    },
});


/* =========================================================
   ACTIONS
========================================================= */

export const {
    clearAuthError,
    clearAuthMessage,
    setUser,
    resetAuthState,
} = authSlice.actions;


/* =========================================================
   REDUCER
========================================================= */

export default authSlice.reducer;