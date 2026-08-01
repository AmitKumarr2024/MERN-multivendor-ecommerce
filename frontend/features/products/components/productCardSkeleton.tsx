export default function ProductCardSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="aspect-square w-full bg-gray-100" />
            <div className="space-y-2 p-3 sm:p-4">
                <div className="h-2.5 w-1/3 rounded bg-gray-100" />
                <div className="h-3.5 w-4/5 rounded bg-gray-100" />
                <div className="h-3.5 w-1/2 rounded bg-gray-100" />
            </div>
        </div>
    );
}