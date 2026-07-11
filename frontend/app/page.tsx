"use strict";

// 1. TypeScript Interface based on your dummyjson.com console.log payload
interface DummyProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  thumbnail: string; // The primary preview image from the API
  rating: number;
}

// 2. Data Fetching Function mapped directly to your endpoint
async function getAllProducts(): Promise<DummyProduct[]> {
  try {
    const res = await fetch("https://dummyjson.com/products", {
      next: { revalidate: 60 } // Automatically re-fetches data every 60 seconds
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // API wraps the actual array inside the "products" property
    return data.products || [];
  } catch (error) {
    console.error("Failed to fetch products from DummyJSON:", error);
    return []; // Graceful fallback array to prevent page crashes
  }
}

// 3. Main Next.js Page Component (Strict Light Mode & Bigger Product Images)
export default async function Home() {
  const products = await getAllProducts();

  return (
    <div className="w-full bg-zinc-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans text-zinc-900">

      {/* Dynamic Header Badge Section (Pure Light Mode) */}
      <div className="mb-12 max-w-7xl mx-auto text-center sm:text-left sm:flex sm:items-center sm:justify-between border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">
            DummyJSON Collection
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Successfully connected and displaying live items dynamically.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 animate-pulse">
            ● Live API Connected
          </span>
        </div>
      </div>

      {/* Grid Layout Mapping (Pure Light Mode) */}
      <div className="max-w-7xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-24 border border-dashed rounded-xl bg-white text-zinc-500">
            No items found. Please check your internet or refresh the server terminal.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >

                {/* Product Thumbnail Wrapper - Image Size Increased to h-64 */}
                <div className="relative h-64 w-full bg-zinc-100/80 p-6 flex items-center justify-center border-b border-zinc-100 overflow-hidden">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center rounded-md bg-white/90 shadow-sm px-2.5 py-1 text-xs font-semibold text-zinc-700 capitalize border border-zinc-200">
                    {product.category}
                  </span>
                </div>

                {/* Product Content Details */}
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <h3 className="text-base font-bold text-zinc-900 line-clamp-1" title={product.title}>
                    {product.title}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2 min-h-[32px] leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 text-sm">★</span>
                      <span className="text-sm font-bold text-zinc-700">
                        {product.rating}
                      </span>
                    </div>
                    <p className="text-xl font-black text-zinc-900">
                      ${product.price}
                    </p>
                  </div>

                  {/* Primary Add Action */}
                  <button className="mt-5 w-full rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-zinc-800">
                    Add to Cart
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
