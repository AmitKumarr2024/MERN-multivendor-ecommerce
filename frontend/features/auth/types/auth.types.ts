/* =========================================================
   AUTH ROLES

   Public users can register as:
   - buyer
   - seller

   Admin role must never be selectable during
   public registration.
========================================================= */

export type UserRole = "buyer" | "seller" | "admin";


/* =========================================================
   AUTH USER
========================================================= */

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    phone?: string | null;

    role: UserRole;

    shop?: string | null;

    mustChangePassword?: boolean;
}


/* =========================================================
   AUTH RESPONSE

   Used by:
   - register
   - login
   - getMe
   - updateMe
   - updateRole

   If your backend returns the user directly instead of
   { user: ... }, see the backend-response note below.
========================================================= */

export interface AuthResponse {
    user: AuthUser;
    message?: string;
}


/* =========================================================
   REGISTER

   confirmPassword is intentionally NOT included.

   It exists only inside RegisterForm for frontend
   validation and must not be sent to the API.
========================================================= */

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;

    phone?: string;

    role: "buyer" | "seller";
}


/* =========================================================
   LOGIN
========================================================= */

export interface LoginPayload {
    email: string;
    password: string;
}


/* =========================================================
   UPDATE PROFILE
========================================================= */

export interface UpdateMePayload {
    name?: string;
    phone?: string;
}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}


/* =========================================================
   UPDATE ROLE
========================================================= */

export interface UpdateRolePayload {
    role: "buyer" | "seller";
}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

export interface ForgotPasswordPayload {
    email: string;
}


/* =========================================================
   RESET PASSWORD

   Backend expects:
   {
     token,
     newPassword
   }
========================================================= */

export interface ResetPasswordPayload {
    token: string;
    newPassword: string;
}


/* =========================================================
   MESSAGE RESPONSE
========================================================= */

export interface MessageResponse {
    message: string;
}


/* =========================================================
   AUTH REDUX STATE
========================================================= */

export interface AuthState {
    user: AuthUser | null;

    loading: boolean;

    /*
     * Prevents protected UI from making authentication
     * decisions before GET /auth/me has completed.
     */
    initialized: boolean;

    error: string | null;
    successMessage: string | null;
}