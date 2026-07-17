export const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

export const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
export const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

// The pickup location "nickname" must already be configured in the
// Shiprocket dashboard (Settings > Pickup Addresses) before this works -
// Shiprocket has no API to create one, it's a one-time manual setup step.
export const SHIPROCKET_PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary";