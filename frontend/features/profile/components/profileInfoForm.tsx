"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
    Check,
    ChevronRight,
    Edit3,
    Mail,
    MapPin,
    Phone,
    Save,
    User,
    X,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    updateMe,
    clearAuthError,
} from "@/features/auth/store/authSlice";
import {
    selectAuthError,
    selectAuthLoading,
    selectCurrentUser,
} from "@/features/auth/store/authSelector";

import { ImageUploadField } from "@/features/upload";
import SectionCard from "./sectioncard";

/* ================================================================
   TYPES
================================================================ */

interface AddressForm {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

/* ================================================================
   CONSTANTS
================================================================ */

const emptyAddress: AddressForm = {
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
};

const inputClass = `
    w-full
    rounded-xl
    border
    border-default
    bg-surface
    px-3.5
    py-2.5
    text-sm
    text-primary
    outline-none
    transition-all
    placeholder:text-muted
    focus:border-accent
    focus:ring-2
    focus:ring-accent/15
`;

const labelClass =
    "mb-1.5 block text-xs font-semibold text-secondary";

/* ================================================================
   COMPONENT
================================================================ */

export default function ProfileInfoForm() {
    const dispatch = useAppDispatch();

    const user = useAppSelector(
        selectCurrentUser,
    );

    const loading = useAppSelector(
        selectAuthLoading,
    );

    const error = useAppSelector(
        selectAuthError,
    );

    const [name, setName] = useState(
        user?.name ?? "",
    );

    const [phone, setPhone] = useState(
        user?.phone ?? "",
    );

    const [avatar, setAvatar] = useState(
        user?.avatar ?? "",
    );

    const [address, setAddress] =
        useState<AddressForm>({
            ...emptyAddress,
            ...(user?.address ?? {}),
        });

    const [isEditing, setIsEditing] =
        useState(false);

    /* ============================================================
       SYNC USER
    ============================================================ */

    useEffect(() => {
        setName(user?.name ?? "");
        setPhone(user?.phone ?? "");
        setAvatar(user?.avatar ?? "");

        setAddress({
            ...emptyAddress,
            ...(user?.address ?? {}),
        });
    }, [user]);

    /* ============================================================
       CLEAN ERROR
    ============================================================ */

    useEffect(() => {
        return () => {
            dispatch(clearAuthError());
        };
    }, [dispatch]);

    if (!user) {
        return null;
    }

    /* ============================================================
       ADDRESS UPDATE
    ============================================================ */

    const updateAddress = (
        key: keyof AddressForm,
        value: string,
    ) => {
        setAddress((current) => ({
            ...current,
            [key]: value,
        }));
    };

    /* ============================================================
       SAVE
    ============================================================ */

    const handleSave = async (
        e: React.FormEvent,
    ) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error(
                "Name can't be empty.",
            );
            return;
        }

        const result = await dispatch(
            updateMe({
                name: name.trim(),
                phone:
                    phone.trim() ||
                    undefined,
                avatar:
                    avatar || undefined,
                address,
            }),
        );

