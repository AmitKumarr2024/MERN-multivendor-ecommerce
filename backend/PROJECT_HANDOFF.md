# PROJECT CONTEXT — Hybrid Commerce Platform (MERN Multi-Vendor Marketplace)

Paste this entire document at the start of a new chat to continue exactly where I left off.

## ⚠️ UNRESOLVED ISSUE — check/fix this first

As of the last confirmed test run, the suite was failing with:

```
Cannot find module '../../modules/auth/auth.model.js' from 'backend/tests/services/cart.service.test.js'
Cannot find module '../../modules/auth/auth.routes.js' from 'backend/tests/modules/auth.test.js'
```

32/89 tests still passed (the ones not depending on auth), but 7 of 10 suites failed
to even load. This started right after adding the Passkey/WebAuthn files to
`modules/auth/`. It was NOT confirmed fixed before this handoff was written.

**First step in the new chat**: ask me to run `npm test` again to see current status.
If the same error appears, ask me to run this in PowerShell and paste the output:

```powershell
Get-ChildItem -Path "backend\modules\auth" -Recurse -File | Select-Object FullName
```

Expected 7 files in `backend/modules/auth/`: `auth.model.js`, `auth.controller.js`,
`auth.validation.js`, `auth.routes.js`, `webauthn.controller.js`,
`webauthn.validation.js`, `webauthn.routes.js` — plus `services/webauthn.service.js`
and `config/webauthn.js` elsewhere.

---

## What this project actually is (product vision, not just "another marketplace")

This is being built as a **Hybrid Commerce Platform**, not a plain multi-vendor
clone. Core philosophy, in the founder's own words:

> **"Seller manages the business. Platform manages the operations."**

Concretely: a local shop owner should only ever deal with products, pricing, and
packing orders. The platform is responsible for courier selection, shipping,
payments, settlements, OTP-based delivery proof, and (later) subscriptions,
wallets, and credit ledgers. The seller never sees courier names, API keys, or
rate comparisons - they click "Ship" and it's handled.

The platform supports both **local** (same city/state) and **national** (all-India)
commerce through the same seller dashboard, and is designed to support scenarios
like "buy from Bangalore, deliver to parents in Patna" by searching local sellers
near the delivery address first, then state-wide, then all-India.

Full original product vision doc (business model, revenue streams, phase 1-3
roadmap, coupon types, credit ledger design, store pickup flow, subscription
tiers) exists in earlier conversation history - ask if you need the full text
reproduced; the summary below covers what's relevant to current code.

### Product strategy note (from external review, worth keeping in mind)

A reviewer suggested writing an 80-120 page "Product Bible" before more coding.
**I pushed back on that as premature for a solo/early-stage build** - the agreed
approach instead is: finish the core transactional loop (which is now nearly
done: auth → shop → product → cart → order → **logistics**, payment next),
get a handful of real sellers using it, and only build the heavier modules
(subscriptions, staff accounts, wallet, refunds, analytics, CRM, fraud
protection) once real usage reveals what's actually needed - not from a
speculative spec. Write a short 1-2 page brief per module only right before
building it, not all of them upfront.

**Priority classification agreed on:**

- **Build now/soon**: logistics (in progress), a _simple_ refund flow
  (manual/admin-approved, not the full automated workflow), a _simple_ wallet
  ledger (just a transaction log, not full withdraw/processing states)
- **Defer until there are real users asking for them**: subscription tiers,
  staff accounts/permissions, reviews, seller analytics dashboards, a full
  notification center (SMS/WhatsApp/push - email itself isn't even wired in
  yet), platform finance/GST reporting, admin CRM/disputes, fraud protection

## Tech stack

- **Backend**: Node.js + Express, ES Modules (`"type": "module"` in package.json)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT stored in an **httpOnly cookie** (not localStorage), PLUS optional
  **WebAuthn/Passkeys** as a second login method (fingerprint/Face ID/security key)
- **File storage**: Cloudinary (images), via Multer memory storage (no disk writes)
- **Logistics**: Shiprocket (adapter pattern - easy to add NimbusPost/Delhivery later)
- **Real-time**: Socket.io (chat, typing indicators, online presence, order
  notifications, broadcasts)
- **Validation**: Zod
- **Rate limiting**: express-rate-limit (`authLimiter`, `apiLimiter`, `uploadLimiter`
  — all auto-disabled in test env)
