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
    registerUser,
} from "@/features/auth/store/authSlice";


/* =========================================================
   REGISTRATION ROLE

   Public registration allows:
   - buyer
   - seller

   Admin must never be selectable during public signup.
========================================================= */

type RegisterRole = "buyer" | "seller";


/* =========================================================
   REGISTER RESPONSE

   IMPORTANT:

   The backend currently returns the authenticated user
   DIRECTLY after successful registration.

   Actual response:

   {
       _id,
       name,
       email,
       phone,
       role,
       shop
   }

   It does NOT return:

   {
       user: { ... }
   }

   Therefore use:

   response.role
   response.name

   NOT:

   response.user.role
========================================================= */

interface RegisterResponse {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "buyer" | "seller" | "admin";
    shop: string | null;
    mustChangePassword?: boolean;
}


/* =========================================================
   PASSWORD STRENGTH TYPE
========================================================= */

interface PasswordStrength {
    score: number;
    label: "" | "Weak" | "Fair" | "Good" | "Strong";
}


/* =========================================================
   PASSWORD STRENGTH HELPER

   Frontend UX helper only.

   Backend validation remains the final authority for
   password requirements.

   Score:
   0 = empty
   1 = weak
   2 = fair
   3 = good
   4 = strong
========================================================= */

function getPasswordStrength(
    password: string,
): PasswordStrength {

    if (!password) {
        return {
            score: 0,
            label: "",
        };
    }

    let score = 0;

    /* Minimum usable length */
    if (password.length >= 6) {
        score++;
    }

    /* Better password length */
    if (password.length >= 10) {
        score++;
    }

    /* Uppercase + lowercase */
    if (
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password)
    ) {
        score++;
    }

    /* Number + special character */
    if (
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    ) {
        score++;
    }

    if (score <= 1) {
        return {
            score: 1,
            label: "Weak",
        };
    }

    if (score === 2) {
        return {
            score: 2,
            label: "Fair",
        };
    }

    if (score === 3) {
        return {
            score: 3,
            label: "Good",
        };
    }

    return {
        score: 4,
        label: "Strong",
    };
}


/* =========================================================
   REGISTER FORM

   Backend endpoint:

   POST /api/auth/register

   Request payload:

   {
       name,
       email,
       phone,
       password,
       role
   }

   confirmPassword is frontend-only and is never sent
   to the backend.
========================================================= */

