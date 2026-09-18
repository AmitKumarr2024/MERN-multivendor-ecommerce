"use client";

import { useEffect, useState } from "react";
import {
    Fingerprint,
    KeyRound,
    Loader2,
    Plus,
    ShieldCheck,
    Smartphone,
    Trash2,
} from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    deletePasskey,
    getPasskeyRegistrationOptions,
    getPasskeys,
    verifyPasskeyRegistration,
} from "@/features/auth/store/passkeySlice";

import {
    selectPasskeyError,
    selectPasskeyLoading,
    selectPasskeySuccessMessage,
    selectRegisteredPasskeys,
} from "@/features/auth/store/passkeySelector";

export default function PasskeyManager() {
    const dispatch = useAppDispatch();

    const passkeys = useAppSelector(
        selectRegisteredPasskeys,
    );

    const loading = useAppSelector(
        selectPasskeyLoading,
    );

    const error = useAppSelector(
        selectPasskeyError,
    );

    const successMessage =
        useAppSelector(
            selectPasskeySuccessMessage,
        );

    const [registering, setRegistering] =
        useState(false);

    const [localError, setLocalError] =
        useState<string | null>(null);

    useEffect(() => {
        dispatch(getPasskeys());
    }, [dispatch]);

    const handleAddPasskey =
        async () => {
            setLocalError(null);
            setRegistering(true);

            try {
                const optionsResult =
                    await dispatch(
                        getPasskeyRegistrationOptions(),
                    );

                if (
                    !getPasskeyRegistrationOptions.fulfilled.match(
                        optionsResult,
                    )
                ) {
                    return;
                }

                const attestationResponse =
                    await startRegistration({
                        optionsJSON:
                            optionsResult.payload,
                    });

                const verifyResult =
                    await dispatch(
                        verifyPasskeyRegistration(
                            {
                                response:
                                    attestationResponse,
                            },
                        ),
                    );

                if (
                    verifyPasskeyRegistration.fulfilled.match(
                        verifyResult,
                    )
                ) {
                    dispatch(
                        getPasskeys(),
                    );
                }
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Passkey setup was cancelled.";

                setLocalError(message);
            } finally {
                setRegistering(false);
            }
        };

    const handleDelete = (
        credentialId: string,
    ) => {
        dispatch(
            deletePasskey(
                credentialId,
            ),
        );
    };

    return (
        <div className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-surface-muted
                            text-secondary
                        "
                    >
                        <Fingerprint className="h-4 w-4" />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-primary">
                            Passkeys
                        </h3>

                        <p className="mt-0.5 text-xs text-muted">
                            Fast and secure passwordless sign-in
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={
                        handleAddPasskey
                    }
                    disabled={
                        registering ||
                        loading
                    }
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-default
                        bg-surface
                        px-3.5
                        py-2
                        text-xs
                        font-semibold
                        text-primary
                        transition-all
                        hover:border-strong
                        hover:bg-surface-hover
                        disabled:opacity-50
                        sm:text-sm
                    "
                >
                    {registering ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}

                    {registering
                        ? "Waiting..."
                        : "Add passkey"}
                </button>
            </div>

            {/* Messages */}
            {(error || localError) && (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {localError || error}
                </div>
            )}

            {successMessage && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />

                    {successMessage}
                </div>
            )}

            {/* Empty */}
            {passkeys.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-default bg-surface-muted/40 p-6 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-muted">
                        <KeyRound className="h-5 w-5" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-primary">
                        No passkeys yet
                    </p>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
                        Add a passkey to sign in using
                        your fingerprint, Face ID, or
                        device security key.
                    </p>
                </div>
            ) : (
                <div className="mt-5 grid gap-3">
                    {passkeys.map(
                        (passkey) => (
                            <div
                                key={
                                    passkey.credentialId
                                }
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-default
                                    bg-surface-muted/40
                                    p-3.5
                                    transition-colors
                                    hover:bg-surface-hover
                                "
                            >
                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-surface
                                        text-secondary
                                    "
                                >
                                    <Smartphone className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-primary">
                                        {passkey.nickname ||
                                            passkey.deviceType ||
                                            "Passkey"}
                                    </p>

                                    {passkey.createdAt && (
                                        <p className="mt-0.5 text-[11px] text-muted">
                                            Added{" "}
                                            {new Date(
                                                passkey.createdAt,
                                            ).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                },
                                            )}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(
                                            passkey.credentialId,
                                        )
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="
                                        flex
                                        h-8
                                        w-8
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        text-muted
                                        transition-colors
                                        hover:bg-red-500/10
                                        hover:text-red-500
                                        disabled:opacity-50
                                    "
                                    aria-label="Remove passkey"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}