import { CategoryList } from "@/features/category";

export const metadata = {
    title: "Categories",
    description:
        "Browse all product categories.",
};

export default function CategoriesPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Categories
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Explore products by category.
                </p>
            </div>

            <CategoryList
                showParent={false}
            />
        </main>
    );
}