export default function RegisterForm() {

    const dispatch = useAppDispatch();
    const router = useRouter();


    /* =====================================================
       REDUX AUTH STATE
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
        name: "",
        email: "",
        phone: "",
        role: "buyer" as RegisterRole,
        password: "",
        confirmPassword: "",
    });


    /* =====================================================
       LOCAL VALIDATION ERROR
    ===================================================== */

    const [
        formError,
        setFormError,
    ] = useState<string | null>(
        null,
    );


    /* =====================================================
       PASSWORD VISIBILITY
    ===================================================== */

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);


    /* =====================================================
       PASSWORD STRENGTH
    ===================================================== */

    const passwordStrength =
        getPasswordStrength(
            formData.password,
        );


    /* =====================================================
       PASSWORD MATCH
    ===================================================== */

    const hasConfirmPassword =
        formData.confirmPassword.length > 0;

    const passwordsMatch =
        hasConfirmPassword &&
        formData.password ===
        formData.confirmPassword;


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

        if (formError) {
            setFormError(null);
        }
    };


    /* =====================================================
       ROLE CHANGE
    ===================================================== */

    const handleRoleChange = (
        role: RegisterRole,
    ) => {

        setFormData((previous) => ({
            ...previous,
            role,
        }));

        if (formError) {
            setFormError(null);
        }
    };


    /* =====================================================
       REGISTER
    ===================================================== */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {

        event.preventDefault();

        setFormError(null);


        /* Normalize user input */

        const name =
            formData.name.trim();

        const email =
            formData.email
                .trim()
                .toLowerCase();

        const phone =
            formData.phone.trim();


        /* =================================================
           REQUIRED FIELDS
        ================================================= */

        if (
            !name ||
            !email ||
            !formData.password ||
            !formData.confirmPassword
        ) {

            const message =
                "Please complete all required fields.";

            setFormError(message);
            toast.error(message);

            return;
        }


        /* =================================================
           PASSWORD LENGTH
        ================================================= */

        if (
            formData.password.length < 6
        ) {

            const message =
                "Password must be at least 6 characters.";

            setFormError(message);
            toast.error(message);

            return;
        }


        /* =================================================
           PASSWORD CONFIRMATION
        ================================================= */

        if (
            formData.password !==
            formData.confirmPassword
        ) {

            const message =
                "Passwords do not match.";

            setFormError(message);
            toast.error(message);

            return;
        }


        try {

            /* =============================================
               REGISTRATION REQUEST

               unwrap() returns the payload returned by
               registerUser.fulfilled.
            ============================================= */

            const response = await dispatch(
                    registerUser({
                        name,
                        email,

                        phone:
                            phone ||
                            undefined,

                        password:
                            formData.password,

                        role:
                            formData.role,
                    }),
                ).unwrap() as RegisterResponse;


            /*
             * Actual successful response:
             *
             * {
             *   _id: "...",
             *   name: "...",
             *   email: "...",
             *   phone: "...",
             *   role: "buyer",
             *   shop: null
             * }
             */

            console.log(
                "REGISTER RESPONSE:",
                response,
            );


            /* =============================================
               SELLER SUCCESS
            ============================================= */

            if (
                response.role ===
                "seller"
            ) {

                toast.success(
                    "Seller account created successfully",
                    {
                        description:
                            `Welcome, ${response.name}. Complete your shop setup to start selling.`,
                    },
                );


                router.replace(
                    "/seller/shop",
                );

                router.refresh();

                return;
            }


            /* =============================================
               BUYER SUCCESS
            ============================================= */

            toast.success(
                "Account created successfully",
                {
                    description:
                        `Welcome, ${response.name}.`,
                },
            );


            router.replace("/");

            router.refresh();

        } catch (caughtError) {

            /*
             * This block should now only run when the
             * registration thunk/API actually rejects.
             */

            console.error(
                "REGISTER ERROR:",
                caughtError,
            );


            const message =
                typeof caughtError === "string"
                    ? caughtError
                    : "Unable to create account. Please try again.";


            setFormError(message);

            toast.error(message);
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >

            {/* =================================================
                ACCOUNT TYPE
            ================================================= */}

            <div>

                <label className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    I want to
                </label>


                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {/* BUYER */}

                    <button
                        type="button"
                        disabled={loading}

                        onClick={() =>
                            handleRoleChange(
                                "buyer",
                            )
                        }

                        aria-pressed={
                            formData.role ===
                            "buyer"
                        }

                        className={`
                            rounded-xl
                            border
                            p-4
                            text-left
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60

                            ${formData.role ===
                                "buyer"

                                ? `
                                        border-zinc-950
                                        bg-zinc-950
                                        text-white

                                        dark:border-white
                                        dark:bg-white
                                        dark:text-zinc-950
                                    `

                                : `
                                        border-zinc-200
                                        bg-white
                                        text-zinc-700

                                        hover:border-zinc-400

                                        dark:border-zinc-700
                                        dark:bg-zinc-900
                                        dark:text-zinc-300
                                        dark:hover:border-zinc-500
                                    `
                            }
                        `}
                    >

                        <span className="block text-sm font-bold">
                            Buy products
                        </span>

                        <span
                            className={`
                                mt-1
                                block
                                text-xs

                                ${formData.role ===
                                    "buyer"
                                    ? "text-zinc-300 dark:text-zinc-600"
                                    : "text-zinc-500 dark:text-zinc-400"
                                }
                            `}
                        >
                            Personal shopping account
                        </span>

                    </button>


                    {/* SELLER */}

                    <button
                        type="button"
                        disabled={loading}

                        onClick={() =>
                            handleRoleChange(
                                "seller",
                            )
                        }

                        aria-pressed={
                            formData.role ===
                            "seller"
                        }

                        className={`
                            rounded-xl
                            border
                            p-4
                            text-left
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60

                            ${formData.role ===
                                "seller"

                                ? `
                                        border-zinc-950
                                        bg-zinc-950
                                        text-white

                                        dark:border-white
                                        dark:bg-white
                                        dark:text-zinc-950
                                    `

                                : `
                                        border-zinc-200
                                        bg-white
                                        text-zinc-700

                                        hover:border-zinc-400

                                        dark:border-zinc-700
                                        dark:bg-zinc-900
                                        dark:text-zinc-300
                                        dark:hover:border-zinc-500
                                    `
                            }
                        `}
                    >

                        <span className="block text-sm font-bold">
                            Sell products
                        </span>

                        <span
                            className={`
                                mt-1
                                block
                                text-xs

                                ${formData.role ===
                                    "seller"
                                    ? "text-zinc-300 dark:text-zinc-600"
                                    : "text-zinc-500 dark:text-zinc-400"
                                }
                            `}
                        >
                            Create a seller account
                        </span>

                    </button>

                </div>
            </div>


            {/* =================================================
                FULL NAME
            ================================================= */}

            <div>

                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                    Full name
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"

                    value={
                        formData.name
                    }

                    onChange={
                        handleChange
                    }

                    placeholder="Enter your full name"

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
                        dark:focus:border-zinc-400
                    "
                />

            </div>


            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
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
                        dark:focus:border-zinc-400
                    "
                />

            </div>


            {/* =================================================
                PHONE
            ================================================= */}

            <div>

                <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                    Phone number{" "}

                    <span className="font-normal text-zinc-400">
                        (optional)
                    </span>
                </label>

                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"

                    value={
                        formData.phone
                    }

                    onChange={
                        handleChange
                    }

                    placeholder="+91 98765 43210"

                    disabled={loading}

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
                        dark:focus:border-zinc-400
                    "
                />

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                    Password
                </label>


                <div className="relative">

                    <input
                        id="password"
                        name="password"

                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }

                        autoComplete="new-password"

                        value={
                            formData.password
                        }

                        onChange={
                            handleChange
                        }

                        placeholder="Create a strong password"

                        disabled={loading}

                        minLength={6}
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
                            dark:focus:border-zinc-400
                        "
                    />


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

                            disabled:cursor-not-allowed

                            dark:hover:text-white
                        "
                    >

                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}

                    </button>

                </div>


                {/* PASSWORD STRENGTH */}

                {formData.password && (

                    <div className="mt-3">

                        <div className="grid grid-cols-4 gap-1.5">

                            {[1, 2, 3, 4].map(
                                (level) => (

                                    <div
                                        key={level}

                                        className={`
                                            h-1.5
                                            rounded-full
                                            transition-colors

                                            ${level <=
                                                passwordStrength.score

                                                ? passwordStrength.score === 1
                                                    ? "bg-red-500"

                                                    : passwordStrength.score === 2
                                                        ? "bg-orange-500"

                                                        : passwordStrength.score === 3
                                                            ? "bg-yellow-500"

                                                            : "bg-emerald-500"

                                                : "bg-zinc-200 dark:bg-zinc-700"
                                            }
                                        `}
                                    />

                                ),
                            )}

                        </div>


                        <div className="mt-2 flex items-start justify-between gap-3">

                            <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                                Use uppercase, lowercase,
                                number and symbol.
                            </p>

                            <span
                                className={`
                                    shrink-0
                                    text-xs
                                    font-bold

                                    ${passwordStrength.score === 1
                                        ? "text-red-600 dark:text-red-400"

                                        : passwordStrength.score === 2
                                            ? "text-orange-600 dark:text-orange-400"

                                            : passwordStrength.score === 3
                                                ? "text-yellow-600 dark:text-yellow-400"

                                                : "text-emerald-600 dark:text-emerald-400"
                                    }
                                `}
                            >
                                {
                                    passwordStrength.label
                                }
                            </span>

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div>

                <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                    Confirm password
                </label>


                <div className="relative">

                    <input
                        id="confirmPassword"
                        name="confirmPassword"

                        type={
                            showConfirmPassword
                                ? "text"
                                : "password"
                        }

                        autoComplete="new-password"

                        value={
                            formData.confirmPassword
                        }

                        onChange={
                            handleChange
                        }

                        placeholder="Enter password again"

                        disabled={loading}

                        minLength={6}
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
                            dark:focus:border-zinc-400
                        "
                    />


                    <button
                        type="button"
                        disabled={loading}

                        onClick={() =>
                            setShowConfirmPassword(
                                (previous) =>
                                    !previous,
                            )
                        }

                        aria-label={
                            showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                        }

                        title={
                            showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
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

                            disabled:cursor-not-allowed

                            dark:hover:text-white
                        "
                    >

                        {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}

                    </button>

                </div>


                {/* PASSWORD MATCH */}

                {hasConfirmPassword && (

                    <p
                        className={`
                            mt-2
                            text-xs
                            font-semibold

                            ${passwordsMatch
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }
                        `}
                    >

                        {passwordsMatch
                            ? "Passwords match"
                            : "Passwords do not match"}

                    </p>

                )}

            </div>


            {/* =================================================
                ERROR
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
                SUBMIT
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
                    ? "Creating account..."

                    : formData.role === "seller"
                        ? "Create seller account"
                        : "Create buyer account"}

            </button>


            {/* =================================================
                LOGIN
            ================================================= */}

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">

                Already have an account?{" "}

                <Link
                    href="/login"

                    className="
                        font-bold
                        text-zinc-950
                        transition

                        hover:text-zinc-700

                        dark:text-white
                        dark:hover:text-zinc-300
                    "
                >
                    Sign in
                </Link>

            </p>

        </form>
    );
}