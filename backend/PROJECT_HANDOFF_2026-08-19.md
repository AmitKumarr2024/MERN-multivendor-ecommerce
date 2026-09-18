# PROJECT CONTEXT — Hybrid Commerce Platform (MERN Multi-Vendor Marketplace)

Paste this entire document at the start of a new chat to continue exactly where I left off.

# PROJECT CONTEXT — Hybrid Commerce Platform (MERN Multi-Vendor Marketplace)

Paste this entire document at the start of a new chat to continue exactly where I left off.

**Last updated:** 2026-09-18. Since the 2026-08-26 handoff, backend work
resumed with a full new module: **Digital Khata (shop-specific buyer
credit ledger)**, plus order-checkout integration for "pay with khata"
and a batch of real bugs found and fixed via the test suite. See below
for full detail. Everything from 2026-08-26 and earlier is otherwise
unchanged and preserved further down.

---

## 🆕 2026-09-18 SESSION — Digital Khata module (backend, built + fully tested) + order integration

### 1. NEW MODULE — Digital Khata / Customer Credit Ledger (backend, built + tested)

**Concept**: shop-specific buyer credit relationship. Buyer applies,
seller approves with a credit limit, buyer can then pay for orders
"on khata" up to that limit. Seller records payments against the
balance. Every transaction is permanent — closing a month never
deletes history, only snapshots + marks settled.

**Backend** — new `modules/khata/`, following the existing
`models/controllers/routes` convention:

- `models/khata.model.js` — one doc per `(shop, buyer)` pair (unique
  compound index) — `status: pending|approved|rejected|suspended`,
  `creditLimit`, `outstandingBalance` (denormalized, same pattern as
  Staff's `ratingAverage`), `availableCredit()`/`isUsable()` instance
  methods
- `models/khataTransaction.model.js` — append-only ledger. `type:
  credit_purchase|payment|adjustment`, signed `amount` (positive =
  credit/purchase, negative = payment), `balanceAfter` snapshot,
  `statementMonth` ("YYYY-MM"), `settledAt` (set on month-close, row
  is NEVER deleted)
- `models/khataSettlement.model.js` — one doc per `(khata,
  statementMonth)` month-close snapshot (opening/closing balance,
  totals) — a record of closure, not a replacement for the
  transactions
- `khata.validation.js` — Zod schemas (apply/approve/reject/suspend/
  credit-limit/payment/statement-query/close-month)
- `services/khata/khata.service.js` — ownership-over-role checks via
  `assertShopOwnership` (same pattern as staff); `writeLedgerEntry()`
  is the **only** place `outstandingBalance` changes, guards against
  going negative; `chargeKhataForOrder()` / `reverseKhataCharge()` are
  the sole entrypoints the order flow calls — never called from
  anywhere else; `canUseKhata()` for checkout-time eligibility;
  `closeMonth()` never deletes transactions, only marks
  `settledAt` + writes a `KhataSettlement`
- `controllers/khata.controller.js`
- `routes/shopKhata.routes.js` (mounted at `/api/shops/:shopId/khata`
  — apply/status/settings/list) and `routes/khata.routes.js` (mounted
  at `/api/khata` — approve/reject/suspend/reactivate/credit-limit/
  payments/transactions/statement/close-month/my) — route-order
  discipline followed
- Wired into `index.js`: `app.use("/api/shops/:shopId/khata",
shopKhataRoutes)` and `app.use("/api/khata", khataRoutes)`
- `Shop.model.js` gained `khataEnabled: { type: Boolean, default:
false }`
- Notifications on request/approve/reject/suspend/payment-recorded via
  `notification.service.js`'s `createNotification()` (same
  `recipient`-field pattern as every other module)

**Order integration** — `services/order.service.js`'s `checkoutCart()`:

- `paymentMethod === "khata"` is the only trigger that ever calls
  `chargeKhataForOrder()` — COD and (future) online payment paths
  never touch the khata service, per the hard business rule
- Khata is rejected up-front for a multi-shop cart (`shopGroups.size >
1`) — credit is shop-specific, so a split multi-vendor checkout has
  no single shop's ledger to charge
- Eligibility (`canUseKhata`) is **re-checked inside checkoutCart**,
  not just trusted from the frontend — last gate before the ledger
  entry and order are actually created
