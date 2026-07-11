import { BadRequestError } from "../exceptions/ApiError.js";

/**
 * Wraps a Zod schema into Express middleware. On success, req[source] is
 * replaced with the parsed (and type-coerced) data, so controllers can
 * trust the shape/types without re-checking. On failure, throws a single
 * BadRequestError with all validation issues combined into one message.
 *
 * Uses `.issues` (not `.errors`) since `.issues` is the canonical ZodError
 * property present across zod versions - `.errors` is only a v3-era alias
 * and isn't guaranteed to exist depending on the installed version.
 *
 * Usage: router.post("/", validate(registerSchema), registerUser)
 */
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    // Default to {} when nothing was sent at all (e.g. a PATCH with no body) -
    // otherwise a schema where every field is optional would still fail,
    // since Zod's object type check rejects `undefined` itself.
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      let message = "Invalid request data";
      try {
        const issues = result.error.issues || result.error.errors || [];
        message =
          issues
            .map((e) => `${(e.path || []).join(".") || source}: ${e.message}`)
            .join("; ") || message;
      } catch {
        // fall back to the generic message above if the error shape is
        // ever unexpected - never let validation error-formatting itself
        // become an unhandled 500
      }
      return next(new BadRequestError(message));
    }

    req[source] = result.data;
    next();
  };

export default validate;