- **Logging**: Winston (files) + Morgan (HTTP requests)
- **Testing**: Jest + Supertest + mongodb-memory-server (in-memory DB for tests)
- **Frontend**: Not started yet — will be Next.js

## Folder structure (backend/)

```
backend/
├── config/              db.js, logger.js, cloudinary.js, webauthn.js, shiprocket.js
├── constants/           roles.js, messages.js
├── exceptions/          ApiError.js (BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError)
├── middleware/           authMiddleware.js, errorHandler.js, httpLogger.js, validate.js,
│                        rateLimiter.js, upload.js (Multer config)
├── services/             CENTRALIZED — pricing.service.js, inventory.service.js, cart.service.js,
│                         order.service.js, shopHours.service.js, upload.service.js,
│                         webauthn.service.js, logistics/logistics.service.js,
│                         logistics/providers/shiprocketAdapter.js
│                         (business logic lives here, NOT in controllers)
├── sockets/              io.js, index.js, emit.js, presenceTracker.js
├── modules/
│   ├── auth/             auth.model.js, auth.controller.js, auth.routes.js, auth.validation.js,
│   │                     webauthn.controller.js, webauthn.routes.js, webauthn.validation.js
│   │                     (see UNRESOLVED ISSUE above - verify this folder is intact)
│   ├── shop/
│   │   ├── models/shop.model.js
│   │   └── controllers/  create/, read/, update/, slug/, hours/ (each in its own subfolder)
│   │   └── routes/shop.routes.js, shop.validation.js
│   ├── product/
│   │   ├── models/       product.model.js, category.model.js
│   │   └── controllers/  product.create/read/update/delete.controller.js, category.controller.js
│   │   └── routes/       product.routes.js, category.routes.js, product.validation.js
│   ├── cart/              cart.model.js, cart.controller.js, cart.routes.js, cart.validation.js
│   ├── order/             order.model.js (shipment sub-schema expanded for logistics tracking),
│   │                      order.create/read/update.controller.js, order.routes.js
│   │                      (now also mounts ship + tracking endpoints from logistics module),
│   │                      order.validation.js
│   ├── logistics/         controllers/logistics.controller.js, routes/logistics.routes.js,
│   │                      logistics.validation.js
│   ├── admin/             admin.user/shop/product/order/dashboard.controller.js, admin.routes.js
│   ├── messagingSystem/   conversation + broadcast (models, controllers, routes)
│   └── upload/            upload.model.js (tracks who-uploaded-what for ownership checks),
│                          controllers/upload.controller.js, routes/upload.routes.js
├── tests/
│   ├── services/          pricing, inventory, shopHours, cart.service, order.service,
│   │                      logistics.service (unit/service-level, some with jest.unstable_mockModule)
│   ├── modules/            auth, shop, product, order, upload (HTTP integration tests via Supertest)
│   └── setup/db.js         in-memory MongoDB connect/clear/close helpers
└── index.js               app entry point
```

## Architecture patterns established (follow these for anything new)

1. **Controller vs Service split**: Controllers only handle HTTP (parse req, call
   service/model, send res). Business rules/calculations live in `services/`.
   Services take plain data in, return plain data out — no `req`/`res` — so they're
   directly unit-testable and reusable.
2. **Sub-controllers by concern**: Large modules split controllers into
   `create/read/update/delete` files (or subfolders for shop). Each file has a
   comment-block index at the top listing what's inside.
3. **Ownership checks over role checks**: Product/Order routes do NOT gate on
   `authorizeRoles(SELLER)` — they rely on `Shop.findOne({owner: req.user._id})`
   ownership checks inside controllers instead. This was a deliberate fix: role
   gates blocked buyers from ever seeing the friendly "create your shop first"
   message.
4. **Category is referenced by slug in API requests**, not ObjectId — e.g.
   `POST /api/products` body sends `category: "electronics"` (a string slug),
   which the controller looks up via `Category.findOne({slug})`.
5. **Validation**: Every route wraps its schema with the `validate()` middleware
   from `middleware/validate.js`. Schemas live in `<module>/<module>.validation.js`
   (sibling to routes/controllers, not in a subfolder).
6. **Image upload is decoupled from the resource it belongs to**: frontend uploads
   to a dedicated `/api/upload/*` endpoint first, gets back a `{url, publicId}`,
   then sends that URL as a plain string in the normal JSON body when
   creating/updating a shop or product. Shop/product endpoints stay pure JSON —
   only `modules/upload/` deals with multipart/form-data.
