import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import axios from "axios";

import type {
    AuthenticationResponseJSON,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
} from "@simplewebauthn/browser";

import api from "@/services/axios";

import {
    setUser,
} from "@/features/auth/store/authSlice";

import type {
    AuthUser,
} from "@/features/auth/types/auth.types";


/* =========================================================
   TYPES
========================================================= */

/**
 * Generic API response used by passkey management endpoints.
 */
interface PasskeyApiResponse {
    message?: string;
    [key: string]: unknown;
}


/**
 * Registered passkey returned by:
 *
 * GET /api/auth/passkey
 */
export interface RegisteredPasskey {
    credentialId: string;
    nickname?: string;
    deviceType?: string;
    createdAt?: string;
}


/**
 * Passkey Redux state.
 */
interface PasskeyState {
    loading: boolean;
    error: string | null;
    successMessage: string | null;

    passkeys: RegisteredPasskey[];
}


/* =========================================================
   THUNK PAYLOAD TYPES
========================================================= */

interface LoginOptionsPayload {
    email: string;
}


interface VerifyRegistrationPayload {
    response: RegistrationResponseJSON;
    nickname?: string;
}


interface VerifyLoginPayload {
    email: string;
    response: AuthenticationResponseJSON;
}


/* =========================================================
   API ERROR HELPER
========================================================= */

const getApiErrorMessage = (
    error: unknown,
    fallback: string,
): string => {

    if (axios.isAxiosError(error)) {

        const message =
            error.response?.data?.message;


        if (
            typeof message === "string" &&
            message.trim()
        ) {
            return message;
        }


        const apiError =
            error.response?.data?.error;


        if (
            typeof apiError === "string" &&
            apiError.trim()
        ) {
            return apiError;
        }
    }


    if (error instanceof Error) {
        return (
            error.message ||
            fallback
        );
    }


    return fallback;
};


/* =========================================================
   API BASE ROUTE
========================================================= */

const PASSKEY_BASE_URL =
    "/auth/passkey";


/* =========================================================
   1. GET REGISTRATION OPTIONS
========================================================= */

export const getPasskeyRegistrationOptions =
    createAsyncThunk<
        PublicKeyCredentialCreationOptionsJSON,
        void,
        {
            rejectValue: string;
        }
    >(
        "passkey/getRegistrationOptions",

        async (
            _,
            {
                rejectWithValue,
            },
        ) => {

            try {

                const {
                    data,
                } =
                    await api.get<PublicKeyCredentialCreationOptionsJSON>(
                        `${PASSKEY_BASE_URL}/register/options`,
                    );


                return data;

            } catch (error: unknown) {

                return rejectWithValue(
                    getApiErrorMessage(
                        error,
                        "Unable to generate passkey registration options.",
                    ),
                );
            }
        },
    );


/* =========================================================
   2. VERIFY REGISTRATION
========================================================= */

export const verifyPasskeyRegistration =
    createAsyncThunk<
        PasskeyApiResponse,
        VerifyRegistrationPayload,
        {
            rejectValue: string;
        }
    >(
        "passkey/verifyRegistration",

        async (
            {
                response,
                nickname,
            },
            {
                rejectWithValue,
            },
        ) => {

            try {

                const {
                    data,
                } =
                    await api.post<PasskeyApiResponse>(
                        `${PASSKEY_BASE_URL}/register/verify`,
                        {
                            response,
                            nickname,
                        },
                    );


                return data;

            } catch (error: unknown) {

                return rejectWithValue(
                    getApiErrorMessage(
                        error,
                        "Passkey registration failed.",
                    ),
                );
            }
        },
    );


/* =========================================================
   3. GET LOGIN OPTIONS
========================================================= */

export const getPasskeyLoginOptions =
    createAsyncThunk<
        PublicKeyCredentialRequestOptionsJSON,
        LoginOptionsPayload,
        {
            rejectValue: string;
        }
    >(
        "passkey/getLoginOptions",

        async (
            {
                email,
            },
            {
                rejectWithValue,
            },
        ) => {

            try {

                const {
                    data,
                } =
                    await api.post<PublicKeyCredentialRequestOptionsJSON>(
                        `${PASSKEY_BASE_URL}/login/options`,
                        {
                            email,
                        },
                    );


                return data;

            } catch (error: unknown) {

                return rejectWithValue(
                    getApiErrorMessage(
                        error,
                        "Unable to generate passkey login options.",
                    ),
                );
            }
        },
    );


