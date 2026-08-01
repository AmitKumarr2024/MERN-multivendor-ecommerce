import User from "../../auth/models/auth.model.js";
import generateToken from "../../../utils/generateToken.js";
import { COOKIE_NAME, getCookieOptions } from "../../../utils/cookieOptions.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../../../exceptions/ApiError.js";
import {
  buildRegistrationOptions,
  verifyAndSaveRegistration,
  buildAuthenticationOptions,
  buildDummyAuthenticationOptions,
  verifyAuthentication,
} from "../../../services/webauthn.service.js";

/**
 * PASSKEY (WEBAUTHN) CONTROLLER
 * ------------------------------------------------------------------
 *   1. getRegistrationOptions -> GET    /api/auth/passkey/register/options  (protected)
 *   2. verifyRegistration      -> POST   /api/auth/passkey/register/verify   (protected)
 *   3. getLoginOptions          -> POST   /api/auth/passkey/login/options     (public)
 *   4. verifyLogin               -> POST   /api/auth/passkey/login/verify      (public)
 *   5. listPasskeys              -> GET    /api/auth/passkey                   (protected)
 *   6. deletePasskey             -> DELETE /api/auth/passkey/:credentialId      (protected)
 *
 * Passkeys are an ADDITIONAL login method alongside email+password, not a
 * replacement - registering one requires already being logged in (via
 * password) first. Once registered, a passkey can be used to log in
 * without a password on that device.
 * ------------------------------------------------------------------
 */

// 1. Start adding a passkey to the currently logged-in account
export const getRegistrationOptions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new NotFoundError("User not found");

    const options = await buildRegistrationOptions(user);
    res.json(options);
  } catch (error) {
    next(error);
  }
};

// 2. Complete passkey registration with the authenticator's signed response
export const verifyRegistration = async (req, res, next) => {
  try {
    const { response, nickname } = req.body;
    if (!response) throw new BadRequestError("response is required");

    const user = await User.findById(req.user._id).select(
      "+currentChallenge +currentChallengeExpires",
    );
    if (!user) throw new NotFoundError("User not found");

    const savedPasskey = await verifyAndSaveRegistration(
      user,
      response,
      nickname,
    );

    res.status(201).json({
      message: "Passkey registered successfully",
      passkey: {
        credentialId: savedPasskey.credentialId,
        nickname: savedPasskey.nickname,
        deviceType: savedPasskey.deviceType,
        createdAt: savedPasskey.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Start a passkey login - client identifies themselves by email first,
// since we need to know which account's passkeys to offer.
export const getLoginOptions = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new BadRequestError("Email is required");

    const user = await User.findOne({ email: email.toLowerCase() });

    // Anti-enumeration: don't reveal whether this email exists or has any
    // passkeys registered. Return a real-shaped-but-unusable options object
    // either way, so the two cases can't be told apart from the response.
    if (!user || !user.passkeys || user.passkeys.length === 0) {
      const dummyOptions = await buildDummyAuthenticationOptions();
      return res.json(dummyOptions);
    }

    const options = await buildAuthenticationOptions(user);
    res.json(options);
  } catch (error) {
    next(error);
  }
};

// 4. Complete passkey login, issue the same session cookie a normal login would
export const verifyLogin = async (req, res, next) => {
  try {
    const { email, response } = req.body;
    if (!email || !response)
      throw new BadRequestError("Email and response are required");

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+currentChallenge +currentChallengeExpires",
    );
    if (!user) {
      throw new BadRequestError("Passkey authentication failed");
    }
    if (!user.isActive) {
      throw new UnauthorizedError(
        "Your account has been suspended. Please contact support.",
      );
    }

    await verifyAuthentication(user, response);

    const token = generateToken(user._id, user.role);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shop: user.shop,
      mustChangePassword: user.mustChangePassword,
    });
  } catch (error) {
    next(error);
  }
};

// 5. List the logged-in user's registered devices (for a "manage passkeys" settings page)
export const listPasskeys = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new NotFoundError("User not found");

    const passkeys = (user.passkeys || []).map((pk) => ({
      credentialId: pk.credentialId,
      nickname: pk.nickname,
      deviceType: pk.deviceType,
      createdAt: pk.createdAt,
    }));

    res.json(passkeys);
  } catch (error) {
    next(error);
  }
};

// 6. Remove a registered passkey (e.g. lost/stolen device)
export const deletePasskey = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new NotFoundError("User not found");

    const beforeCount = user.passkeys.length;
    user.passkeys = user.passkeys.filter(
      (pk) => pk.credentialId !== req.params.credentialId,
    );

    if (user.passkeys.length === beforeCount) {
      throw new NotFoundError("Passkey not found");
    }

    await user.save();
    res.json({ message: "Passkey removed" });
  } catch (error) {
    next(error);
  }
};
