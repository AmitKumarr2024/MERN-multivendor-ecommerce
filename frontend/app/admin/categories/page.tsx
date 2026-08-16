import RequireRole from "@/features/profile/Requirerole";
import AdminCategories from "@/features/admin/components/AdminCategories";

export default function AdminCategoriesPage() {
    return (
        <RequireRole allow={["admin"]}>
            <AdminCategories />
        </RequireRole>
    );
}