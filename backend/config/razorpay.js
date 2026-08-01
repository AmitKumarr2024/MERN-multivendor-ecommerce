import Razorpay from "razorpay";
import logger from "../logs/logger.js";

// NOTE: secrets are deliberately NOT exported as frozen top-level constants
// here. An earlier version did that, and it broke in a subtle way: ES module
// exports are evaluated once at first import and cached - if RAZORPAY_KEY_SECRET
// isn't set yet at that moment (e.g. dotenv hasn't loaded, or a test sets it
// later), every future read of that constant stays stuck at the stale value
// forever, even after process.env changes. Reading process.env.X live, at the
// point of use inside each function, avoids this entirely.

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  logger.warn("Razorpay credentials missing from .env - the razorpay payment provider will fail until set.");
}

// Lazily constructed - the Razorpay SDK throws SYNCHRONOUSLY at instantiation
// time if credentials are missing. If we built the client eagerly at module
// load time, the entire app would fail to even start whenever Razorpay
// credentials are absent - even if a DIFFERENT provider (e.g. Cashfree) is
// the one actually configured as active. Building it lazily means missing
// credentials only cause a failure if/when Razorpay is actually used, and
// re-reads process.env fresh each time rather than caching a stale client
// built from now-outdated credentials.
let cachedClient = null;
let cachedForKeyId = null;

export const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Rebuild if credentials changed since the client was last built (mainly
  // relevant in tests; in production these don't change without a restart)
  if (!cachedClient || cachedForKeyId !== keyId) {
    cachedClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
    cachedForKeyId = keyId;
  }
  return cachedClient;
};