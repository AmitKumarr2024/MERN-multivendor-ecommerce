import { CategoryList } from "@/features/category";
import { ArrowRight, Layers3 } from "lucide-react";

export const metadata = {
    title: "Categories",
    description: "Browse all product categories.",
};

export default function CategoriesPage() {
    return (
        <main className="min-h-screen bg-surface">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-default">
                {/* Decorative background */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                >
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
                    {/* Eyebrow */}
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-secondary">
                        <Layers3 className="h-4 w-4" />
                        <span>Explore marketplace</span>
                    </div>

                    {/* Heading */}
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
                            Shop by category
                        </h1>

                        <p className="mt-4 max-w-xl text-base leading-7 text-secondary sm:text-lg">
                            Discover products from local shops and find
                            exactly what you&apos;re looking for.
                        </p>
                    </div>

                    {/* Bottom hint */}
                    <div className="mt-7 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Browse all categories</span>
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                <CategoryList showParent={false} />
            </section>
        </main>
    );
}