import { ProfileView } from "@/features/profile";
import RequireRole from "@/features/profile/Requirerole";

export default function SellerProfilePage() {
    return (
        <RequireRole allow={["seller"]}>
            <ProfileView />
        </RequireRole>
    );
}