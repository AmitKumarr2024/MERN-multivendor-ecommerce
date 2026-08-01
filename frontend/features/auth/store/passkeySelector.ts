import type { RootState } from "@/store/store";

import type {
    RegisteredPasskey,
} from "@/features/auth/store/passkeySlice";


/* =========================================================
   PASSKEY STATE
========================================================= */

/**
 * Returns the complete passkey Redux state.
 *
 * Use this only when a component needs several passkey
 * properties at the same time.
 */
export const selectPasskey = (
    state: RootState,
) => state.passkey;


/* =========================================================
   LOADING
========================================================= */

/**
 * True while a passkey API operation is running.
 *
 * Examples:
 *
 * - Loading registered passkeys
 * - Generating registration options
 * - Verifying registration
 * - Generating login options
 * - Verifying login
 * - Removing a passkey
 */
export const selectPasskeyLoading = (
    state: RootState,
): boolean => state.passkey.loading;


/* =========================================================
   ERROR
========================================================= */

/**
 * Current passkey-related error.
 *
 * null means there is currently no passkey error.
 */
export const selectPasskeyError = (
    state: RootState,
): string | null =>
    state.passkey.error;


/* =========================================================
   SUCCESS MESSAGE
========================================================= */

/**
 * Success message produced by passkey operations.
 */
export const selectPasskeySuccessMessage = (
    state: RootState,
): string | null =>
    state.passkey.successMessage;


/* =========================================================
   REGISTERED PASSKEYS
========================================================= */

/**
 * All passkeys registered to the currently authenticated
 * user's account.
 */
export const selectRegisteredPasskeys = (
    state: RootState,
): RegisteredPasskey[] =>
    state.passkey.passkeys;


/* =========================================================
   PASSKEY COUNT
========================================================= */

/**
 * Number of passkeys currently registered.
 */
export const selectPasskeyCount = (
    state: RootState,
): number =>
    state.passkey.passkeys.length;


/* =========================================================
   HAS PASSKEYS
========================================================= */

/**
 * True when at least one passkey is registered.
 */
export const selectHasPasskeys = (
    state: RootState,
): boolean =>
    state.passkey.passkeys.length > 0;