        if (
            updateMe.fulfilled.match(
                result,
            )
        ) {
            toast.success(
                "Profile updated successfully.",
            );

            setIsEditing(false);
        } else {
            toast.error(
                (result.payload as string) ||
                "Couldn't update profile. Try again.",
            );
        }
    };

    /* ============================================================
       CANCEL EDIT
    ============================================================ */

    const handleCancel = () => {
        setName(user.name ?? "");
        setPhone(user.phone ?? "");
        setAvatar(user.avatar ?? "");

        setAddress({
            ...emptyAddress,
            ...(user.address ?? {}),
        });

        setIsEditing(false);

        dispatch(clearAuthError());
    };

    /* ============================================================
       ADDRESS
    ============================================================ */

    const hasAddress = Boolean(
        user.address?.street ||
        user.address?.city ||
        user.address?.pincode,
    );

    const addressText = hasAddress
        ? [
            user.address?.street,
            user.address?.city,
            user.address?.state,
            user.address?.pincode,
        ]
            .filter(Boolean)
            .join(", ")
        : "No delivery address added yet";

    /* ============================================================
       RETURN
    ============================================================ */

    return (
        <SectionCard
            title="Account information"
            description="Manage your personal details and delivery information."
            icon={
                <User className="h-5 w-5" />
            }
            action={
                !isEditing ? (
                    <button
                        type="button"
                        onClick={() =>
                            setIsEditing(true)
                        }
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-default
                            bg-surface
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-primary
                            transition-all
                            hover:border-strong
                            hover:bg-surface-hover
                            sm:px-3.5
                            sm:text-sm
                        "
                    >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit profile
                    </button>
                ) : null
            }
        >
            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (
                <div
                    className="
                        mb-5
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        border-danger/20
                        bg-danger-bg
                        px-4
                        py-3
                        text-sm
                        text-danger-text
                    "
                >
                    <X className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                        {error}
                    </span>
                </div>
            )}

            {/* ====================================================
                EDIT MODE
            ==================================================== */}

            {isEditing ? (
                <form
                    onSubmit={handleSave}
                    className="space-y-6"
                >
                    {/* Profile editor */}
                    <div
                        className="
                            rounded-3xl
                            border
                            border-default
                            bg-surface-muted/40
                            p-4
                            sm:p-5
                        "
                    >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            {/* Avatar */}
                            <div className="flex justify-center sm:block">
                                <ImageUploadField
                                    label="Profile photo"
                                    value={avatar}
                                    onChange={(
                                        url,
                                    ) =>
                                        setAvatar(
                                            url,
                                        )
                                    }
                                    folder="avatar"
                                    shape="circle"
                                />
                            </div>

                            {/* Fields */}
                            <div className="grid flex-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Full name
                                    </label>

                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                                        <input
                                            type="text"
                                            value={
                                                name
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                setName(
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                            required
                                            className={`${inputClass} pl-10`}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Phone number
                                    </label>

                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                                        <input
                                            type="tel"
                                            value={
                                                phone
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                setPhone(
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Enter phone number"
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Email address
                                    </label>

                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                                        <input
                                            type="email"
                                            value={
                                                user.email
                                            }
                                            disabled
                                            className="
                                                w-full
                                                cursor-not-allowed
                                                rounded-xl
                                                border
                                                border-default
                                                bg-surface-muted
                                                px-3.5
                                                py-2.5
                                                pl-10
                                                text-sm
                                                text-secondary
                                                outline-none
                                            "
                                        />
                                    </div>

                                    <p className="mt-1.5 text-[11px] text-muted">
                                        Email address
                                        cannot be
                                        changed here.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==================================================
                        ADDRESS EDITOR
                    ================================================== */}

                    <div className="overflow-hidden rounded-3xl border border-default">
                        <div className="flex items-center gap-3 border-b border-default px-4 py-4 sm:px-5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                                <MapPin className="h-4 w-4 text-accent" />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-primary">
                                    Delivery address
                                </h3>

                                <p className="mt-0.5 text-[11px] text-muted">
                                    Used for your marketplace
                                    deliveries
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                            <div className="sm:col-span-2">
                                <label
                                    className={
                                        labelClass
                                    }
                                >
                                    Street address
                                </label>

                                <input
                                    type="text"
                                    value={
                                        address.street
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        updateAddress(
                                            "street",
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="House no, street, area"
                                    className={
                                        inputClass
                                    }
                                />
                            </div>

                            <div>
                                <label
                                    className={
                                        labelClass
                                    }
                                >
                                    City
                                </label>

                                <input
                                    type="text"
                                    value={
                                        address.city
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        updateAddress(
                                            "city",
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                />
                            </div>

                            <div>
                                <label
                                    className={
                                        labelClass
                                    }
                                >
                                    State
                                </label>

                                <input
                                    type="text"
                                    value={
                                        address.state
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        updateAddress(
                                            "state",
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                />
                            </div>

                            <div>
                                <label
                                    className={
                                        labelClass
                                    }
                                >
                                    Pincode
                                </label>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                        address.pincode
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        updateAddress(
                                            "pincode",
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="6-digit pincode"
                                    className={
                                        inputClass
                                    }
                                />
                            </div>

                            <div>
                                <label
                                    className={
                                        labelClass
                                    }
                                >
                                    Country
                                </label>

                                <input
                                    type="text"
                                    value={
                                        address.country
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        updateAddress(
                                            "country",
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div
                        className="
                            flex
                            flex-col-reverse
                            gap-2
                            border-t
                            border-default
                            pt-5
                            sm:flex-row
                            sm:justify-end
                        "
                    >
                        <button
                            type="button"
                            onClick={
                                handleCancel
                            }
                            disabled={loading}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-default
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-primary
                                transition-all
                                hover:bg-surface-hover
                                disabled:opacity-50
                            "
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-accent
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-accent-foreground
                                shadow-sm
                                transition-all
                                hover:-translate-y-0.5
                                hover:opacity-90
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            <Save className="h-4 w-4" />

                            {loading
                                ? "Saving..."
                                : "Save changes"}
                        </button>
                    </div>
                </form>
            ) : (
                /* ====================================================
                   VIEW MODE
                ==================================================== */
                <div className="space-y-5">

                    {/* ==================================================
                        PROFILE HERO
                    ================================================== */}

                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-3xl
                            border
                            border-default
                            bg-surface-muted/40
                            p-4
                            sm:p-5
                        "
                    >
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                            {/* Avatar */}
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-default bg-surface">
                                {user.avatar ? (
                                    <Image
                                        src={
                                            user.avatar
                                        }
                                        alt={
                                            user.name ||
                                            "Profile"
                                        }
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-2xl font-bold text-muted">
                                        {(
                                            user.name ||
                                            user.email ||
                                            "?"
                                        )
                                            .charAt(
                                                0,
                                            )
                                            .toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Identity */}
                            <div className="min-w-0 flex-1">
                                <p className="text-lg font-bold text-primary">
                                    {user.name ||
                                        "Your profile"}
                                </p>

                                <div className="mt-1 flex flex-col gap-1 text-xs text-secondary sm:flex-row sm:items-center sm:gap-3">
                                    <span className="flex min-w-0 items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted" />

                                        <span className="truncate">
                                            {
                                                user.email
                                            }
                                        </span>
                                    </span>

                                    {user.phone && (
                                        <>
                                            <span className="hidden text-muted sm:block">
                                                •
                                            </span>

                                            <span className="flex items-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5 text-muted" />

                                                {
                                                    user.phone
                                                }
                                            </span>
                                        </>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsEditing(
                                            true,
                                        )
                                    }
                                    className="
                                        mt-3
                                        inline-flex
                                        items-center
                                        gap-1
                                        text-xs
                                        font-semibold
                                        text-accent
                                        hover:underline
                                    "
                                >
                                    Edit profile
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ==================================================
                        CONTACT DETAILS
                    ================================================== */}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <InfoCard
                            icon={
                                <Mail className="h-4 w-4" />
                            }
                            label="Email address"
                            value={
                                user.email
                            }
                        />

                        <InfoCard
                            icon={
                                <Phone className="h-4 w-4" />
                            }
                            label="Phone number"
                            value={
                                user.phone ||
                                "Not added"
                            }
                        />
                    </div>

                    {/* ==================================================
                        ADDRESS
                    ================================================== */}

                    <div className="overflow-hidden rounded-3xl border border-default bg-surface">
                        <div className="flex items-center justify-between border-b border-default px-4 py-4 sm:px-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                                    <MapPin className="h-4 w-4 text-accent" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-primary">
                                        Delivery address
                                    </h3>

                                    <p className="mt-0.5 text-[11px] text-muted">
                                        Your default delivery
                                        location
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsEditing(
                                        true,
                                    )
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-lg
                                    px-2
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    text-secondary
                                    transition-colors
                                    hover:bg-surface-hover
                                    hover:text-primary
                                "
                            >
                                Edit
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-5">
                            <div className="rounded-2xl bg-surface-muted/50 p-4">
                                {hasAddress ? (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                                            <MapPin className="h-3.5 w-3.5 text-secondary" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold leading-6 text-primary">
                                                {
                                                    addressText
                                                }
                                            </p>

                                            {user
                                                .address
                                                ?.country && (
                                                    <p className="mt-1 text-xs text-muted">
                                                        {
                                                            user
                                                                .address
                                                                .country
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditing(
                                                true,
                                            )
                                        }
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            gap-3
                                            text-left
                                        "
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-primary">
                                                Add a delivery
                                                address
                                            </p>

                                            <p className="mt-1 text-xs text-muted">
                                                Save your
                                                address for
                                                faster
                                                checkout.
                                            </p>
                                        </div>

                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ==================================================
                        PROFILE COMPLETE
                    ================================================== */}

                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                Account information
                                looks good
                            </p>

                            <p className="mt-0.5 text-[11px] text-secondary">
                                Keep your contact and
                                delivery details up to date.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </SectionCard>
    );
}

/* ================================================================
   INFO CARD
================================================================ */

function InfoCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-default bg-surface p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-secondary">
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                        {label}
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-primary">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}