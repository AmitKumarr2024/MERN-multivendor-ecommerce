export interface SearchSuggestionProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number | null;
}

export interface SearchSuggestionCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface SearchSuggestionsResponse {
  products: SearchSuggestionProduct[];
  categories: SearchSuggestionCategory[];
}

export interface TrendingSearchesResponse {
  trending: string[];
}

export interface SearchFallbackSuggestions {
  categories: SearchSuggestionCategory[];
  popularProducts: SearchSuggestionProduct[];
}

export interface SearchResultsResponse {
  products: import("@/features/products").Product[];
  total: number;
  page: number;
  pages: number;
  suggestions?: SearchFallbackSuggestions;
}
