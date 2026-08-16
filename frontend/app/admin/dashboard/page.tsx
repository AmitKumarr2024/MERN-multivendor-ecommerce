import { AdminDashboard } from "@/features/admin/Index";
import  RequireRole  from "@/features/profile/Requirerole";

export default function AdminDashboardPage() {
  return (
    <RequireRole allow={["admin"]}>
      <AdminDashboard />
    </RequireRole>
  );
}