- `Order.paymentStatus` gets a new value `"khata_pending"` for khata
  orders (COD/online unaffected, still `"pending"`)
- On checkout failure partway through a multi-shop cart, the existing
  rollback logic (stock restore + order delete) was extended with a
  parallel `khataChargedForRollback` array → `reverseKhataCharge()` on
  failure, so a khata charge from an earlier successful shop-group in
  the same multi-shop checkout gets correctly reversed too
- `cancelOrder()` also calls `reverseKhataCharge()` when cancelling a
  khata-paid order — writes a compensating **adjustment** transaction
  (never deletes the original `credit_purchase` row), so the ledger
  stays permanent while the balance is corrected

**Tests** — `tests/services/khata.service.test.js` (34 tests) and
`tests/modules/khata.test.js` (6 supertest tests) — both green. 5 new
tests added to the existing `tests/modules/order.test.js` specifically
covering the khata-checkout HTTP path end-to-end (successful purchase
+ matching `KhataTransaction`, insufficient credit rejected,
no-khata-account rejected, multi-shop cart rejected, cancel reverses
the ledger). **Full suite: 15/15 suites, 169/169 tests green.**

**Frontend** — new `features/khata/` — types, `khataSlice`/
`khataSelectors`, buyer components (`KhataApplyCard`, `KhataDashboard`,
`KhataStatementView`, `MyKhatasList`), seller components
(`KhataSettingsToggle`, `KhataRequestsList` with Card/Table toggle +
pagination — same pattern as Staff's list, `KhataDetailPanel`,
`KhataApproveModal`/`KhataRejectModal`/`KhataRecordPaymentModal`/
`KhataCloseMonthModal`), a checkout `KhataPaymentOption`. Wired into:
seller's Shop Dashboard (new "Khata" nav item), the public shop page
(`KhataApplyCard`, always visible whenever a shop has khata enabled —
this is a hard requirement, buyer must always see availability even
before approval), buyer's `/buyer/khata` page, and checkout's payment-
method selector. Seller's `KhataRequestsList` list→detail navigation
is **same-page inline** (not a Modal popup) — a deliberate choice
this session, see gotchas below.

### 2. CRITICAL BUGS FOUND + FIXED (all via the test suite — read before adding a new module that sends notifications or touches Order/payment fields)

- **`Notification.model.js`'s `type` enum did not include the 5 new
  khata notification-type strings** (`khata_request`,
  `khata_approved`, `khata_rejected`, `khata_suspended`,
  `khata_payment_recorded`) — `createNotification()` threw a Mongoose
  `ValidationError` on every khata action, which silently failed the
  **entire** calling service call (e.g. `applyForKhata()` itself
  threw, even though the `Khata` document had already been created).
  **Lesson reinforced (again)**: adding a new notification `type`
  string anywhere requires adding it to the model's enum in the same
  change — this is now the single most common bug class in this repo
  across staff and khata.
- **`Order.model.js`'s `paymentMethod` enum was `["cod", "razorpay"]`
  and `paymentStatus` enum had no `"khata_pending"`** — any khata
  checkout would fail `Order.create()` with a Mongoose validation
  error. Fixed: `paymentMethod: ["cod", "khata"]` — **`"razorpay"` was
  deliberately removed, not just left out**, since no backend
  gateway API exists yet (see payment section below); `paymentStatus`
  gained `"khata_pending"`.
- **`order.validation.js`'s Zod `checkoutSchema` still had
  `paymentMethod: z.enum(["cod", "razorpay"])`** — this is the
  request-body validator that runs **before** the controller, so even
  after the Order model fix, every khata checkout was being rejected
  with a 400 at the validation layer before `checkoutCart()` ever ran.
  This was the last and most subtle of the three payment-method-enum
  bugs to surface, precisely because it fails silently as "just
  another 400" rather than a crash — **any new `PaymentMethod` value
  must be added in three separate places**: `Order.model.js`'s
  `paymentMethod` enum, `order.validation.js`'s `checkoutSchema`, and
  the frontend `order.types.ts`'s `PaymentMethod` type. Missing any
  one of the three produces a different failure mode (500, silent
  400, or a frontend TS error), so grep all three whenever a payment
  method changes.
