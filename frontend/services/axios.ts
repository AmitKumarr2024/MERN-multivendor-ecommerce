import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3008/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * RATE-LIMIT (429) HANDLING
 * ------------------------------------------------------------------
 * Backend's apiLimiter/uploadLimiter/authLimiter return 429 when a user
 * (or shared-IP household on Jio/Airtel-style NAT) exceeds the window.
 * Without this, a 429 looks like a random failed request or "disconnect"
 * to the user — this interceptor turns it into a clear, de-duplicated
 * message instead.
 *
 * `rateLimitToastShownAt` cooldown prevents a burst of parallel requests
 * (e.g. dashboard firing 10+ calls on load) from showing 10 identical
 * messages back to back.
 *
 * Dispatches a `ratelimit:exceeded` CustomEvent on window instead of
 * calling a toast library directly — keeps this file dependency-free.
 * Listen for it once in a top-level provider (e.g. AppProvider.tsx) and
 * wire it to whatever toast/notification UI the project uses.
 * ------------------------------------------------------------------
 */
let rateLimitToastShownAt = 0;
const RATE_LIMIT_TOAST_COOLDOWN_MS = 5000;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const now = Date.now();
      if (now - rateLimitToastShownAt > RATE_LIMIT_TOAST_COOLDOWN_MS) {
        rateLimitToastShownAt = now;

        const retryAfterHeader = error.response.headers?.["retry-after"];
        const message =
          error.response.data?.message ||
          "Too many requests. Please wait a moment and try again.";

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("ratelimit:exceeded", {
              detail: {
                message,
                retryAfterSeconds: retryAfterHeader
                  ? Number(retryAfterHeader)
                  : null,
              },
            }),
          );
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
