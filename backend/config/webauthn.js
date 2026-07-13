/**
 * WEBAUTHN / PASSKEY CONFIG
 * ------------------------------------------------------------------
 * RP_ID must be the exact domain (no protocol, no port) that the FRONTEND
 * is served from - not the API server's hostname, unless they're the same.
 * They can differ by subdomain (e.g. RP_ID="myapp.com" works whether the
 * frontend is at myapp.com or app.myapp.com), but the browser enforces
 * this strictly - a mismatch silently breaks passkey registration/login.
 *
 * ORIGIN must be the frontend's full URL including protocol (and port in
 * dev), e.g. "http://localhost:3000" locally, "https://myapp.com" in prod.
 * ------------------------------------------------------------------
 */
export const RP_NAME = process.env.RP_NAME || "MERN Marketplace";
export const RP_ID = process.env.RP_ID || "localhost";
export const ORIGIN = process.env.ORIGIN || "http://localhost:3000";
