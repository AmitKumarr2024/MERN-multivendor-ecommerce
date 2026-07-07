// Centralized cookie config so login/register/logout all stay consistent
export const COOKIE_NAME = "token";

export const getCookieOptions = () => {
  const days = Number(process.env.COOKIE_EXPIRES_DAYS) || 7;

  return {
    httpOnly: true, // JS can't read it -> protects against XSS token theft
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection, "none" needed for cross-site in prod
    maxAge: days * 24 * 60 * 60 * 1000,
  };
};
