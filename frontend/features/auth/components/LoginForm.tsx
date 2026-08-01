"use client";

import {
    FormEvent,
    useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    Eye,
    EyeOff,
} from "lucide-react";

import { toast } from "sonner";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import {
    loginUser,
} from "@/features/auth/store/authSlice";


/* =========================================================
   LOGIN FORM

   Purpose:
   Authenticates an existing marketplace user using:

   - Email
   - Password

   Backend endpoint:
   POST /api/auth/login

   Login flow:

   Email + Password
        ↓
   Redux loginUser()
        ↓
   Backend authentication
        ↓
   JWT/session cookie
        ↓
   Redux user state
        ↓
   Redirect based on account role

   Passkey authentication is handled separately through:
   /passkey
========================================================= */

export default function LoginForm() {

    const dispatch = useAppDispatch();

    const router = useRouter();


    /* =====================================================
       REDUX AUTH STATE

       loading:
       Indicates whether authentication request is running.

       error:
       Contains backend/API authentication error.
    ===================================================== */

    const {
        loading,
        error,
    } = useAppSelector(
        (state) => state.auth,
    );


    /* =====================================================
       LOCAL FORM STATE
    ===================================================== */

    const [
        formData,
        setFormData,
    ] = useState({
        email: "",
        password: "",
    });


    /* =====================================================
       LOCAL VALIDATION ERROR

       Used for frontend validation errors before making
       an API request.
    ===================================================== */

    const [
        formError,
        setFormError,
    ] = useState<string | null>(
        null,
    );


    /* =====================================================
       PASSWORD VISIBILITY

       false:
       Password is hidden.

       true:
       Password is visible.
    ===================================================== */

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);


    /* =====================================================
       INPUT CHANGE
    ===================================================== */

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {

        const {
            name,
            value,
        } = event.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));


        /*
         * Remove frontend validation error when the user
         * starts correcting the input.
         */

        if (formError) {
            setFormError(null);
        }
    };


    /* =====================================================
       EMAIL + PASSWORD LOGIN
    ===================================================== */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {

        event.preventDefault();

        setFormError(null);


        /* Normalize email before sending it to backend */

        const email =
            formData.email
                .trim()
                .toLowerCase();


        /* =================================================
           REQUIRED FIELD VALIDATION
        ================================================= */

        if (
            !email ||
            !formData.password
        ) {

            const message =
                "Please enter your email and password.";

            setFormError(message);

            toast.error(message);

            return;
        }


        try {

            /* =============================================
               LOGIN REQUEST

               loginUser should return the authenticated
               user information after successful login.
            ============================================= */

            const response =
                await dispatch(
                    loginUser({
                        email,
                        password:
                            formData.password,
                    }),
                ).unwrap();


            /* =============================================
               SUCCESS NOTIFICATION
            ============================================= */

            toast.success(
                "Signed in successfully",
                {
                    description:
                        `Welcome back${response.user?.name
                            ? `, ${response.user.name}`
                            : ""
                        }.`,
                },
            );


            /* =============================================
               ROLE-BASED REDIRECT

               Seller:
               Seller dashboard/shop area.

               Admin:
               Admin dashboard.

               Buyer:
               Marketplace home.

               If your login response does not contain
               response.user, change these checks according
               to the actual AuthResponse structure.
            ============================================= */

            if (
                response.user?.role ===
                "seller"
            ) {

                router.replace(
                    "/seller",
                );

            } else if (
                response.user?.role ===
                "admin"
            ) {

                router.replace(
                    "/admin",
                );

            } else {

                router.replace("/");
            }


            router.refresh();

        } catch (caughtError) {

            /* =============================================
               LOGIN ERROR

               Redux/authSlice still stores the backend
               error for the inline error box.

               Sonner provides immediate visual feedback.
            ============================================= */

            if (
                typeof caughtError ===
                "string"
            ) {

                toast.error(
                    caughtError,
                );

            } else {

                toast.error(
                    "Unable to sign in. Please check your credentials.",
                );
            }
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

                <label
                    htmlFor="email"
                    className="
                        mb-2
                        block
                        text-sm
                        font-semibold
                        text-zinc-800

                        dark:text-zinc-200
                    "
                >
                    Email address
                </label>


                <input
                    id="email"
                    name="email"
                    type="email"

                    autoComplete="email"

                    value={
                        formData.email
                    }

                    onChange={
                        handleChange
                    }

                    placeholder="you@example.com"

                    disabled={loading}

                    required

                    className="
                        w-full
                        rounded-xl
                        border
                        border-zinc-300
                        bg-white
                        px-4
                        py-3
                        text-sm
                        text-zinc-950
                        outline-none
                        transition

                        placeholder:text-zinc-400

                        focus:border-zinc-950
                        focus:ring-2
                        focus:ring-zinc-950/10

                        disabled:cursor-not-allowed
                        disabled:bg-zinc-100

                        dark:border-zinc-700
                        dark:bg-zinc-950
                        dark:text-white
                        dark:placeholder:text-zinc-500
                        dark:focus:border-zinc-400
                        dark:focus:ring-white/10
                    "
                />

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

                <div className="mb-2 flex items-center justify-between gap-4">

                    <label
                        htmlFor="password"
                        className="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                        Password
                    </label>


                    <Link
                        href="/forgot-password"
                        className="
                            text-xs
                            font-semibold
                            text-zinc-500
                            transition

                            hover:text-zinc-950

                            dark:text-zinc-400
                            dark:hover:text-white
                        "
                    >
                        Forgot password?
                    </Link>

                </div>


                <div className="relative">

                    <input
                        id="password"
                        name="password"

                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }

                        autoComplete="current-password"

                        value={
                            formData.password
                        }

                        onChange={
                            handleChange
                        }

                        placeholder="Enter your password"

                        disabled={loading}

                        required

                        className="
                            w-full
                            rounded-xl
                            border
                            border-zinc-300
                            bg-white
                            px-4
                            py-3
                            pr-12
                            text-sm
                            text-zinc-950
                            outline-none
                            transition

                            placeholder:text-zinc-400

                            focus:border-zinc-950
                            focus:ring-2
                            focus:ring-zinc-950/10

                            disabled:cursor-not-allowed
                            disabled:bg-zinc-100

                            dark:border-zinc-700
                            dark:bg-zinc-950
                            dark:text-white
                            dark:placeholder:text-zinc-500
                            dark:focus:border-zinc-400
                            dark:focus:ring-white/10
                        "
                    />


                    {/* =========================================
                        SHOW / HIDE PASSWORD

                        Eye:
                        Password currently hidden.

                        EyeOff:
                        Password currently visible.
                    ========================================= */}

                    <button
                        type="button"

                        disabled={loading}

                        onClick={() =>
                            setShowPassword(
                                (previous) =>
                                    !previous,
                            )
                        }

                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }

                        title={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }

                        className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            rounded-md
                            p-1
                            text-zinc-400
                            transition

                            hover:text-zinc-950

                            focus:outline-none
                            focus:ring-2
                            focus:ring-zinc-300

                            disabled:cursor-not-allowed

                            dark:text-zinc-500
                            dark:hover:text-white
                            dark:focus:ring-zinc-700
                        "
                    >

                        {showPassword ? (

                            <EyeOff
                                className="h-5 w-5"
                                aria-hidden="true"
                            />

                        ) : (

                            <Eye
                                className="h-5 w-5"
                                aria-hidden="true"
                            />

                        )}

                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR

                formError:
                Frontend validation error.

                error:
                Backend/API error from Redux authSlice.
            ================================================= */}

            {(formError || error) && (

                <div
                    role="alert"

                    className="
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        leading-5
                        text-red-700

                        dark:border-red-900/50
                        dark:bg-red-950/30
                        dark:text-red-300
                    "
                >
                    {formError || error}
                </div>

            )}


            {/* =================================================
                PASSWORD LOGIN BUTTON
            ================================================= */}

            <button
                type="submit"

                disabled={loading}

                className="
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-zinc-950
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition

                    hover:bg-zinc-800

                    disabled:cursor-not-allowed
                    disabled:opacity-60

                    dark:bg-white
                    dark:text-zinc-950
                    dark:hover:bg-zinc-200
                "
            >

                {loading
                    ? "Signing in..."
                    : "Sign in"}

            </button>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="relative py-1">

                <div className="absolute inset-0 flex items-center">

                    <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />

                </div>


                <div className="relative flex justify-center">

                    <span className="
                        bg-white
                        px-3
                        text-xs
                        text-zinc-400

                        dark:bg-zinc-900
                        dark:text-zinc-500
                    ">
                        or
                    </span>

                </div>

            </div>


            {/* =================================================
                PASSKEY LOGIN

                WebAuthn authentication is handled separately
                inside /passkey.

                That flow can use:

                - Windows Hello
                - Face ID
                - Touch ID
                - Android biometrics
                - Device PIN
                - Hardware security keys
                - Cross-device WebAuthn when supported

                The login form therefore only navigates to
                the dedicated passkey page.
            ================================================= */}

            <Link
                href="/passkey"

                className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-zinc-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-zinc-800
                    transition

                    hover:border-zinc-400
                    hover:bg-zinc-50

                    dark:border-zinc-700
                    dark:bg-zinc-950
                    dark:text-zinc-200
                    dark:hover:border-zinc-500
                    dark:hover:bg-zinc-800
                "
            >

                <PasskeyIcon />

                Sign in with passkey

            </Link>


            {/* =================================================
                REGISTER
            ================================================= */}

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">

                Don&apos;t have an account?{" "}

                <Link
                    href="/register"

                    className="
                        font-bold
                        text-zinc-950
                        transition

                        hover:text-zinc-700

                        dark:text-white
                        dark:hover:text-zinc-300
                    "
                >
                    Create account
                </Link>

            </p>

        </form>
    );
}


/* =========================================================
   PASSKEY ICON

   Small visual indicator used by the passkey login button.

   Actual WebAuthn functionality is NOT implemented here.
========================================================= */

function PasskeyIcon() {

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            aria-hidden="true"
        >

            <circle
                cx="8"
                cy="9"
                r="4"
                stroke="currentColor"
                strokeWidth="1.8"
            />


            <path
                d="M11 12l3 3m0 0h6m-6 0v3m3-3v2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

        </svg>
    );
}