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
                verifyPasskeyRegistration({ response: attestationResponse }),
            );

            if (verifyPasskeyRegistration.fulfilled.match(verifyResult)) {
                dispatch(getPasskeys());
            }
        } catch (err) {
            // Most common case: user cancelled the browser's
            // passkey prompt — not a real error, so keep it quiet.
            const message =
                err instanceof Error ? err.message : "Passkey setup was cancelled.";
            setLocalError(message);
        } finally {
            setRegistering(false);
        }
    };

    const handleDelete = (credentialId: string) => {
        dispatch(deletePasskey(credentialId));
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Passkeys</h2>
                    <p className="text-sm text-gray-500">
                        Sign in with fingerprint, Face ID, or a security key.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAddPasskey}
                    disabled={registering || loading}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                    {registering ? "Waiting..." : "+ Add passkey"}
                </button>
            </div>

            {(error || localError) && (
                <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                    {localError || error}
                </p>
            )}

            {successMessage && (
                <p className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-600">
                    {successMessage}
                </p>
            )}

            {passkeys.length === 0 ? (
                <p className="text-sm text-gray-400">No passkeys registered yet.</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {passkeys.map((passkey) => (
                        <li
                            key={passkey.credentialId}
                            className="flex items-center justify-between py-3"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {passkey.nickname || passkey.deviceType || "Passkey"}
                                </p>
                                {passkey.createdAt && (
                                    <p className="text-xs text-gray-400">
                                        Added{" "}
                                        {new Date(passkey.createdAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDelete(passkey.credentialId)}
                                disabled={loading}
                                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
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