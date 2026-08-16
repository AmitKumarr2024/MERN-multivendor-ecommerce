"use client";

import { useEffect, useState } from "react";
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

    const passkeys = useAppSelector(selectRegisteredPasskeys);
    const loading = useAppSelector(selectPasskeyLoading);
    const error = useAppSelector(selectPasskeyError);
    const successMessage = useAppSelector(selectPasskeySuccessMessage);

    const [registering, setRegistering] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getPasskeys());
    }, [dispatch]);

    const handleAddPasskey = async () => {
        setLocalError(null);
        setRegistering(true);

        try {
            const optionsResult = await dispatch(
                getPasskeyRegistrationOptions(),
            );

            if (!getPasskeyRegistrationOptions.fulfilled.match(optionsResult)) {
                return;
            }

            const attestationResponse = await startRegistration({
                optionsJSON: optionsResult.payload,
            });

            const verifyResult = await dispatch(
                verifyPasskeyRegistration({
                    response: attestationResponse,
                }),
            );

            if (verifyPasskeyRegistration.fulfilled.match(verifyResult)) {
                dispatch(getPasskeys());
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

    const handleDelete = (credentialId: string) => {
        dispatch(deletePasskey(credentialId));
    };

    return (
        <div className="rounded-xl border border-default bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-primary">
                        Passkeys
                    </h2>

                    <p className="text-sm text-secondary">
                        Sign in with fingerprint, Face ID, or a security key.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAddPasskey}
                    disabled={registering || loading}
                    className="rounded-md border border-default px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-surface-hover disabled:opacity-50"
                >
                    {registering ? "Waiting..." : "+ Add passkey"}
                </button>
            </div>

            {(error || localError) && (
                <p className="mb-3 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger-text">
                    {localError || error}
                </p>
            )}

            {successMessage && (
                <p className="mb-3 rounded-md bg-success-bg px-3 py-2 text-sm text-success-text">
                    {successMessage}
                </p>
            )}

            {passkeys.length === 0 ? (
                <p className="text-sm text-muted">
                    No passkeys registered yet.
                </p>
            ) : (
                <ul className="divide-y divide-default">
                    {passkeys.map((passkey) => (
                        <li
                            key={passkey.credentialId}
                            className="flex items-center justify-between py-3"
                        >
                            <div>
                                <p className="text-sm font-medium text-primary">
                                    {passkey.nickname ||
                                        passkey.deviceType ||
                                        "Passkey"}
                                </p>

                                {passkey.createdAt && (
                                    <p className="text-xs text-muted">
                                        Added{" "}
                                        {new Date(
                                            passkey.createdAt,
                                        ).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    handleDelete(passkey.credentialId)
                                }
                                disabled={loading}
                                className="text-sm font-medium text-danger-text transition-opacity hover:opacity-80 disabled:opacity-50"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}