import { Suspense } from "react";
import { SearchResultsPage } from "@/features/search";

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-secondary">Loading...</div>}>
            <SearchResultsPage />
        </Suspense>
    );
}