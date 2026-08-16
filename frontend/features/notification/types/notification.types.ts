export type NotificationType =
  | "order_placed"
  | "order_status"
  | "new_offer"
  | "new_product"
  | "new_shop"
  | "feedback"
  | "message"
  | "wishlist_price_drop"
  | "system";

export interface Notification {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  relatedId: string | null;
  relatedModel: "Order" | "Product" | "Shop" | "Conversation" | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pages: number;
}

export interface FetchNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const NOTIFICATION_META: Record<
  NotificationType,
  { icon: string; color: string; label: string }
> = {
  order_placed: { icon: "Package", color: "text-blue-500", label: "New Order" },
  order_status: {
    icon: "Truck",
    color: "text-amber-500",
    label: "Order Update",
  },
  new_offer: { icon: "Tag", color: "text-pink-500", label: "Offer" },
  new_product: {
    icon: "ShoppingBag",
    color: "text-emerald-500",
    label: "New Product",
  },
  new_shop: { icon: "Store", color: "text-purple-500", label: "New Shop" },
  feedback: { icon: "Star", color: "text-yellow-500", label: "Feedback" },
  message: { icon: "MessageCircle", color: "text-cyan-500", label: "Message" },
  wishlist_price_drop: {
    icon: "TrendingDown",
    color: "text-red-500",
    label: "Price Drop",
  },
  system: { icon: "Bell", color: "text-gray-500", label: "Announcement" },
};
