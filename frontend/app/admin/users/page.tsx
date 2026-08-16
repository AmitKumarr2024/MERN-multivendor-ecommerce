import { AdminUsersTable } from "@/features/admin/Index";
import RequireRole from "@/features/profile/Requirerole";

export default function AdminUsersPage() {
    return (
        <RequireRole allow={["admin"]}>
            <AdminUsersTable />
        </RequireRole>
    );
}