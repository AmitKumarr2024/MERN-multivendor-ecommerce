import { AdminShopsTable } from "@/features/admin/Index";
import RequireRole from "@/features/profile/Requirerole";

export default function AdminShopsPage() {
    return (
        <RequireRole allow={["admin"]}>
            <AdminShopsTable />
        </RequireRole>
    );
}