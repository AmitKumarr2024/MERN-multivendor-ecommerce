"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentUser, selectIsAuthenticated } from "@/features/auth/store/authSelector";
import { fetchFollowStatus, fetchShopPublicStats, followShop, unfollowShop } from "../store/followSlice";
import { selectFollowMutatingId, selectFollowState, selectShopPublicStatsById } from "../store/followSelectors";

/**
 * Shop-page follow control. Guests see the aggregate follower count
 * (public) and are sent to login on click. Owners never see the button.
 */
export default function FollowButton({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectCurrentUser);
    const status = useAppSelector(selectFollowState(shopId));
    const stats = useAppSelector(selectShopPublicStatsById(shopId));
    const busy = useAppSelector(selectFollowMutatingId) === shopId;

    useEffect(() => {
        dispatch(fetchShopPublicStats(shopId));
        if (isAuthenticated) dispatch(fetchFollowStatus(shopId));
    }, [dispatch, shopId, isAuthenticated]);

    if (user?.shop === shopId) return null; // own shop

    const following = status?.following ?? false;
    const count = status?.followerCount ?? stats?.followerCount ?? 0;

    const toggle = () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        dispatch(following ? unfollowShop(shopId) : followShop(shopId));
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={toggle}
                disabled={busy}
                aria-pressed={following}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${following
                        ? "border-accent bg-accent text-accent-foreground hover:opacity-90"
                        : "border-default bg-surface text-primary hover:bg-surface-hover"
                    }`}
            >
                {following ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                {following ? "Following" : "Follow"}
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs text-secondary">
                <Users className="h-3.5 w-3.5" />
                {count} follower{count === 1 ? "" : "s"}
                {stats && stats.customerCount > 0 && <> · {stats.customerCount} customer{stats.customerCount === 1 ? "" : "s"}</>}
            </span>
        </div>
    );
}