/* =========================================================
   4. VERIFY PASSKEY LOGIN
========================================================= */

/**
 * Backend returns the authenticated user directly:
 *
 * {
 *     _id,
 *     name,
 *     email,
 *     phone?,
 *     role,
 *     shop,
 *     mustChangePassword
 * }
 *
 * IMPORTANT:
 *
 * Backend also sets the HttpOnly JWT cookie.
 *
 * But setting the cookie alone does NOT update Redux.
 *
 * Therefore after successful WebAuthn verification:
 *
 * Backend JWT cookie
 *        +
 * dispatch(setUser(data))
 *
 * are both performed.
 *
 * This means Navbar/Profile/etc update immediately without
 * requiring a browser refresh.
 */

export const verifyPasskeyLogin =
    createAsyncThunk<
        AuthUser,
        VerifyLoginPayload,
        {
            rejectValue: string;
        }
    >(
        "passkey/verifyLogin",

        async (
            {
                email,
                response,
            },
            {
                dispatch,
                rejectWithValue,
            },
        ) => {

            try {

                const {
                    data,
                } =
                    await api.post<AuthUser>(
                        `${PASSKEY_BASE_URL}/login/verify`,
                        {
                            email,
                            response,
                        },
                    );


                /*
                 * CRITICAL FIX
                 *
                 * Passkey authentication creates the backend
                 * session cookie, but Navbar reads auth.user
                 * from Redux.
                 *
                 * Update authSlice immediately.
                 */
                dispatch(
                    setUser(data),
                );


                return data;

            } catch (error: unknown) {

                return rejectWithValue(
                    getApiErrorMessage(
                        error,
                        "Passkey authentication failed.",
                    ),
                );
            }
        },
    );


/* =========================================================
   5. GET REGISTERED PASSKEYS
========================================================= */

export const getPasskeys =
    createAsyncThunk<
        RegisteredPasskey[],
        void,
        {
            rejectValue: string;
        }
    >(
        "passkey/getPasskeys",

        async (
            _,
            {
                rejectWithValue,
            },
        ) => {

            try {

                const {
                    data,
                } =
                    await api.get<
                        RegisteredPasskey[]
                    >(
                        PASSKEY_BASE_URL,
                    );


                return data;

            } catch (error: unknown) {

                return rejectWithValue(
                    getApiErrorMessage(
                        error,
                        "Unable to load registered passkeys.",
                    ),
                );
            }
        },
    );


/* =========================================================
   6. DELETE PASSKEY
========================================================= */

export const deletePasskey =
    createAsyncThunk<
        PasskeyApiResponse,
        string,
        {
            rejectValue: string;
        }
    >(
        "passkey/deletePasskey",

        async (
            credentialId,
            {
                rejectWithValue,
            },
        ) => {

            try {

                const {
                    data,
                } =
                    await api.delete<PasskeyApiResponse>(
                        `${PASSKEY_BASE_URL}/${encodeURIComponent(
                            credentialId,
                        )}`,
                    );


                return data;

            } catch (error: unknown) {

                return rejectWithValue(
                    getApiErrorMessage(
                        error,
                        "Unable to remove passkey.",
                    ),
                );
            }
        },
    );


/* =========================================================
   INITIAL STATE
========================================================= */

const initialState: PasskeyState = {
    loading: false,

    error: null,

    successMessage: null,

    passkeys: [],
};


/* =========================================================
   SLICE
========================================================= */

