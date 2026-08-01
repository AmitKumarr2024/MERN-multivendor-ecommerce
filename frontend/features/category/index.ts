// features/category/index.ts

/* =========================================================
   COMPONENTS
========================================================= */

export { default as CategoryCard } from "./components/CategoryCard";
export { default as CategoryForm } from "./components/CategoryForm";
export { default as CategoryList } from "./components/CategoryList";
export { default as CategoryTree } from "./components/CategoryTree";


/* =========================================================
   REDUX
========================================================= */

export {
    default as categoryReducer,

    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    clearCategoryError,
    clearCategoryMessage,
    setSelectedCategory,
    resetCategoryState,
} from "./store/categorySlice";


/* =========================================================
   SELECTORS
========================================================= */

export * from "./store/categorySelector";


/* =========================================================
   TYPES
========================================================= */

export type * from "./types/category.types";