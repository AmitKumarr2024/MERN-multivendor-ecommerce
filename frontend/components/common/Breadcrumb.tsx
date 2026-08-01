import Link from "next/link";
import {
    ChevronRight,
    Home,
} from "lucide-react";


/**
 * =========================================================
 * BREADCRUMB ITEM TYPE
 * =========================================================
 *
 * Represents one item inside the breadcrumb.
 *
 * Example:
 *
 * {
 *     label: "Seller",
 *     href: "/seller/dashboard"
 * }
 *
 * If `href` is provided:
 *      item becomes clickable.
 *
 * If `href` is missing:
 *      item is rendered as plain text.
 *      Usually this is the current page.
 * =========================================================
 */

export interface BreadcrumbItem {
    label: string;
    href?: string;
}


/**
 * =========================================================
 * BREADCRUMB PROPS
 * =========================================================
 *
 * items:
 *      Breadcrumb items displayed after Home.
 *
 * showHome:
 *      Controls whether the Home item is displayed.
 *      Default = true.
 *
 * homeHref:
 *      URL used by the Home item.
 *      Default = "/".
 *
 * className:
 *      Allows pages to add additional Tailwind classes.
 *
 * Example:
 *
 * <Breadcrumb
 *     homeHref="/seller/dashboard"
 *     items={[
 *         {
 *             label: "Seller",
 *             href: "/seller/dashboard",
 *         },
 *         {
 *             label: "Shop",
 *         },
 *     ]}
 *     className="mb-6"
 * />
 * =========================================================
 */

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    showHome?: boolean;
    homeHref?: string;
    className?: string;
}


/**
 * =========================================================
 * BREADCRUMB COMPONENT
 * =========================================================
 *
 * Reusable breadcrumb navigation.
 *
 * Example output:
 *
 * Home > Seller > Shop
 *
 *
 * IMPORTANT HTML STRUCTURE
 * ---------------------------------------------------------
 *
 * <ol> should contain sibling <li> elements:
 *
 * CORRECT:
 *
 * <ol>
 *     <li>Home</li>
 *     <li>></li>
 *     <li>Seller</li>
 *     <li>></li>
 *     <li>Shop</li>
 * </ol>
 *
 *
 * INCORRECT:
 *
 * <ol>
 *     <li>
 *         Seller
 *         <li>></li>
 *     </li>
 * </ol>
 *
 * The incorrect version creates:
 *
 * <li> inside <li>
 *
 * React/Next.js reports:
 *
 * "In HTML, <li> cannot be a descendant of <li>"
 *
 * and it can cause hydration errors.
 *
 * Therefore every separator is rendered as a SIBLING
 * of the breadcrumb item, never as its child.
 * =========================================================
 */

export default function Breadcrumb({
    items,
    showHome = true,
    homeHref = "/",
    className = "",
}: BreadcrumbProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={`w-full ${className}`}
        >
            {/*
             * <ol> is semantically appropriate because breadcrumbs
             * represent an ordered navigation hierarchy.
             */}
            <ol className="flex flex-wrap items-center gap-1 text-sm">

                {/* =================================================
                    HOME ITEM
                ================================================= */}

                {showHome && (
                    <>
                        {/*
                         * Home is always its own <li>.
                         */}
                        <li>
                            <Link
                                href={homeHref}
                                aria-label="Home"
                                className="
                                    flex items-center gap-1.5
                                    rounded-md px-1 py-1
                                    font-medium text-zinc-500
                                    transition-colors
                                    hover:text-zinc-950
                                    dark:text-zinc-400
                                    dark:hover:text-white
                                "
                            >
                                <Home
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />

                                {/*
                                 * Hide "Home" text on very small screens
                                 * to save horizontal space.
                                 *
                                 * The icon remains visible.
                                 */}
                                <span className="hidden sm:inline">
                                    Home
                                </span>
                            </Link>
                        </li>


                        {/*
                         * Show a separator after Home only when
                         * additional breadcrumb items exist.
                         *
                         * Example:
                         *
                         * Home > Seller
                         *
                         * But if items = [], we only show:
                         *
                         * Home
                         */}
                        {items.length > 0 && (
                            <BreadcrumbSeparator />
                        )}
                    </>
                )}


                {/* =================================================
                    DYNAMIC BREADCRUMB ITEMS
                ================================================= */}

                {items.map((item, index) => {
                    /*
                     * Determine whether this is the final item.
                     *
                     * Example:
                     *
                     * Seller > Shop
                     *          ^^^^
                     *          isLast = true
                     */
                    const isLast =
                        index === items.length - 1;

                    return (
                        /*
                         * Fragment allows us to return:
                         *
                         * <li>Seller</li>
                         * <li>></li>
                         *
                         * as siblings.
                         *
                         * This prevents the previous invalid structure:
                         *
                         * <li>
                         *     Seller
                         *     <li>></li>
                         * </li>
                         */
                        <BreadcrumbEntry
                            key={`${item.label}-${index}`}
                            item={item}
                            isLast={isLast}
                        />
                    );
                })}

            </ol>
        </nav>
    );
}