const passkeySlice = createSlice({
    name: "passkey",

    initialState,

    reducers: {

        /* =================================================
           CLEAR ERROR
        ================================================= */

        clearPasskeyError(
            state,
        ) {
            state.error = null;
        },


        /* =================================================
           CLEAR MESSAGE
        ================================================= */

        clearPasskeyMessage(
            state,
        ) {
            state.successMessage =
                null;
        },


        /* =================================================
           RESET
        ================================================= */

        resetPasskeyState(
            state,
        ) {
            state.loading = false;

            state.error = null;

            state.successMessage =
                null;

            state.passkeys = [];
        },
    },


    /* =====================================================
       ASYNC THUNK REDUCERS
    ===================================================== */

    extraReducers: (
        builder,
    ) => {

        builder


            /* =================================================
               REGISTRATION OPTIONS
            ================================================= */

            .addCase(
                getPasskeyRegistrationOptions.pending,

                (
                    state,
                ) => {
                    state.loading = true;
                    state.error = null;
                },
            )


            .addCase(
                getPasskeyRegistrationOptions.fulfilled,

                (
                    state,
                ) => {
                    state.loading = false;
                },
            )


            .addCase(
                getPasskeyRegistrationOptions.rejected,

                (
                    state,
                    action,
                ) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Unable to generate registration options.";
                },
            )


            /* =================================================
               REGISTRATION VERIFICATION
            ================================================= */

            .addCase(
                verifyPasskeyRegistration.pending,

                (
                    state,
                ) => {
                    state.loading = true;

                    state.error = null;

                    state.successMessage =
                        null;
                },
            )


            .addCase(
                verifyPasskeyRegistration.fulfilled,

                (
                    state,
                    action,
                ) => {
                    state.loading = false;

                    state.successMessage =
                        action.payload.message ||
                        "Passkey registered successfully.";
                },
            )


            .addCase(
                verifyPasskeyRegistration.rejected,

                (
                    state,
                    action,
                ) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Passkey registration failed.";
                },
            )


            /* =================================================
               LOGIN OPTIONS
            ================================================= */

            .addCase(
                getPasskeyLoginOptions.pending,

                (
                    state,
                ) => {
                    state.loading = true;

                    state.error = null;
                },
            )


            .addCase(
                getPasskeyLoginOptions.fulfilled,

                (
                    state,
                ) => {
                    state.loading = false;
                },
            )


            .addCase(
                getPasskeyLoginOptions.rejected,

                (
                    state,
                    action,
                ) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Unable to generate login options.";
                },
            )


            /* =================================================
               LOGIN VERIFICATION
            ================================================= */

            .addCase(
                verifyPasskeyLogin.pending,

                (
                    state,
                ) => {
                    state.loading = true;

                    state.error = null;

                    state.successMessage =
                        null;
                },
            )


            .addCase(
                verifyPasskeyLogin.fulfilled,

                (
                    state,
                ) => {
                    state.loading = false;

                    state.successMessage =
                        "Passkey authentication successful.";
                },
            )


            .addCase(
                verifyPasskeyLogin.rejected,

                (
                    state,
                    action,
                ) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Passkey authentication failed.";
                },
            )


            /* =================================================
               GET REGISTERED PASSKEYS
            ================================================= */

            .addCase(
                getPasskeys.pending,

                (
                    state,
                ) => {
                    state.loading = true;

                    state.error = null;
                },
            )


            .addCase(
                getPasskeys.fulfilled,

                (
                    state,
                    action,
                ) => {
                    state.loading = false;

                    state.passkeys =
                        action.payload;
                },
            )


            .addCase(
                getPasskeys.rejected,

                (
                    state,
                    action,
                ) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Unable to load registered passkeys.";
                },
            )


            /* =================================================
               DELETE PASSKEY
            ================================================= */

            .addCase(
                deletePasskey.pending,

                (
                    state,
                ) => {
                    state.loading = true;

                    state.error = null;

                    state.successMessage =
                        null;
                },
            )


            .addCase(
                deletePasskey.fulfilled,

                (
                    state,
                    action,
                ) => {
                    state.loading = false;

                    state.successMessage =
                        action.payload.message ||
                        "Passkey removed successfully.";
                },
            )


            .addCase(
                deletePasskey.rejected,

                (
                    state,
                    action,
                ) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Unable to remove passkey.";
                },
            );
    },
});


/* =========================================================
   ACTIONS
========================================================= */

export const {
    clearPasskeyError,
    clearPasskeyMessage,
    resetPasskeyState,
} = passkeySlice.actions;


/* =========================================================
   REDUCER
========================================================= */

export default passkeySlice.reducer;