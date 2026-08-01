export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cod" | "razorpay";

export interface OrderItem {
    product: string;
    name: string;
    image: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

export interface ShippingAddress {
    fullName?: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    pincode?: string;
    country?: string;
}

export interface ShipmentInfo {
    provider: string | null;
    courierName: string | null;
    shipmentId: string | null;
    awbCode: string | null;
    trackingId: string | null;
    rate: number | null;
    estimatedDeliveryDays: number | null;
    status: string | null;
    trackingUrl: string | null;
    lastWebhookAt: string | null;
    history: { status: string; message: string; occurredAt: string }[];
}

export interface OrderShopRef {
    _id: string;
    shopName: string;
    slug: string;
    logo?: string;
    owner?: string;
}

export interface OrderBuyerRef {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface Order {
    _id: string;
    buyer: OrderBuyerRef | string;
    shop: OrderShopRef | string;
    items: OrderItem[];
    itemsSubtotal: number;
    tax: number;
    shippingCost: number;
    discount: number;
    grandTotal: number;
    shippingAddress: ShippingAddress;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentId: string | null;
    orderStatus: OrderStatus;
    shipment: ShipmentInfo;
    cancelReason: string | null;
    createdAt: string;
    updatedAt: string;
}

/* =========================================================
   RESPONSES
========================================================= */

export interface PaginatedOrdersResponse {
    orders: Order[];
    total: number;
    page: number;
    pages: number;
}

export interface CheckoutResponse {
    message: string;
    orders: Order[];
}

/* =========================================================
   PAYLOADS / PARAMS
========================================================= */

export interface CheckoutPayload {
    shippingAddress: ShippingAddress;
    paymentMethod?: PaymentMethod;
}

export interface UpdateOrderStatusArgs {
    id: string;
    status: OrderStatus;
}

export interface CancelOrderArgs {
    id: string;
    reason?: string;
}

export interface OrderQueryParams {
    status?: OrderStatus;
    page?: number;
    limit?: number;
}