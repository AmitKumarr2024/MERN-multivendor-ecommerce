import { ProfileView } from "@/features/profile";
import RequireRole from "@/features/profile/Requirerole";


export default function AdminProfilePage() {
    return (
        <RequireRole allow={["admin"]}>
            <ProfileView />
        </RequireRole>
    );
}