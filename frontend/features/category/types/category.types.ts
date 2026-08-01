

export interface Category {
    _id: string;

    name: string;

    slug: string;

    image: string;

    isActive: boolean;

    parent: Category | null;

    createdAt: string;

    updatedAt: string;
}

export interface CreateCategoryPayload {
    name: string;

    image?: string;

    parent?: string | null;
}

export interface UpdateCategoryPayload
    extends CreateCategoryPayload {

    id: string;

    isActive?: boolean;
}

export interface CategoryState {
    categories: Category[];

    selectedCategory: Category | null;

    loading: boolean;

    error: string | null;

    successMessage: string | null;
}