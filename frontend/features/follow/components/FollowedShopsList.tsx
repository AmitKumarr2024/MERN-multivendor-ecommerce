"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HeartOff, MapPin, Store } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyFollowedShops, unfollowShop } from "../store/followSlice";
import { selectFollowError, selectFollowLoading, selectFollowMutatingId, selectFollowedShops } from "../store/followSelectors";

export default function FollowedShopsList() {
    const dispatch = useAppDispatch();
    const data = useAppSelector(selectFollowedShops);
    const loading = useAppSelector(selectFollowLoading);
    const error = useAppSelector(selectFollowError);
    const mutatingId = useAppSelector(selectFollowMutatingId);

    useEffect(() => {
        dispatch(fetchMyFollowedShops());
    }, [dispatch]);

    return (
        <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-primary sm:text-2xl">Followed shops</h1>
                <p className="text-sm text-secondary">Shops you follow. Only you can see this list.</p>
            </div>

            {error && <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text">{error}</div>}

            {loading && !data ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-muted" />
                    ))}
                </div>
            ) : !data || data.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-default bg-surface py-16 text-center">
                    <Store className="mx-auto h-8 w-8 text-muted" />
                    <p className="mt-3 text-sm font-semibold text-primary">You&apos;re not following any shops yet</p>
                    <Link href="/shop" className="mt-4 inline-block rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                        Browse shops
                    </Link>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {data.items.map(({ shop, followedAt }) => (
                        <div key={shop._id} className="flex items-center gap-3 rounded-2xl border border-default bg-surface p-4">
                            <Link href={`/shop/${shop.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent text-lg font-bold text-accent-foreground">
                                    {shop.logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={shop.logo} alt={shop.shopName} className="h-full w-full object-cover" />
                                    ) : (
                                        shop.shopName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-primary">{shop.shopName}</p>
                                    <p className="flex items-center gap-1 truncate text-xs text-muted">
                                        <span className={`h-1.5 w-1.5 rounded-full ${shop.isOpen ? "bg-success-text" : "bg-muted"}`} />
                                        {shop.isOpen ? "Open now" : "Closed"}
                                        {shop.address?.city && (
                                            <>
                                                <MapPin className="ml-1 h-3 w-3" />
                                                {shop.address.city}
                                            </>
                                        )}
                                    </p>
                                    <p className="text-[11px] text-muted">Following since {new Date(followedAt).toLocaleDateString("en-IN")}</p>
                                </div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => dispatch(unfollowShop(shop._id))}
                                disabled={mutatingId === shop._id}
                                aria-label={`Unfollow ${shop.shopName}`}
                                title="Unfollow"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-secondary transition hover:bg-danger-bg hover:text-danger-text disabled:opacity-50"
                            >
                                <HeartOff className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}