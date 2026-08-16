# PROJECT CONTEXT — Hybrid Commerce Platform (MERN Multi-Vendor Marketplace)

Paste this entire document at the start of a new chat to continue exactly where I left off.

## ✅ RESOLVED — auth test-import issue (was flagged as unresolved in earlier handoffs)

Earlier handoffs (through 2026-08-08 morning) carried a warning about this failure:

```
Cannot find module '../../modules/auth/auth.model.js' from 'backend/tests/services/cart.service.test.js'
Cannot find module '../../modules/auth/auth.routes.js' from 'backend/tests/modules/auth.test.js'
```

**Verified resolved on 2026-08-08.** Inspected both files directly — they
already import from the correct subfolder paths
(`../../modules/auth/models/auth.model.js`,
`../../modules/auth/routes/auth.routes.js`), not the old flat path. Ran the
full suite to confirm:

```
Test Suites: 11 passed, 11 total
Tests:       110 passed, 110 total
Time:        7.056 s
```

All 11 suites green (up from the last documented "89/89, 9/10 suites" —
the extra suite/tests are from `wishlist` and `logistics.service.test.js`
being added since). No further action needed on this. The takeaway that
still matters going forward: **after any module folder restructuring, always
re-verify test import paths against the real file locations** — this handoff
doc itself had drifted from reality once (see folder-structure note below),
so don't assume docs are current without checking.

---

## Corrected folder structure note (previous handoff had this wrong)

The original handoff assumed a flat `modules/auth/` folder containing both
auth AND webauthn files. **Actual structure is different — two separate
modules**, confirmed via `Get-ChildItem -Path "backend\modules" -Recurse -Directory`:

```
modules/auth/
├── auth.validation.js
├── controllers/auth.controller.js
├── models/auth.model.js
└── routes/auth.routes.js

modules/webAuthn/          ← SEPARATE module, not nested inside auth/
├── webauthn.validation.js
├── controllers/webauthn.controller.js
└── routes/webauthn.routes.js
```

This is not a bug — just means any future references to "webauthn files in
modules/auth" are outdated. Update mental model: webauthn lives in its own
`modules/webAuthn/` module, and `services/webauthn.service.js` +
`config/webauthn.js` support it from outside, per the original design.

Every other module (`shop`, `product`, `cart`, `order`, `logistics`, `admin`,
`messagingSystem`, `upload`, `wishlist`) already follows the
`models/ controllers/ routes/` subfolder convention consistently — `auth`
and `webAuthn` are no exception, they just weren't documented correctly
before.

**New module confirmed built since last handoff**: `modules/wishlist/`
(model, controller, routes, validation) — matches the frontend status doc's
"Wishlist" section, already fully wired both sides.

---

## ⛔ PAYMENT SYSTEM — explicitly out of scope right now

