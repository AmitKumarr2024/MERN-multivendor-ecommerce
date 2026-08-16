import { AdminOrdersTable } from "@/features/admin/Index";
import RequireRole from "@/features/profile/Requirerole";


export default function AdminOrdersPage() {
    return (
        <RequireRole allow={["admin"]}>
            <AdminOrdersTable />
        </RequireRole>
    );
}