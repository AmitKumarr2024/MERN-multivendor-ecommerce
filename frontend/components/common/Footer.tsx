import Image from "next/image";
import Link from "next/link";

interface FooterLink {
    label: string;
    href: string;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
    {
        title: "Shop",
        links: [
            { label: "All Products", href: "/products" },
            { label: "Categories", href: "/category" },
            { label: "Today's Deals", href: "/deals" },
            { label: "New Arrivals", href: "/products?sort=newest" },
        ],
    },
    {
        title: "Your Account",
        links: [
            { label: "My Account", href: "/profile" },
            { label: "My Orders", href: "/orders" },
            { label: "Wishlist", href: "/wishlist" },
            { label: "Cart", href: "/cart" },
        ],
    },
    {
        title: "Support",
        links: [
            { label: "Help Center", href: "/help" },
            { label: "Shipping", href: "/shipping" },
            { label: "Returns", href: "/returns" },
            { label: "Contact Us", href: "/contact" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "/about" },
            { label: "Sell With Us", href: "/seller/register" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms & Conditions", href: "/terms" },
        ],
    },
];

const TRUST_BADGES = ["Secure Payments", "Fast Delivery", "Easy Returns", "24/7 Support"];

const LEGAL_LINKS: FooterLink[] = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-default bg-surface text-secondary">
            <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-[1.3fr_repeat(4,1fr)] sm:gap-6">
                    {/* Brand — trust badges folded in here instead of a separate block */}
                    <div>
                        <Link
                            href="/"
                            className="flex shrink-0 items-center gap-2 font-bold text-primary"
                        >
                            <Image
                                src="/android-chrome-512x512.png"
                                alt="Amitora Market"
                                width={52}
                                height={52}
                                className="rounded-lg object-contain"
                            />

                            <span className="hidden sm:inline">
                                Amitora Market
                            </span>
                        </Link>

                        <p className="mt-3 max-w-xs text-sm leading-6 text-secondary">
                            Quality products from trusted sellers, all in one place.
                        </p>

                        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                            {TRUST_BADGES.map((badge) => (
                                <li
                                    key={badge}
                                    className="flex items-center gap-1.5 text-xs font-medium text-secondary"
                                >
                                    <CheckIcon />
                                    {badge}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Link columns — accordion on mobile, plain columns from sm: up */}
                    {FOOTER_SECTIONS.map((section) => (
                        <FooterColumn key={section.title} section={section} />
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-default">
                <div className="flex w-full flex-col gap-3 px-4 py-5 text-xs text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <p>© {currentYear} Marketplace. All rights reserved.</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        {LEGAL_LINKS.map((link) => (
                            <Link key={link.href} href={link.href} className="transition hover:text-primary">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ section }: { section: FooterSection }) {
    return (
        <details className="group border-b border-default py-3 open:pb-3 sm:border-0 sm:py-0" open>
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-primary sm:cursor-default sm:pointer-events-none">
                {section.title}
                <ChevronIcon className="h-4 w-4 text-muted transition-transform group-open:rotate-180 sm:hidden" />
            </summary>

            <ul className="mt-3 space-y-2.5 sm:mt-4">
                {section.links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-sm text-secondary transition hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </details>
    );
}

function ChevronIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0 text-success-text" aria-hidden="true">
            <path d="M4 10.5L8 14.5L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}