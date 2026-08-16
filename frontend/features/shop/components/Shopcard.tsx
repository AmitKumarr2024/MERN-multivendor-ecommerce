import Link from "next/link";
import Image from "next/image";

interface ShopCardProps {
    shop: {
        _id: string;
        shopName: string;
        slug: string;
        logo?: string;
        banner?: string;
        description?: string;
        isActive?: boolean;
    };
}

export default function ShopCard({ shop }: ShopCardProps) {
    return (
        <Link
            href={`/shop/${shop.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-default bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
            {/* Banner / cover area — logo floats on top */}
            <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-surface-muted to-surface-hover sm:h-32">
                {shop.banner ? (
                    <Image
                        src={shop.banner}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 320px"
                        className="object-cover"
                    />
                ) : null}

                {/* subtle scrim so the logo/badge stay readable over any banner photo */}
                {shop.banner ? (
                    <div className="absolute inset-0 bg-black/10" />
                ) : null}

                <div className="relative z-10 h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-4 border-surface bg-surface shadow-md sm:h-20 sm:w-20">
                    {shop.logo ? (
                        <Image
                            src={shop.logo}
                            alt={shop.shopName}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-accent text-xl font-bold text-accent-foreground sm:text-2xl">
                            {shop.shopName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {shop.isActive !== undefined && (
                    <span
                        className={`absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${shop.isActive
                            ? "bg-success-bg text-success-text"
                            : "bg-surface-hover text-secondary"
                            }`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${shop.isActive ? "bg-success-text" : "bg-muted"
                                }`}
                        />
                        {shop.isActive ? "Open" : "Closed"}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-1 p-4 text-center">
                <h3 className="truncate text-sm font-semibold text-primary sm:text-base">
                    {shop.shopName}
                </h3>

                {shop.description ? (
                    <p className="line-clamp-2 text-xs text-secondary sm:text-sm">
                        {shop.description}
                    </p>
                ) : (
                    <p className="text-xs text-muted italic">No description yet</p>
                )}

                <span className="mt-2 inline-flex items-center justify-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Visit shop
                    <ArrowIcon />
                </span>
            </div>
        </Link>
    );
}

function ArrowIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path
                fillRule="evenodd"
                d="M7.21 4.21a.75.75 0 0 1 1.06 0l5.26 5.26a.75.75 0 0 1 0 1.06l-5.26 5.26a.75.75 0 1 1-1.06-1.06L11.94 10 7.21 5.27a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
            />
        </svg>
    );
}