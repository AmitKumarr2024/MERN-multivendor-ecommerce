import SellerSidebar from "@/features/seller-dashboard/components/SellerSidebar";

interface SellerLayoutProps {
    children: React.ReactNode;
}

export default function SellerLayout({
    children,
}: SellerLayoutProps) {
    return (
        <SellerSidebar>
            {children}
        </SellerSidebar>
    );
}