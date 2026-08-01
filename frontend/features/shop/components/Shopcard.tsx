import Link from "next/link";
import Image from "next/image";

interface ShopCardProps {
    shop: {
        _id: string;
        shopName: string;
        slug: string;
        logo?: string;
        description?: string;
    };
}

export default function ShopCard({ shop }: ShopCardProps) {
    return (
        <Link
            href={`/shop/${shop.slug}`}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                {shop.logo ? (
                    <Image src={shop.logo} alt={shop.shopName} fill className="object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-lg font-semibold text-gray-300">
                        {shop.shopName.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                    {shop.shopName}
                </h3>
                {shop.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 sm:text-sm">
                        {shop.description}
                    </p>
                ) : null}
            </div>

            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-gray-300">
                <path
                    fillRule="evenodd"
                    d="M7.21 4.21a.75.75 0 0 1 1.06 0l5.26 5.26a.75.75 0 0 1 0 1.06l-5.26 5.26a.75.75 0 1 1-1.06-1.06L11.94 10 7.21 5.27a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                />
            </svg>
        </Link>
    );
}