7. **Upload folders are hardcoded server-side per route** (`/api/upload/shop-logo`,
   `/shop-banner`, `/avatar`, `/product-images`), never client-controlled via a
   query param — that was a deliberate security fix (a `?folder=` param would let
   any caller write into any Cloudinary folder).
8. **Passkeys are additive, not a replacement** for password auth — registering
   one requires already being logged in via password first. Login later works
   with either password OR passkey.
9. **Logistics uses an adapter pattern**: `services/logistics/providers/*Adapter.js`
   each implement the same 4-function shape (`checkServiceability`,
   `createShipment`, `trackShipment`, `cancelShipment`). `logistics.service.js`
   registers them in a `PROVIDERS` map, calls all of them in parallel for
   serviceability checks, and auto-selects the best option (cheapest by
   default) — **the seller never picks a courier**, they just click "Ship".

## Known gotchas already fixed (don't reintroduce these)

- `middleware/validate.js` must default `req[source] ?? {}` before parsing —
  otherwise an all-optional schema still rejects a genuinely empty/bodyless request.
- `middleware/validate.js` must use `result.error.issues` (not `.errors`) —
  `.errors` is a version-dependent alias in Zod and can be undefined, crashing
  validation into a 500 instead of a clean 400.
- Rate limiters (`authLimiter`, `apiLimiter`, `uploadLimiter`) must
  `skip: () => process.env.NODE_ENV === "test"` so the test suite (which fires
  many rapid requests) doesn't get blocked. Jest sets `NODE_ENV=test` automatically.
- Services are centralized at `backend/services/` (not nested per-module) —
  watch relative import depth (`../exceptions/ApiError.js`, not `../../../`).
- `Order.service.js`'s checkout does a **manual best-effort rollback** (not a real
  Mongo transaction) — restores stock and deletes partial orders if a multi-shop
  checkout fails partway through. This is intentionally not using
  `mongoose.startSession()` since it assumes a single-instance MongoDB. Upgrade
  to transactions if moving to a replica set.
- `middleware/errorHandler.js` must specifically catch `multer.MulterError`
  (file-too-large etc.) and convert to a clean 400 — otherwise it falls through
  to the generic 500 branch.
- `services/upload.service.js`'s delete function (`deleteImageIfOwner`) MUST verify
  the requester actually uploaded the image (via the `Upload` tracking model)
  before calling Cloudinary's destroy — without this, any logged-in user could
  delete any image on the platform just by knowing/guessing its `publicId`.
- `services/webauthn.service.js` must wrap `verifyRegistrationResponse`/
  `verifyAuthenticationResponse` calls in try/catch and rethrow as
  `BadRequestError` — the raw `@simplewebauthn/server` library throws bare
  `SyntaxError`s on malformed client data, which would otherwise fall through
  to a 500 instead of a clean 400.
- `forgotPassword` must respond identically whether or not the email exists
  (generic message either way) to avoid leaking which emails are registered
  ("user enumeration"). Same principle applied to passkey login-options.
- The reset-password token is hashed with `crypto.createHash("sha256")` before
  storage (bcrypt is deliberately slow and inappropriate for a high-entropy
  random token — sha256 is the standard choice here, unlike for passwords).
- **`forgotPassword` currently returns the raw reset token directly in the API
  response when `NODE_ENV !== "production"`** — this is a dev-only convenience
  since no email service is wired in yet. This is NOT safe to expose in
  production (anyone could reset anyone's password by just knowing their
  email) — a real email service (Nodemailer/Resend/SendGrid) must replace this
  before going live. See the `TODO` comment at that exact spot in
  `auth.controller.js`.
- `services/logistics/logistics.service.js`'s `selectBestCourier()` must sort
  the options list **itself** rather than trusting the caller to have
  pre-sorted it — an earlier version just returned `options[0]`, which silently
  picked the wrong (not-actually-cheapest) courier when called with unsorted
  data. There's a regression test guarding this
  (`tests/services/logistics.service.test.js`) - don't remove it.
- The Shiprocket webhook endpoint (`POST /api/logistics/webhook/shiprocket`)
  currently has **no signature/secret verification** — anyone who finds the
  URL could POST fake shipment status updates. There's a `TODO` at that route
  to add HMAC verification once Shiprocket's dashboard provides a signing
  secret. Don't treat this endpoint as trusted input yet.

## Test status: last confirmed good run was 89/89 passing, 9/10 suites — but see

