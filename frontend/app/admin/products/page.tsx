import { AdminProductsTable } from "@/features/admin/Index";
import RequireRole from "@/features/profile/Requirerole";


export default function AdminProductsPage() {
    return (
        <RequireRole allow={["admin"]}>
            <AdminProductsTable />
        </RequireRole>
    );
}