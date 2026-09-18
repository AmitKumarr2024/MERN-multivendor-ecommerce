import rateLimit from "express-rate-limit";

/**
 * RATE LIMITING
 * ------------------------------------------------------------------
 * `skip` disables limiting entirely when NODE_ENV === "test" - Jest sets
 * this automatically, so the existing test suite (which fires many rapid
 * register/login requests across files) isn't affected.
 *
 * `isDev` gives development a much higher ceiling than production, since
 * hot-reload + manual browser refresh naturally fire far more requests
 * than a real user session ever would. Production keeps the strict limits.
 *
 * `keyGenerator` uses the logged-in user's id (set by authMiddleware on
 * req.user) instead of raw IP wherever possible. This matters a lot on
 * Indian mobile networks (Jio/Airtel etc.) where many devices share one
 * public IP behind carrier-grade NAT — pure IP-based limiting would let
 * one heavy user exhaust the quota for everyone else on that network.
 * Falls back to IP when there's no authenticated user yet (e.g. login
 * itself, or public browsing before auth).
 * ------------------------------------------------------------------
 */

const isTestEnv = () => process.env.NODE_ENV === "test";
const isDevEnv = () => process.env.NODE_ENV === "development";

// Shared key generator: prefer authenticated user id, fall back to IP
const userOrIpKey = (req) => {
  if (req.user?._id) return `user:${req.user._id}`;
  if (req.user?.id) return `user:${req.user.id}`;
  return `ip:${req.ip}`;
};

// Strict limiter for auth endpoints prone to brute-force / credential stuffing.
// Intentionally stays IP-based (keyGenerator not overridden) because at
// login/register time there IS no req.user yet — that's the whole point
// of these routes.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevEnv() ? 300 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  message: {
    message: "Too many attempts. Please try again shortly.",
  },
});

// Looser limiter applied globally to all other API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevEnv() ? 3000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  keyGenerator: userOrIpKey,
  message: {
    message: "Too many requests. Please slow down and try again shortly.",
  },
});

// Uploads are heavier (network + Cloudinary processing cost) than a typical
// API call, so they get their own tighter limit rather than sharing apiLimiter's
// generous allowance.
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevEnv() ? 300 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  keyGenerator: userOrIpKey,
  message: {
    message: "Too many uploads. Please slow down and try again shortly.",
  },
});
