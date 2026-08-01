import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { RP_NAME, RP_ID, ORIGIN } from "../config/webauthn.js";
import { BadRequestError } from "../exceptions/ApiError.js";

/**
 * WEBAUTHN SERVICE
 * ------------------------------------------------------------------
 * Every WebAuthn ceremony (registration or login) is two round-trips:
 *   1. Server generates "options" (including a random challenge) -> client
 *   2. Client's authenticator signs the challenge -> sends "response" back
 *   3. Server verifies the response matches the challenge it generated
 *
 * The challenge must be remembered server-side between steps 1 and 3 -
 * we store it directly on the User document (currentChallenge, with a
 * short expiry) rather than a separate session store, since it's simple
 * and this project doesn't otherwise use server-side sessions.
 *
 * PLATFORM PASSKEY POLICY (Windows Hello / Touch ID / Face ID / Android):
 * Both registration and authentication are configured to require a
 * platform authenticator with local user verification (PIN/biometric)
 * rather than leaving it up to the browser to offer security keys too.
 * The PIN/biometric itself never reaches our backend - it only unlocks
 * the private passkey material on the user's own device.
 * ------------------------------------------------------------------
 */

const CHALLENGE_EXPIRES_MINUTES = 5; // WebAuthn ceremonies happen in seconds - a short window is appropriate

const assertChallengeValid = (user) => {
  if (
    !user.currentChallenge ||
    !user.currentChallengeExpires ||
    user.currentChallengeExpires < new Date()
  ) {
    throw new BadRequestError("This request has expired. Please try again.");
  }
};

// ---- Registration (adding a new passkey to an existing, logged-in account) ----

export const buildRegistrationOptions = async (user) => {
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.email,
    userID: isoUint8Array.fromHex(user._id.toString()),
    userDisplayName: user.name,
    attestationType: "none",
    excludeCredentials: (user.passkeys || []).map((pk) => ({
      id: pk.credentialId,
      transports: pk.transports,
    })),
    // Force a platform (built-in) authenticator - on Windows this is
    // Windows Hello - and require a discoverable, user-verified passkey
    // instead of leaving the choice open to external security keys.
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "required",
      requireResidentKey: true,
      userVerification: "required",
    },
  });

  user.currentChallenge = options.challenge;
  user.currentChallengeExpires = new Date(
    Date.now() + CHALLENGE_EXPIRES_MINUTES * 60 * 1000,
  );
  await user.save();

  return options;
};

export const verifyAndSaveRegistration = async (user, response, nickname) => {
  assertChallengeValid(user);

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
  } catch (error) {
    // @simplewebauthn throws raw errors (e.g. SyntaxError from malformed/
    // tampered client data) rather than anything of ours - normalize any
    // failure here into a clean 400 instead of letting it become a 500.
    throw new BadRequestError(
      `Passkey registration could not be verified: ${error.message}`,
    );
  }

  if (!verification.verified || !verification.registrationInfo) {
    throw new BadRequestError("Passkey registration could not be verified");
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  const alreadyRegistered = (user.passkeys || []).some(
    (pk) => pk.credentialId === credential.id,
  );
  if (alreadyRegistered) {
    throw new BadRequestError(
      "This passkey is already registered to your account",
    );
  }

  const newPasskey = {
    credentialId: credential.id,
    publicKey: isoBase64URL.fromBuffer(credential.publicKey),
    counter: credential.counter,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    transports: credential.transports || [],
    nickname: nickname?.trim() || "My device",
    createdAt: new Date(),
  };

  user.passkeys.push(newPasskey);
  user.currentChallenge = null;
  user.currentChallengeExpires = null;
  await user.save();

  return newPasskey;
};

// ---- Authentication (logging in with a previously registered passkey) ----

export const buildAuthenticationOptions = async (user) => {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: (user.passkeys || []).map((pk) => ({
      id: pk.credentialId,
      transports: pk.transports,
    })),
    // Require local verification (Windows Hello PIN/biometric etc.) at
    // login time too, matching the registration policy above.
    userVerification: "required",
  });

  user.currentChallenge = options.challenge;
  user.currentChallengeExpires = new Date(
    Date.now() + CHALLENGE_EXPIRES_MINUTES * 60 * 1000,
  );
  await user.save();

  return options;
};

// A shape-matched but unusable options object, returned when no account/passkey
// exists for the submitted email - keeps the response indistinguishable from a
// real one so this endpoint can't be used to discover which emails have passkeys.
export const buildDummyAuthenticationOptions = async () => {
  return generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "required",
  });
};

export const verifyAuthentication = async (user, response) => {
  assertChallengeValid(user);

  const passkey = (user.passkeys || []).find(
    (pk) => pk.credentialId === response.id,
  );
  if (!passkey) {
    throw new BadRequestError("This passkey is not registered to this account");
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.credentialId,
        publicKey: isoBase64URL.toBuffer(passkey.publicKey),
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });
  } catch (error) {
    throw new BadRequestError(
      `Passkey authentication could not be verified: ${error.message}`,
    );
  }

  if (!verification.verified) {
    throw new BadRequestError("Passkey authentication could not be verified");
  }

  // Update the stored counter - authenticators increment this on every use,
  // and a counter that goes backwards (or repeats) is a sign of a cloned
  // authenticator, which @simplewebauthn already checks for internally.
  passkey.counter = verification.authenticationInfo.newCounter;
  user.currentChallenge = null;
  user.currentChallengeExpires = null;
  await user.save();
};