/**
 * =========================================================
 * BREADCRUMB ENTRY
 * =========================================================
 *
 * Handles one breadcrumb item.
 *
 * It also renders the separator AFTER the item when the
 * item is not the final breadcrumb.
 *
 * Example:
 *
 * Seller >
 *
 * Final item:
 *
 * Shop
 *
 * No separator is rendered after the final item.
 * =========================================================
 */

interface BreadcrumbEntryProps {
    item: BreadcrumbItem;
    isLast: boolean;
}


function BreadcrumbEntry({
    item,
    isLast,
}: BreadcrumbEntryProps) {
    return (
        <>
            {/* =================================================
                ACTUAL BREADCRUMB ITEM
            ================================================= */}

            <li className="flex min-w-0 items-center">

                {/*
                 * A breadcrumb is clickable when:
                 *
                 * 1. href exists
                 * 2. it is NOT the current/final page
                 */}
                {item.href && !isLast ? (
                    <Link
                        href={item.href}
                        className="
                            max-w-40 truncate
                            rounded-md px-1 py-1
                            font-medium text-zinc-500
                            transition-colors
                            hover:text-zinc-950
                            sm:max-w-60
                            dark:text-zinc-400
                            dark:hover:text-white
                        "
                    >
                        {item.label}
                    </Link>
                ) : (
                    /*
                     * Current page is plain text instead of a link.
                     *
                     * aria-current="page" tells screen readers
                     * that this breadcrumb represents the current page.
                     */
                    <span
                        aria-current={
                            isLast
                                ? "page"
                                : undefined
                        }
                        className={`
                            max-w-40 truncate
                            px-1 py-1
                            sm:max-w-60

                            ${isLast
                                ? `
                                        font-semibold
                                        text-zinc-950
                                        dark:text-white
                                    `
                                : `
                                        font-medium
                                        text-zinc-500
                                        dark:text-zinc-400
                                    `
                            }
                        `}
                    >
                        {item.label}
                    </span>
                )}

            </li>


            {/* =================================================
                SEPARATOR

                IMPORTANT:
                This is OUTSIDE the breadcrumb item's <li>.

                Therefore generated HTML becomes:

                <li>Seller</li>
                <li>></li>

                NOT:

                <li>
                    Seller
                    <li>></li>
                </li>
            ================================================= */}

            {!isLast && (
                <BreadcrumbSeparator />
            )}
        </>
    );
}


/**
 * =========================================================
 * BREADCRUMB SEPARATOR
 * =========================================================
 *
 * Displays:
 *
 * >
 *
 * using Lucide's ChevronRight icon.
 *
 * aria-hidden="true":
 *
 * Screen readers don't need to announce the separator
 * because it is only a visual indicator.
 *
 * IMPORTANT:
 *
 * This component returns <li>.
 *
 * Therefore it must ONLY be rendered directly inside the
 * <ol> hierarchy as a sibling of another <li>.
 *
 * Never render this component inside another <li>.
 * =========================================================
 */

function BreadcrumbSeparator() {
    return (
        <li
            aria-hidden="true"
            className="
                flex shrink-0
                items-center justify-center
                text-zinc-300
                dark:text-zinc-700
            "
        >
            <ChevronRight className="h-4 w-4" />
        </li>
    );
}