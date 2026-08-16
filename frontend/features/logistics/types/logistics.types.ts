export interface CheckServiceabilityPayload {
    shopId: string;
    deliveryPincode: string;
    weightKg?: number;
}

export interface ServiceabilityResult {
    serviceable: boolean;
    estimatedRate?: number;
    estimatedDeliveryDays?: number;
}

/** Matches Order.shipment sub-schema (order.model.js) — used by OrderTracking. */
export interface ShipmentHistoryEntry {
    status: string;
    message: string;
    occurredAt: string;
}

export interface Shipment {
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
    history: ShipmentHistoryEntry[];
}

/** Live status pulled fresh from the courier (trackShipment adapter call). */
export interface LiveTracking {
    status: string | null;
    history: ShipmentHistoryEntry[];
}

export interface TrackingResponse {
    shipment: Shipment;
    liveTracking: LiveTracking | null;
}