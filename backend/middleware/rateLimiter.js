import rateLimit from "express-rate-limit";

/**
 * RATE LIMITING
 * ------------------------------------------------------------------
 * `skip` disables limiting entirely when NODE_ENV === "test" - Jest sets
 * this automatically, so the existing test suite (which fires many rapid
 * register/login requests across files) isn't affected. Production and
 * development both get real limiting.
 * ------------------------------------------------------------------
 */
const isTestEnv = () => process.env.NODE_ENV === "test";

// Strict limiter for auth endpoints prone to brute-force / credential stuffing
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});

// Looser limiter applied globally to all other API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  message: {
    message: "Too many requests. Please slow down and try again shortly.",
  },
});
