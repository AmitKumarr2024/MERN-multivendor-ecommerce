import AdminSidebar from "@/features/admin/components/AdminSidebar";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({
    children,
}: AdminLayoutProps) {
    return (
        <AdminSidebar>
            {children}
        </AdminSidebar>
    );
}