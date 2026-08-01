interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({
    params,
}: CategoryPageProps) {
    const { slug } = await params;

    return {
        title: slug,
    };
}

export default async function CategoryPage({
    params,
}: CategoryPageProps) {
    const { slug } = await params;

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="mb-4 text-3xl font-bold capitalize">
                {slug.replace(/-/g, " ")}
            </h1>

            <p className="text-muted-foreground">
                Products for this category
                will appear here.
            </p>
        </main>
    );
}