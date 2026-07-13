import jwt from "jsonwebtoken";
import User from "../modules/auth/models/auth.model.js";
import { UnauthorizedError, ForbiddenError } from "../exceptions/ApiError.js";

export const protect = async (req, res, next) => {
  // Prefer httpOnly cookie; fall back to Authorization header (useful for
  // mobile apps / Postman where cookies aren't convenient)
  let token = req.cookies?.token;

  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new UnauthorizedError("Not authorized, no token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return next(
        new UnauthorizedError("User not found, authorization denied"),
      );
    }
    if (!req.user.isActive) {
      return next(
        new UnauthorizedError(
          "Your account has been suspended. Please contact support.",
        ),
      );
    }
    return next();
  } catch (error) {
    return next(new UnauthorizedError("Not authorized, invalid token"));
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Role '${req.user ? req.user.role : "guest"}' is not allowed to access this resource`,
        ),
      );
    }
    next();
  };
};
