import { ProfileView } from "@/features/profile";
import RequireRole from "@/features/profile/Requirerole";

export default function BuyerProfilePage() {
    return (
        <RequireRole allow={["buyer"]}>
            <ProfileView />
        </RequireRole>
    );
}