"use client";

import {
    FormEvent,
    useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    startAuthentication,
} from "@simplewebauthn/browser";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import {
    getPasskeyLoginOptions,
    verifyPasskeyLogin,
} from "@/features/auth/store/passkeySlice";

export default function PasskeyPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const {
        loading,
        error,
    } = useAppSelector((state) => state.passkey);

    const [email, setEmail] = useState("");

    const [localError, setLocalError] = useState<
        string | null
    >(null);


    /* =========================================================
       PASSKEY LOGIN
  
       1. Get authentication options from backend
       2. Start browser WebAuthn authentication
       3. Browser/OS discovers available passkeys/devices
       4. Send signed response to backend
       5. Backend verifies and creates JWT cookie
    ========================================================= */

    const handlePasskeyLogin = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setLocalError(null);

        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setLocalError(
                "Please enter your email address.",
            );

            return;
        }

        try {
            /* -----------------------------------------
               STEP 1
               Ask backend for WebAuthn login options.
            ----------------------------------------- */

            const options = await dispatch(
                getPasskeyLoginOptions({
                    email: normalizedEmail,
                }),
            ).unwrap();


            /* -----------------------------------------
               STEP 2
               Start native WebAuthn authentication.
      
               Browser/OS decides what is available:
      
               Windows:
               - Windows Hello
               - PIN
               - Fingerprint
               - Face
      
               Mobile:
               - Fingerprint
               - Face ID
               - Device lock
      
               Cross-device authentication may also
               be offered by supported browsers.
            ----------------------------------------- */

            const response = await startAuthentication({
                optionsJSON: options as any,
            });


            /* -----------------------------------------
               STEP 3
               Send signed credential to backend.
            ----------------------------------------- */

            await dispatch(
                verifyPasskeyLogin({
                    email: normalizedEmail,
                    response,
                }),
            ).unwrap();


            /* -----------------------------------------
               STEP 4
               Backend has verified the credential
               and created the authentication cookie.
            ----------------------------------------- */

            router.replace("/");
            router.refresh();
        } catch (err) {
            /*
             Backend errors are already stored by Redux.
      
             This additionally handles browser WebAuthn
             errors such as user cancellation.
            */

            if (err instanceof Error) {
                setLocalError(err.message);
            }
        }
    };


    return (
        <div className="w-full">

            {/* Header */}

            <div className="mb-8 text-center">

                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-7 w-7"
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
                </div>


                <p className="mb-2 text-sm font-semibold text-zinc-500">
                    Passwordless sign in
                </p>


                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                    Sign in with a passkey
                </h1>


                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                    Enter your email and continue using a passkey
                    saved on this device or another supported device.
                </p>

            </div>


            {/* Passkey Form */}

            <form
                onSubmit={handlePasskeyLogin}
                className="space-y-5"
            >

                {/* Email */}

                <div>
                    <label
                        htmlFor="passkey-email"
                        className="mb-2 block text-sm font-semibold text-zinc-800"
                    >
                        Email address
                    </label>

                    <input
                        id="passkey-email"
                        type="email"
                        autoComplete="email webauthn"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);

                            if (localError) {
                                setLocalError(null);
                            }
                        }}
                        placeholder="you@example.com"
                        disabled={loading}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                    />
                </div>


                {/* Error */}

                {(localError || error) && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {localError || error}
                    </div>
                )}


                {/* Continue */}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                            Checking passkey...
                        </>
                    ) : (
                        <>
                            <PasskeyIcon />

                            Continue with passkey
                        </>
                    )}
                </button>

            </form>


            {/* Information */}

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">

                <h2 className="text-sm font-bold text-zinc-950">
                    Your device will handle verification
                </h2>

                <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Your browser may ask you to use Windows Hello,
                    fingerprint, face recognition, device PIN, a security
                    key, or another device depending on what is available.
                </p>

            </div>


            {/* Security */}

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                    aria-hidden="true"
                >
                    <path
                        d="M12 3 5 6v5c0 4.6 2.9 8.3 7 10 4.1-1.7 7-5.4 7-10V6l-7-3Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    />

                    <path
                        d="m9 12 2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>


                <div>
                    <p className="text-sm font-semibold text-emerald-900">
                        Your biometric data stays private
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                        Fingerprints and facial data remain on your device.
                        Your server receives the cryptographic authentication
                        response instead.
                    </p>
                </div>

            </div>


            {/* Back */}

            <div className="mt-7 text-center">

                <Link
                    href="/login"
                    className="text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
                >
                    ← Sign in with password
                </Link>

            </div>

        </div>
    );
}


/* =========================================================
   PASSKEY ICON
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