## UNRESOLVED ISSUE above; a regression to 32/89 was reported after adding

## Passkey files and not yet confirmed fixed. A new `logistics.service.test.js`

## (7 tests, mocked - doesn't need a live Shiprocket account) was added since

## and passed in isolation, but hasn't been run as part of the full suite yet.

Run with `npm test` (uses `mongodb-memory-server`, needs internet on first run to
download the Mongo binary — cached after that).

## What's fully built (assuming the auth-module regression above gets fixed)

- **Auth**: register/login/logout, profile update, change password, role switch
  (buyer↔seller), admin password reset with forced-change flag, self-service
  forgot/reset-password (dev-mode token, needs real email service for prod)
- **Passkeys (WebAuthn)**: register a passkey while logged in, login with a
  passkey (password-free), list/delete registered devices. Uses
  `@simplewebauthn/server` v13. RP_ID/ORIGIN configured via env vars.
- **Shop**: CRUD, custom slug/URL with collision-safe auto-increment, business
  hours + holidays with `isCurrentlyOpen()` computed field, verify (admin)
- **Product**: CRUD, categories (nested via `parent`), stock management, computed
  pricing (`effectivePrice`, `discountPercent`), search/filter/sort/pagination
- **Cart**: add/update/remove items, stock validation before adding
- **Order**: checkout (splits multi-vendor cart into one order per shop), rollback
  on partial failure, cancel (restores stock), status updates, real-time
  notifications to buyer/seller via Socket.io
- **Logistics**: Shiprocket adapter (auth, serviceability check, create
  shipment + assign AWB, track, cancel — **not yet verified against a live
  Shiprocket account**, only unit-testable pieces were tested), seller
  "Ship this order" one-click flow with automatic cheapest-courier selection,
  webhook receiver that updates order status + notifies buyer in real time,
  buyer/seller/admin tracking endpoint
- **Admin**: full control over users (ban, role, password reset), shops (verify,
  force-toggle), products (force-toggle, force-delete), orders (view-all,
  force-delete with safety rules), dashboard stats
- **Messaging**: buyer↔seller chat (conversations + messages), shop offer broadcasts,
  admin platform-wide toast broadcasts — all real-time via Socket.io with typing
  indicators and online presence
- **Image upload**: Cloudinary-backed, route-specific folders (shop-logo,
  shop-banner, avatar, product-images), per-folder image transforms, ownership-
  checked deletion via an `Upload` tracking model
- **Security**: httpOnly cookies, Zod input validation on every route, 3-tier rate
  limiting, Winston/Morgan logging, Multer file-type/size validation

## What's NOT built yet (roadmap, priority-ordered per the strategy note above)

1. **Payment integration (Razorpay)** — `paymentStatus` field exists on Order but
   nothing updates it from a real gateway yet. Natural next step since it sits
   right before logistics in the flow (pay → platform creates shipment).
2. **Real Shiprocket account verification** — the adapter was written against
   published API docs but never exercised against a live account; do this
   before trusting it with real orders.
3. **Real email service** — needed to make `forgotPassword` production-safe (see
   gotcha above) and to actually notify users generally
4. **Simple refund flow** (manual/admin-approved) and **simple wallet ledger**
   (transaction log only) — agreed as the next "build now" tier after payments
5. **Recovery codes** — companion to Passkeys (backup access if a user loses
   all their devices) but not yet implemented
6. Everything in the "defer until real users ask" tier: subscription plans,
   staff accounts, reviews, seller analytics, full notification center,
   platform finance/GST reports, admin CRM, fraud protection
7. Frontend (Next.js) — not started; will need `@simplewebauthn/browser` for the
   passkey UI (`startRegistration()`, `startAuthentication()`)

## My preferred working style (for the new chat to follow)

- I want code changes **actually tested** before being handed to me, not just
  "should work" — use `node --check` for syntax and real `import()` resolution
  checks, mocked-unit-tests for logic that can't hit real external APIs
  (Cloudinary, Shiprocket, WebAuthn), or run the actual test suite when possible
- When giving me a file to replace, give the **complete file content**, not a
  diff — I've had issues with partial pastes causing my local files to drift
  out of sync
- Explain things in Hinglish (Hindi+English mix), keep it practical
- I'm building this in `D:\Amit\A Developer\2026 product\full stack project\E-commerce app\backend`
- I think in product/business terms as much as code terms now (seller
  experience, not just endpoints) — keep giving both the technical "how" and
  the product "why" when it's relevant
