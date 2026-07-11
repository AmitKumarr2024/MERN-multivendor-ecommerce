# PROJECT CONTEXT — MERN Multi-Vendor E-commerce Marketplace

Paste this entire document at the start of a new chat to continue exactly where I left off.

## What this project is

A multi-vendor "Dukan" marketplace (like a mini Amazon/Flipkart). Every seller gets
their own shop with a **custom URL** (`/shop/:slug`). Products from all shops show
on the homepage; clicking the supplier/logo redirects to that seller's public shop
page. Sellers manage orders, chat with buyers, post offers; admin has full platform
control; buyers add to cart, checkout, chat, cancel orders.

## Tech stack

- **Backend**: Node.js + Express, ES Modules (`"type": "module"` in package.json)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT stored in an **httpOnly cookie** (not localStorage) — protects
  against XSS token theft
- **Real-time**: Socket.io (chat, typing indicators, online presence, order
  notifications, broadcasts)
- **Validation**: Zod
- **Rate limiting**: express-rate-limit (auto-disabled in test env)
- **Logging**: Winston (files) + Morgan (HTTP requests)
- **Testing**: Jest + Supertest + mongodb-memory-server (in-memory DB for tests)
- **Frontend**: Not started yet — will be Next.js

## Folder structure (backend/)

```
backend/
├── config/              db.js, logger.js
├── constants/           roles.js, messages.js
├── exceptions/          ApiError.js (BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError)
├── middleware/           authMiddleware.js, errorHandler.js, httpLogger.js, validate.js, rateLimiter.js
├── services/             CENTRALIZED — pricing.service.js, inventory.service.js, cart.service.js,
│                         order.service.js, shopHours.service.js
│                         (business logic lives here, NOT in controllers)
├── sockets/              io.js, index.js, emit.js, presenceTracker.js
├── modules/
│   ├── auth/             auth.model.js, auth.controller.js, auth.routes.js, auth.validation.js
│   ├── shop/
│   │   ├── models/shop.model.js
│   │   └── controllers/  create/, read/, update/, slug/, hours/ (each in its own subfolder)
│   │   └── routes/shop.routes.js, shop.validation.js
│   ├── product/
│   │   ├── models/       product.model.js, category.model.js
│   │   └── controllers/  product.create/read/update/delete.controller.js, category.controller.js
│   │   └── routes/       product.routes.js, category.routes.js, product.validation.js
│   ├── cart/              cart.model.js, cart.controller.js, cart.routes.js, cart.validation.js
│   ├── order/             order.model.js, order.create/read/update.controller.js,
│   │                      order.routes.js, order.validation.js
│   ├── admin/             admin.user/shop/product/order/dashboard.controller.js, admin.routes.js
│   └── messagingSystem/   conversation + broadcast (models, controllers, routes)
├── tests/
│   ├── services/          pricing, inventory, shopHours, cart.service, order.service (unit/service-level)
│   ├── modules/            auth, shop, product, order (HTTP integration tests via Supertest)
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

## Known gotchas already fixed (don't reintroduce these)

- `middleware/validate.js` must default `req[source] ?? {}` before parsing —
  otherwise an all-optional schema still rejects a genuinely empty/bodyless request.
- `middleware/validate.js` must use `result.error.issues` (not `.errors`) —
  `.errors` is a version-dependent alias in Zod and can be undefined, crashing
  validation into a 500 instead of a clean 400.
- Rate limiters (`authLimiter`, `apiLimiter`) must `skip: () => process.env.NODE_ENV === "test"`
  so the test suite (which fires many rapid requests) doesn't get blocked. Jest
  sets `NODE_ENV=test` automatically.
- Services are centralized at `backend/services/` (not nested per-module) —
  watch relative import depth (`../exceptions/ApiError.js`, not `../../../`).
- `Order.service.js`'s checkout does a **manual best-effort rollback** (not a real
  Mongo transaction) — restores stock and deletes partial orders if a multi-shop
  checkout fails partway through. This is intentionally not using
  `mongoose.startSession()` since it assumes a single-instance MongoDB. Upgrade
  to transactions if moving to a replica set.

## Test status: 89/89 passing, 9/9 suites passing

Run with `npm test` (uses `mongodb-memory-server`, needs internet on first run to
download the Mongo binary — cached after that).

## What's fully built and tested

- Auth: register/login/logout, profile update, change password, role switch
  (buyer↔seller), admin password reset with forced-change flag
- Shop: CRUD, custom slug/URL with collision-safe auto-increment, business hours
  - holidays with `isCurrentlyOpen()` computed field, verify (admin)
- Product: CRUD, categories (nested via `parent`), stock management, computed
  pricing (`effectivePrice`, `discountPercent`), search/filter/sort/pagination
- Cart: add/update/remove items, stock validation before adding
- Order: checkout (splits multi-vendor cart into one order per shop), rollback
  on partial failure, cancel (restores stock), status updates, real-time
  notifications to buyer/seller via Socket.io
- Admin: full control over users (ban, role, password reset), shops (verify,
  force-toggle), products (force-toggle, force-delete), orders (view-all,
  force-delete with safety rules), dashboard stats
- Messaging: buyer↔seller chat (conversations + messages), shop offer broadcasts,
  admin platform-wide toast broadcasts — all real-time via Socket.io with typing
  indicators and online presence
- Security: httpOnly cookies, Zod input validation on every route, rate limiting,
  Winston/Morgan logging

## What's NOT built yet (roadmap)

1. **Payment integration (Razorpay)** — `paymentStatus` field exists on Order but
   nothing updates it from a real gateway yet
2. **Shipment/courier integration (Shiprocket)** — `shipment` field (courierName,
   trackingId, status) exists as a placeholder on Order model; seller should be
   able to pick from multiple couriers — this was the original core requirement
3. Image upload (Cloudinary/Multer) — currently just accepts image URL strings
4. Coupon/discount codes
5. Forgot-password email flow (currently only admin-initiated reset exists)
6. Frontend (Next.js) — not started

## My preferred working style (for the new chat to follow)

- I want code changes **actually tested** before being handed to me, not just
  "should work" — use `node --check` for syntax and real `import()` resolution
  checks, or run the actual test suite when possible
- When giving me a file to replace, give the **complete file content**, not a
  diff — I've had issues with partial pastes causing my local files to drift
  out of sync
- Explain things in Hinglish (Hindi+English mix), keep it practical
- I'm building this in `D:\Amit\A Developer\2026 product\full stack project\E-commerce app\backend`
