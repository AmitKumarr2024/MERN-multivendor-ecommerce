import { OrderDetail } from "@/features/order";

interface OrderPageProps {
    params: Promise<{ id: string }>;
}

export default async function BuyerOrderDetailPage({ params }: OrderPageProps) {
    const { id } = await params;
    return <OrderDetail orderId={id} />;
}