- **A stray literal `s` character was left at the end of
  `order.validation.js`** after an edit (visible only as `s` on its
  own line after the last export) — crashed the entire test suite
  with `ReferenceError: s is not defined` at module-parse time,
  masquerading as a totally unrelated failure until the file was
  read directly. Lesson: after any edit to a Zod-schema file, do a
  quick visual scan of the very end of the file — a trailing stray
  character breaks module parsing but gives no useful stack trace
  pointing at the actual line's *cause*.

### 3. Backend test-file convention, now confirmed and standardized (applies to all future supertest module tests)

- **Never use `jest.mock()`** for `notification.service.js` or
  anything else in this project's test suite — the project convention
  is to let it run for real; it just `console.log`s
  ("📨 Notification created…" / "❌ emitNotification: io instance is
  null…") and never fails a test. Route-level supertest files
  (`shop.test.js`, `khata.test.js`, `order.test.js`) build their app
  with `express-rate-limit`-related `console.error` noise from
  `middleware/rateLimiter.js`'s `keyGeneratorIpFallback` IPv6
  validation warning — this is pre-existing repo-wide noise, not a
  test failure, ignore it.
- **Never manually build a JWT / cookie with `generateToken` +
  `COOKIE_NAME` in a route-level test.** Use `request.agent(app)`:
  register via the real `POST /api/auth/register` endpoint, the agent
  persists the returned auth cookie automatically, then reuse that
  agent for every subsequent authenticated call. To get a **seller**
  account for a test, register then `POST /api/shops` — there is no
  direct "role: seller" registration; the account is auto-promoted to
  seller only once a shop exists (see `auth.controller.js`'s
  `updateMyRole` comment).
- **When running a single test file directly (not via `npm test`),
  you must still pass the ESM flag** — `npx jest <file>` alone fails
  with `SyntaxError: Cannot use import statement outside a module`,
  because the `--experimental-vm-modules` Node flag lives in the
  `npm test` script, not in Jest's own config. Use `npm test --
<file>` or `node --experimental-vm-modules node_modules/.bin/jest
<file>` directly when isolating a single suite.
- Service-level tests (`khata.service.test.js`, calling `khataService.*`
  functions directly, not through HTTP) are a **different** pattern —
  `User.create()` etc. directly is correct there, since there's no
  HTTP layer to go through. The `request.agent()` rule above applies
  specifically to `tests/modules/*.test.js` files that exercise real
  routes.

---

## ⛔ PAYMENT SYSTEM — still explicitly out of scope, ONE EXCEPTION: Khata

Unchanged for gateway payments. `config/razorpay.js` remains dormant
on disk, not deleted. `"razorpay"` was **actively removed** from
`Order.model.js`'s `paymentMethod` enum and `order.validation.js`'s
`checkoutSchema` this session (it's commented out with an explanatory
note in both, ready to be reintroduced once real gateway work starts —
do not casually re-add it without also wiring an actual gateway).
Khata ("buy now, pay later" shop credit) is **not** a payment gateway —
no external service involved, purely an internal ledger — so it was
in scope and built this session. Do not treat this as reopening the
general payment-gateway freeze.

---

## Corrected folder structure note — UPDATED

Every module (`auth`, `webAuthn`, `shop`, `product`, `cart`, `order`,
`logistics`, `admin`, `messagingSystem`, `upload`, `wishlist`,
`review`, `staff`, **`khata`**) follows the `models/ controllers/
routes/` subfolder convention. `webAuthn` lives in its own module, not
nested inside `auth/`.

---

## What this project actually is — UNCHANGED

**"Seller manages the business. Platform manages the operations."**
See prior handoffs for the full product vision. Nothing about the
product vision changed. Khata (digital credit ledger) fits the "local
commerce" pillar of that vision directly — it's the modern equivalent
of a paper khata book that local Indian shopkeepers already use.

## Tech stack — UNCHANGED

Node.js + Express (ES Modules), MongoDB + Mongoose, JWT in httpOnly
cookie + WebAuthn passkeys, Cloudinary via Multer memory storage,
Shiprocket adapter pattern, Socket.io, Zod validation, express-rate-limit,
Winston + Morgan, Jest + Supertest + mongodb-memory-server. Frontend:
Next.js 16 App Router + TypeScript (Turbopack).

## Folder structure (backend/) — UPDATED


2026-08-26. Since the 2026-08-20 handoff, **no backend
code changed**. This entire session was a frontend-only UI/UX redesign
of the Staff module (Card/Table views, dialog/modal interaction pattern,
several visual bug fixes). See the frontend handoff doc (now v8,
2026-08-26) for full detail. This backend doc is otherwise unchanged
from 2026-08-20 — included below in full for continuity, with a note
at the top of each still-accurate section confirming nothing backend-side
was touched this session.

---

## 🆕 2026-08-26 SESSION — Frontend-only: Staff module UI redesign

**No backend files were created, modified, or deleted this session.**
All work was in `frontend/features/staff/` and `frontend/components/
ui/` (new `Modal.tsx`). See the frontend handoff (`E-Commerce_
Marketplace_Frontend_Status_2026-08-26_v8.md`) for the complete
breakdown: Card/Table view toggle for the seller's staff roster,
Add/Edit/Attendance now open in a shared portal-based dialog instead of
inline expansion, a fixed dropdown-clipping bug in the table's action
menu, a dark-mode token mismatch bug (`bg-primary` doesn't exist in
this project's theme — the correct token is `bg-accent`), and the
public-facing `StaffCard` → `StaffProfileModal` click flow being wired
for the first time (it existed as dead code with no click handler
until this session).

**Why this matters for backend context**: none of the API contracts
changed. `GET /api/shops/:shopId/staff`, `GET /api/staff/:id/public`,
`POST/GET /api/staff/:id/feedback`, `GET/POST /api/staff/:id/attendance`
and all other staff endpoints from the 2026-08-20 session remain
exactly as documented below — this session only changed how the
existing data gets displayed and interacted with in the browser.

**One thing worth backend attention flagged during this session, not
acted on**: the frontend now surfaces `getMonthlyAttendance()`'s
`records[]` array as unused — it's fetched but the UI still only shows
aggregate totals, not a day-by-day view. No backend change needed for
this (the data's already there), just flagging that if a future session
builds the day-by-day calendar, no new endpoint is required.

---

## 🆕 2026-08-20 SESSION — Staff Module + Critical Fixes

### 1. NEW MODULE — Shop Staff / Team Management (backend + frontend, built + tested)

**Concept**: Seller can add staff members to their shop, mark daily
attendance, and buyers can leave ratings/feedback for staff after a
delivered order. No staff login in V1 — 100% seller-controlled.

**Backend** — new `modules/staff/` following the existing
`models/controllers/routes` convention:

- `models/staff.model.js` — `Staff` (name, role, bio, profilePhoto,
  joiningDate, isActive, soft-delete via `removedAt`, denormalized
  `ratingAverage`/`feedbackCount`, instance method
  `getExperienceLabel()`)
- `models/staffAttendance.model.js` — one doc per `(staff, date)`,
  unique compound index, `status: present|absent|leave`
- `models/staffFeedback.model.js` — one doc per `(staff, buyer, order)`,
  unique compound index, buyer-authored, seller cannot modify
- `staff.validation.js` — Zod schemas (create/update/status/attendance/
  monthlyQuery/feedback)
- `services/staff.service.js` (nested at `backend/services/staff/
staff.service.js` — confirmed path this session's predecessor;
  double-check this remains consistent if the repo is ever
  reorganized) — ownership-over-role checks via `assertShopOwnership`,
  soft-delete, `markAttendance` (upsert per day), `getMonthlyAttendance`
  (only counts _marked_ days, not calendar days — avoids penalizing
  staff for a seller who forgot to mark), `checkFeedbackEligibility` +
  `createStaffFeedback` (gated on a real `delivered` order from that
  shop, re-verified server-side at write time not just at eligibility-
  check time), `recomputeStaffRating()` (same denormalization pattern
  as `review.service.js`)
- `controllers/staff.controller.js`, `controllers/attendance.controller.js`,
  `controllers/feedback.controller.js`
- `routes/shopStaff.routes.js` (mounted at `/api/shops/:shopId/staff`)
  and `routes/staff.routes.js` (mounted at `/api/staff`) — route-order
  discipline followed (specific paths before `/:id` catch-all)
- Wired into `index.js`: `app.use("/api/shops/:shopId/staff",
shopStaffRoutes)` and `app.use("/api/staff", staffRoutes)`
- Notification on new feedback → seller only (via
  `notification.service.js`'s `createNotification()`, same call-site
  pattern as every other module — uses `recipient`, not `user`, as the
  field name)

**Tests** — `tests/services/staff.service.test.js` (10 tests) and
`tests/modules/staff.test.js` (4 supertest tests) — **both fully green
after a long debugging pass** (see "Debugging log" below for every
mismatch found and fixed — worth reading if similar errors recur).

**Frontend** — new `features/staff/` — **substantially redesigned in
the 2026-08-26 session above**, but the underlying API contract this
frontend calls is unchanged from what's documented here.

### 2. CRITICAL BUG FOUND + FIXED — `index.js` was connecting to the

real database during tests, likely causing a real data loss incident

**What happened**: `backend/index.js` called `connectDB()`
unconditionally at module top-level, with no `NODE_ENV` guard. An
earlier draft of `tests/modules/staff.test.js` imported `app` directly
from `index.js` (instead of building an isolated test app). Because
`index.js` connects to the **real** `MONGO_URI`
(`mongodb://127.0.0.1:27017/ecommerce`) on **import alone** — not just
on `.listen()` — simply importing it inside a Jest test connected
mongoose to the real database. The test file's own
`afterEach(() => clearTestDB())` then ran `deleteMany({})` across
`mongoose.connection.collections` — whichever connection was actually
active. This is the leading hypothesis (strongly evidenced, not 100%
proven — see investigation notes below) for why the real `ecommerce`
database was found completely empty (`0` documents in `products`,
`shops`, `categories`, `users`) partway through the 2026-08-20 session,
despite the user recalling data being present via Compass the day
before.

**Investigation performed** (for future reference if this resurfaces):

- Confirmed `mongod.cfg`'s `dbPath` has been the same directory since
  May 2024 — ruled out "fresh reinstall" theory
- Searched `mongod.log` for `dropDatabase`/`drop collection` — found
  **zero** such events against the `ecommerce` database ever (the only
  `drop` event in the entire log history was a `School` database, from
  September 2024, an unrelated old practice project)
- This actually **supports** the `deleteMany({})` theory over a
  `dropDatabase()` theory — `clearTestDB()` uses `deleteMany`, which
  does not log as a `drop` command, explaining why the log search came
  up empty despite data genuinely being wiped
- `operationProfiling` was never enabled in `mongod.cfg`, so no
  operation-level audit trail exists to give 100% certainty — this
  remains the best-evidenced explanation, not a confirmed fact

**Fix applied** — `index.js` now guards the real DB connection:

```javascript
if (process.env.NODE_ENV !== "test") {
  connectDB();
}
```

This is now permanent. **Any test file that imports `index.js` directly
will no longer touch the real database.** `staff.test.js` was also
separately rewritten to build its own isolated Express app (mirroring
`shop.test.js`'s `buildTestApp()` pattern) rather than importing
`index.js` — belt-and-suspenders fix.

**⚠️ Action still recommended, still not done as of 2026-08-26**:
enable MongoDB authentication (`security.authorization: enabled` in
`mongod.cfg` + create an admin user + update `MONGO_URI` with
credentials). Currently the local MongoDB instance has **zero
authentication** — confirmed via mongosh's own startup warning ("Access
control is not enabled... unrestricted"). Anyone/anything with access
to the machine can currently connect and modify/delete data with no
password. **This has now gone unaddressed across two sessions
(2026-08-20 and 2026-08-26) — should be the first backend task
whenever backend work resumes.**

**Real data was not recovered.** The local `ecommerce` database was
re-seeded with placeholder demo data (see seed script provided in-chat
on 2026-08-20, still not yet saved to a file in the repo — **should be
saved to `backend/scripts/seed.js`**, still pending as of 2026-08-26).

### 3. BUG FIXED — `validate.js` crashed on any `query`-source validation

**Symptom**: `TypeError: Cannot set property query of #<IncomingMessage>
which has only a getter`, thrown from `middleware/validate.js` on any
route using `validate(schema, "query")` — specifically hit on
`GET /api/staff/:id/attendance?month=&year=`.

**Root cause**: newer Express/Node makes `req.query` a getter-only
property; the old code did `req[source] = result.data` unconditionally,
which works for `body`/`params` (plain writable objects) but throws for
`query`.

**Fix applied**:

```javascript
if (source === "query") {
  Object.keys(req.query).forEach((key) => delete req.query[key]);
  Object.assign(req.query, result.data);
} else {
  req[source] = result.data;
}
```

This mutates the existing `req.query` object in place instead of
reassigning it. Applies project-wide to any future `validate(schema,
"query")` usage, not just the staff attendance route.

### Debugging log — every mismatch found while getting staff tests green

(kept for pattern-recognition if similar errors recur with future new
modules):

- `express-async-handler` was assumed as the async wrapper — wrong,
  project uses a different pattern (resolved by installing the package
  directly rather than chasing the real wrapper name)
- `middleware/upload.js` and `middleware/validate.js` are **default**
  exports, not named — `import upload from ...` / `import validate
from ...`, not `{ upload }` / `{ validate }`
- `Shop.create()` requires `shopName`, not `name`
- `Order.create()` requires `itemsSubtotal` and `grandTotal` (not just
  `totalAmount`) — full required-field list: `buyer`, `shop`, `items`,
  `itemsSubtotal`, `grandTotal`
- `notification.service.js`'s `createNotification()` requires
  `recipient` (not `user`), plus `type`/`title`/`message`
- `services/staff.service.js` ended up at the **nested**
  `services/staff/staff.service.js` path in the user's actual repo
  (not the flat path originally assumed) — all imports were
  standardized to match wherever the file actually landed; **double-
  check this path is consistent project-wide before adding new staff
  sub-features**
- `upload.service.js`'s real export is `uploadImageBuffer(buffer,
folder, uploadedBy)` returning `{ url, publicId }` (not
  `uploadBufferToCloudinary` returning `{ secure_url, public_id }` as
  originally guessed) — also auto-records the `Upload` tracking doc,
  no separate manual step needed
- Test files were initially missing the `connectTestDB`/`clearTestDB`/
  `closeTestDB` lifecycle hooks entirely in one draft — caused
  `MongooseError: Operation buffering timed out`
- **General lesson reinforced**: this project has hit "guessed export
  style/name doesn't match real file" repeatedly (express-async-handler,
  upload.js, validate.js, generateToken.js, cookieOptions.js) — when
  adding any new module that imports shared middleware/utils, grep the
  real file's exports first rather than guessing, to avoid this exact
  multi-round debugging cycle.

---

## ⚠️ CORRECTION — Category (frontend) was wrongly marked "Not Started"

_(unchanged — see 2026-08-19 section below, still accurate, still
unconfirmed whether pages actually render the existing `features/
category/` components — now flagged across 3 sessions)_

---

## ✅ Admin Review Moderation (built 2026-08-19) — unchanged, still accurate

_(see full detail further below, nothing changed since)_

---

## Dark mode migration — reported complete 2026-08-19, still unverified

_(unchanged — still flagged for a spot-check, not done across 3
sessions now)_

---

## ✅ RESOLVED — auth test-import issue (carried over, still resolved)

Earlier handoffs (through 2026-08-08 morning) carried a warning about a
stale-import failure in `cart.service.test.js`/`auth.test.js`. **Verified
resolved on 2026-08-08**, re-confirmed 2026-08-19, re-confirmed
2026-08-20. **No backend tests ran this session (2026-08-26, frontend-
only work)** — last confirmed backend test status remains **124/124
tests, 13/13 suites** from 2026-08-20. See Test Status below.

---

## Corrected folder structure note (carried over, still accurate)

Every module (`auth`, `webAuthn`, `shop`, `product`, `cart`, `order`,
`logistics`, `admin`, `messagingSystem`, `upload`, `wishlist`, `review`,
`staff`) follows the `models/ controllers/ routes/` subfolder
convention. `webAuthn` lives in its own module, not nested inside
`auth/`. Unchanged since 2026-08-20.

---

## ⛔ PAYMENT SYSTEM — still explicitly out of scope

Unchanged. Do NOT build or resume payment work unless explicitly asked
again. `config/razorpay.js` remains dormant on disk, not deleted.

---

## What this project actually is — UNCHANGED

**"Seller manages the business. Platform manages the operations."**
See prior handoffs for the full product vision (local + national
commerce, courier auto-selection, phase 1-3 roadmap). Nothing about the
product vision changed.

### Product strategy note — still holds

The "finish the core loop, get real sellers, build heavier modules only
when usage demands it" approach still stands. Staff Management (backend

- initial frontend) was built 2026-08-20; this session (2026-08-26) was
  purely a UI/UX refinement pass on top of that, not new scope. The
  deferred tier (subscriptions, wallet-beyond-simple-ledger, seller
  analytics, notification center beyond what exists, platform finance/GST,
  admin CRM, fraud protection) is unaffected — still deferred.

## Tech stack — UNCHANGED

Node.js + Express (ES Modules), MongoDB + Mongoose, JWT in httpOnly
cookie + WebAuthn passkeys, Cloudinary via Multer memory storage,
Shiprocket adapter pattern, Socket.io, Zod validation, express-rate-limit,
Winston + Morgan, Jest + Supertest + mongodb-memory-server. Frontend:
Next.js 16 App Router + TypeScript (Turbopack).

## Folder structure (backend/) — UNCHANGED SINCE 2026-08-20

backend/
├── index.js ⚠️ GUARDS connectDB() behind NODE_ENV !== "test" — don't remove
├── PROJECT_HANDOFF.md, README.md
├── config/ cloudinary.js, db.js, razorpay.js (dormant), shiprocket.js, webauthn.js
├── constants/ messages.js, roles.js
├── exceptions/ ApiError.js
├── logs/ logger.js
├── middleware/ authMiddleware.js, errorHandler.js, httpLogger.js,
│ rateLimiter.js, upload.js, validate.js ⚠️ query-source bug fixed 2026-08-20
├── modules/
│ ├── admin/ controllers/ (..., review.controller.js), routes/admin.routes.js
│ ├── auth/ models/, controllers/, routes/, auth.validation.js
│ ├── cart/ models/, controllers/, routes/, cart.validation.js
│ ├── logistics/ controllers/, routes/, logistics.validation.js
│ ├── messagingSystem/ controllers/, models/, routes/
│ ├── notification/ models/, controllers/, routes/
│ ├── order/ models/, controllers/, routes/, order.validation.js
│ ├── product/ product.routes.index.js, product.validation.js, controllers/, models/, routes/
│ ├── review/ models/, controllers/, routes/
│ ├── shop/ controllers/, models/shop.model.js, routes/shop.routes.js
│ ├── staff/ models/ (staff, staffAttendance, staffFeedback),
│ │ controllers/ (staff, attendance, feedback), routes/ (shopStaff, staff),
│ │ staff.validation.js — API contract unchanged since 2026-08-20
│ ├── upload/ controller/, models/, routes/
│ ├── webAuthn/ controllers/, routes/, webauthn.validation.js
│ └── wishlist/ controllers/, models/, routes/, wishlist.validation.js
├── services/ cart.service.js, inventory.service.js, order.service.js,
│ pricing.service.js, shopHours.service.js, upload.service.js,
│ webauthn.service.js, notification.service.js, review.service.js,
│ search.service.js, staff/staff.service.js (nested path, confirmed),
│ logistics/logistics.service.js, logistics/providers/shiprocketAdapter.js
├── sockets/ emit.js, index.js, io.js, presenceTracker.js
├── tests/
│ ├── modules/ auth, order, product, shop, upload, staff.test.js (4 tests, green as of 2026-08-20)
│ ├── services/ cart, inventory, logistics, order, pricing, shopHours,
│ │ staff.service.test.js (10 tests, green as of 2026-08-20)
│ └── setup/db.js
└── utils/ cookieOptions.js, generateToken.js

## Architecture patterns established — UNCHANGED

1–14 from prior handoffs (controller/service split, ownership-over-role
checks, category-by-slug, Zod + `validate()`, notification call-site
centralization, route-order discipline, single-admin-slice pattern,
staff-module rating pattern mirroring reviews). No new patterns
introduced this session (frontend-only).

## Known gotchas already fixed (carried over, still true — don't reintroduce)

_(all prior entries unchanged since 2026-08-20 — connectDB() test
guard, validate.js query-source handling, verify-real-export-style
lesson)_

## Gotchas from the 2026-08-18/19/20 sessions (still true, don't reintroduce)

_(all unchanged — variant-aware inventory functions, `getVariantById`,
review verified-purchase gate, denormalized rating recompute rule,
search fallback tradeoff, `product.routes.index.js` staleness incident,
staff module's rating/eligibility patterns)_

## Test status

**Last confirmed full-suite run: 124/124 tests, 13/13 suites,
2026-08-20.** No backend test run occurred this session (2026-08-26 was
frontend-only). Still needed, unchanged:

- Unit tests for `review.service.js`, `search.service.js`, variant-
  aware `inventory.service.js`/`order.service.js` paths, and
  `admin.review.controller.js`'s `forceDeleteReview` — still zero
  coverage.
- **NEW note**: frontend now also has zero test coverage for the staff
  module specifically (flagged in the frontend handoff) — backend
  staff tests remain solid at 14/14, but nothing validates the new
  Card/Table/Modal UI behavior.

Run with `npm test` (uses `mongodb-memory-server`, needs internet on
first run to download the Mongo binary — cached after that).

## What's fully built

Everything through 2026-08-20 (Shop Staff / Team Management backend +
initial frontend, plus everything from earlier sessions) is unchanged.
**Nothing new was built backend-side this session** — see the
2026-08-26 section at the top for the frontend-only summary.

## What's NOT built yet (roadmap, priority-ordered)

1. ~~Payment integration~~ — still stopped.
2. **Enable MongoDB authentication** — flagged 2026-08-20, still not
   done, now the top backend priority whenever backend work resumes
   (see the data-loss incident section above).
3. **Test coverage for 2026-08-18/19 additions** (variants, reviews,
   search, admin review moderation) — still zero.
4. Real Shiprocket account verification.
5. Real email service for `forgotPassword`.
6. Simple refund flow + simple wallet ledger.
7. Recovery codes for Passkeys.
8. Confirm Category (frontend) wiring — still unconfirmed, 3 sessions.
9. **Staff module — backend has no open items**, but frontend still
   needs: day-by-day attendance calendar grid (backend data already
   supports this, no new endpoint needed), frontend test coverage, and
   a decision on `StaffRosterCard`'s interaction-pattern consistency
   (see frontend handoff section 0/11).
10. Save the demo seed script to `backend/scripts/seed.js` in the repo
    — still not committed to disk, flagged across 2 sessions now.
11. Everything still in the "defer until real users ask" tier
    (subscriptions, seller analytics beyond current, notification
    center beyond current, platform finance/GST, admin CRM, fraud
    protection).

## Frontend status

See the separate `E-Commerce_Marketplace_Frontend_Status` doc, now at
**v8, 2026-08-26** — this session was 100% frontend UI/UX work on the
Staff module (Card/Table views, modal/dialog interaction pattern,
several bug fixes). No backend changes accompanied it.

**Housekeeping still flagged, still not done**: the 3 duplicate
`profile copy N` folders, `features/messaging/components/
Socketprovider.tsx` dead duplicate. `backend/scripts/seed.js` still
not committed.

## My preferred working style (unchanged, still applies)

- Want code changes **actually tested** before being handed over — the
  staff module's backend got this treatment on 2026-08-20; its
  frontend redesign on 2026-08-26 did **not** (zero new tests written
  for the new UI), worth returning to.
- Complete file content when giving me a file to replace, not a diff.
- Explain things in Hinglish (Hindi+English mix), keep it practical.
- Building in `D:\Amit\A Developer\2026 product\full stack project\
E-commerce app\backend` (frontend is the sibling `frontend\` folder).
- Payment integration explicitly stopped — don't restart unless asked.
- Always verify actual folder structure via PowerShell before assuming
  file locations.
- Don't carry forward a ✅/❌ status across handoffs without
  re-verifying in the current session if there's any doubt.
- When debugging an unfamiliar shared file (middleware, util, model,
  or — as of this session — a shared UI component), ask for its real
  content before guessing its shape.