A Razorpay + Cashfree payment module (adapter pattern, provider-agnostic
orchestrator) was built and tested in an earlier session, but the founder
decided to **stop and exclude payment integration entirely for now**. Do
NOT build or resume payment work unless explicitly asked again. Order model
still has `paymentStatus`/`paymentMethod` fields (COD works fine), just no
online gateway is wired in. (Note: `config/razorpay.js` still exists on disk
from that earlier work — it's dormant, not deleted, per the "don't resume
unless asked" rule.)

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
approach instead is: finish the core transactional loop (auth → shop → product
→ cart → order → logistics — this loop is now functionally complete minus
payment), get a handful of real sellers using it, and only build the heavier
modules (subscriptions, staff accounts, wallet, refunds, analytics, CRM, fraud
protection) once real usage reveals what's actually needed - not from a
speculative spec. Write a short 1-2 page brief per module only right before
building it, not all of them upfront.

**Priority classification agreed on:**

- **Build now/soon**: a _simple_ refund flow (manual/admin-approved, not the
  full automated workflow), a _simple_ wallet ledger (just a transaction log,
  not full withdraw/processing states), real email service
- **Defer until there are real users asking for them**: subscription tiers,
  staff accounts/permissions, reviews, seller analytics dashboards, a full
  notification center (SMS/WhatsApp/push), platform finance/GST reporting,
  admin CRM/disputes, fraud protection
- **Explicitly stopped**: payment gateway integration (see section above)

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
- **Frontend**: Next.js 16 App Router + TypeScript (Turbopack) — see the
  separate frontend status doc, actively being built, most areas ✅ complete

## Folder structure (backend/) — VERIFIED against disk on 2026-08-08

```
backend/
├── index.js
├── PROJECT_HANDOFF.md, README.md
├── config/               cloudinary.js, db.js, razorpay.js (dormant), shiprocket.js, webauthn.js
├── constants/            messages.js, roles.js
├── exceptions/           ApiError.js
├── logs/                 logger.js
├── middleware/            authMiddleware.js, errorHandler.js, httpLogger.js,
│                          rateLimiter.js, upload.js, validate.js
├── modules/
│   ├── admin/             controllers/ (dashboard, order, product, shop, user), routes/admin.routes.js
│   ├── auth/               auth.validation.js, controllers/auth.controller.js,
│   │                       models/auth.model.js, routes/auth.routes.js
│   │                       (⚠️ 2 test files still import old flat path — see UNRESOLVED ISSUE)
│   ├── cart/               cart.validation.js, controllers/, models/, routes/
│   ├── logistics/          logistics.validation.js, controllers/, routes/
│   ├── messagingSystem/    controllers/broadcast + conversation, models/broadcast + conversation
│   │                       + message, routes/broadcast + conversation
│   ├── order/              order.validation.js, controllers/order.create/read/update,
│   │                       models/order.model.js, routes/order.routes.js
│   ├── product/             product.routes.index.js, product.validation.js,
│   │                        controllers/ (create/read/update/delete + Category-controller/),
│   │                        models/ (category.model.js, product.model.js),
│   │                        routes/ (category.routes.js, product.routes.js)
│   ├── shop/                shop.validation.js,
│   │                        controllers/ (create/, hours/, management/, read/, slug/, update/),
│   │                        models/shop.model.js, routes/shop.routes.js
│   ├── upload/              controller/upload.controller.js, models/upload.model.js,
│   │                        routes/upload.routes.js
│   ├── webAuthn/            webauthn.validation.js, controllers/webauthn.controller.js,
│   │                        routes/webauthn.routes.js
│   │                        (separate module, NOT nested inside auth/ — see note above)
│   └── wishlist/            wishlist.validation.js, controllers/, models/, routes/
├── services/               cart.service.js, inventory.service.js, order.service.js,
│                           pricing.service.js, shopHours.service.js, upload.service.js,
│                           webauthn.service.js, logistics/logistics.service.js,
│                           logistics/providers/shiprocketAdapter.js
├── sockets/                emit.js, index.js, io.js, presenceTracker.js
├── tests/
│   ├── modules/             auth.test.js, order.test.js, product.test.js, shop.test.js, upload.test.js
│   ├── services/            cart.service.test.js, inventory.service.test.js,
│   │                        logistics.service.test.js, order.service.test.js,
│   │                        pricing.service.test.js, shopHours.service.test.js
│   └── setup/db.js
└── utils/                  cookieOptions.js, generateToken.js
```

**Note**: `modules/shop/controllers/` has a `management/` subfolder that
wasn't documented in earlier handoffs — check what's in there if working on
shop features (likely admin-adjacent shop management, needs verification).

## Architecture patterns established (follow these for anything new)

1. **Controller vs Service split**: Controllers only handle HTTP (parse req, call
   service/model, send res). Business rules/calculations live in `services/`.
   Services take plain data in, return plain data out — no `req`/`res` — so they're
   directly unit-testable and reusable.
2. **Sub-controllers by concern**: Large modules split controllers into
   `create/read/update/delete` files (or subfolders for shop). Each file has a
   comment-block index at the top listing what's inside.
3. **Every module uses `models/ controllers/ routes/` subfolders** — this is
   now confirmed consistent across all 11 modules (`admin`, `auth`, `cart`,
   `logistics`, `messagingSystem`, `order`, `product`, `shop`, `upload`,
   `webAuthn`, `wishlist`). Don't write new imports assuming a flat structure.
4. **Ownership checks over role checks**: Product/Order routes do NOT gate on
   `authorizeRoles(SELLER)` — they rely on `Shop.findOne({owner: req.user._id})`
   ownership checks inside controllers instead. This was a deliberate fix: role
   gates blocked buyers from ever seeing the friendly "create your shop first"
   message.
5. **Category is referenced by slug in API requests**, not ObjectId — e.g.
   `POST /api/products` body sends `category: "electronics"` (a string slug),
   which the controller looks up via `Category.findOne({slug})`. This applies
   on the frontend too — never `Category.findById(slug)`.
6. **Validation**: Every route wraps its schema with the `validate()` middleware
   from `middleware/validate.js`. Schemas live in `<module>/<module>.validation.js`
   (sibling to routes/controllers, not in a subfolder).
7. **Image upload is decoupled from the resource it belongs to**: frontend uploads
   to a dedicated `/api/upload/*` endpoint first, gets back a `{url, publicId}`,
   then sends that URL as a plain string in the normal JSON body when
   creating/updating a shop or product. Shop/product endpoints stay pure JSON —
   only `modules/upload/` deals with multipart/form-data.
8. **Upload folders are hardcoded server-side per route** (`/api/upload/shop-logo`,
   `/shop-banner`, `/avatar`, `/product-images`), never client-controlled via a
   query param — that was a deliberate security fix (a `?folder=` param would let
   any caller write into any Cloudinary folder).
9. **Passkeys are additive, not a replacement** for password auth — registering
   one requires already being logged in via password first. Login later works
   with either password OR passkey. Lives in its own `modules/webAuthn/` module.
10. **Logistics uses an adapter pattern**: `services/logistics/providers/*Adapter.js`
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
- **NEW (2026-08-08): test files can silently drift from actual folder
  structure** when modules get reorganized into `models/ controllers/ routes/`
  subfolders — always grep/verify test import paths against real file
  locations after any folder restructuring, don't assume they were updated
  automatically.

## Test status

**Confirmed passing as of 2026-08-08: 110/110 tests, 11/11 suites**, ~7s run
time. This includes all modules (auth, shop, product, order, upload, cart,
inventory, pricing, shopHours, logistics) plus the earlier-flagged auth
test-import issue, which turned out to already be fixed (see RESOLVED note
above). `logistics.service.test.js` (7 tests, mocked, guards the
`selectBestCourier` cheapest-vs-unsorted regression) is confirmed running
as part of the full suite, not just in isolation.

Run with `npm test` (uses `mongodb-memory-server`, needs internet on first run to
download the Mongo binary — cached after that).

## What's fully built

- **Auth**: register/login/logout, profile update, change password, role switch
  (buyer↔seller), admin password reset with forced-change flag, self-service
  forgot/reset-password (dev-mode token, needs real email service for prod)
- **Passkeys (WebAuthn)**: register a passkey while logged in, login with a
  passkey (password-free), list/delete registered devices. Uses
  `@simplewebauthn/server` v13. RP_ID/ORIGIN configured via env vars. Lives in
  its own `modules/webAuthn/`, not nested inside `modules/auth/`.
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
- **Wishlist**: model/controller/routes/validation, 5 endpoints — matches
  frontend which already has a full slice + `WishlistButton` + `WishlistPage`
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

1. ~~Payment integration~~ — **explicitly stopped/out of scope, do not resume without being asked again**
2. **Real Shiprocket account verification** — the adapter was written against
   published API docs but never exercised against a live account; do this
   before trusting it with real orders.
3. **Real email service** — needed to make `forgotPassword` production-safe (see
   gotcha above) and to actually notify users generally
4. **Simple refund flow** (manual/admin-approved) and **simple wallet ledger**
   (transaction log only) — agreed as the next "build now" tier
5. **Recovery codes** — companion to Passkeys (backup access if a user loses
   all their devices) but not yet implemented
6. Everything in the "defer until real users ask" tier: subscription plans,
   staff accounts, reviews, seller analytics, full notification center,
   platform finance/GST reports, admin CRM, fraud protection

## Frontend status (Next.js 16, TypeScript, Redux Toolkit)

Frontend is well underway — see the separate
`E-Commerce_Marketplace_Frontend_Status` doc for full detail. Summary: auth,
profile, products, shop, cart, checkout, buyer+seller orders, logistics,
wishlist, seller dashboard, messaging, and full admin panel are all built
and wired. Remaining work: dark-mode migration pass (several components
left), wiring already-built components onto pages that don't use them yet
(WishlistButton→ProductCard, broadcast/chat/delivery-estimate→shop pages),
Category frontend, Notifications center, seller Settings/Shipping pages.

**Housekeeping flagged (2026-08-08)**: three stray duplicate folders exist
under `frontend/features/` — `profile copy 10/`, `profile copy 11/`,
`profile copy 12/` — likely accidental IDE duplicates of `features/profile/`.
Recommend deleting after confirming they're not referenced anywhere
(quick check: `grep -r "profile copy" frontend/ --include="*.tsx" --include="*.ts"`).

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
  (frontend is the sibling `frontend\` folder in the same root)
- I think in product/business terms as much as code terms now (seller
  experience, not just endpoints) — keep giving both the technical "how" and
  the product "why" when it's relevant
- **Payment integration was explicitly stopped mid-build - don't restart it
  unless I bring it up again myself**
- Always verify actual folder structure via PowerShell (`Get-ChildItem
  -Recurse`) before assuming file locations — this handoff doc had drifted
  from reality once already (auth module structure) and it's cheap to re-check
