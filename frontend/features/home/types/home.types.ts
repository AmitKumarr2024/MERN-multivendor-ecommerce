import type { Category } from "@/features/category";
import type { ProductSort } from "@/features/products";

export interface HomeFilters {
  category: string | null;
  minPrice: string;
  maxPrice: string;
  sort: ProductSort;
}

export interface HomeFilterProps {
  filters: HomeFilters;
  categories: Category[];
  productCount: number;

  onCategoryChange: (category: string | null) => void;

  onMinPriceChange: (value: string) => void;

  onMaxPriceChange: (value: string) => void;

  onSortChange: (value: ProductSort) => void;

  onClear: () => void;
}
