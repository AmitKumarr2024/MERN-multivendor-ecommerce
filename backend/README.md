# E-commerce App — Backend (MERN, Multi-Vendor Marketplace)

A multi-vendor "Dukan" system where every seller gets their own shop with a unique custom URL. Products from all shops appear on the homepage; clicking a supplier redirects to their shop page. Built with ES Modules, a service layer for business logic, httpOnly-cookie JWT auth, and a full admin module.

## Folder Structure

```
backend/
├── config/
│   └── db.js                          # MongoDB connection
├── constants/
│   ├── roles.js                       # ROLES.BUYER / SELLER / ADMIN
│   └── messages.js
├── exceptions/
│   └── ApiError.js                    # BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError
├── middleware/
│   ├── authMiddleware.js              # protect (cookie/Bearer JWT) + authorizeRoles + banned-user check
│   └── errorHandler.js                # central error handler
├── utils/
│   ├── generateToken.js
│   └── cookieOptions.js               # centralized httpOnly cookie config
├── modules/
│   ├── auth/
│   │   ├── auth.model.js              # User model (bcrypt hashed password)
│   │   ├── auth.controller.js         # register, login, logout, me, updateMe, changePassword
│   │   └── auth.routes.js
│   │
│   ├── shop/
│   │   ├── models/
│   │   │   └── shop.model.js          # slug, address, businessHours, holidayDates, isCurrentlyOpen()
│   │   ├── services/
│   │   │   └── shopHours.service.js   # business-hours validation & update rules
│   │   ├── controllers/
│   │   │   ├── create/shop.create.controller.js
│   │   │   ├── read/shop.read.controller.js
│   │   │   ├── update/shop.update.controller.js
│   │   │   ├── slug/shop.slug.controller.js       # custom dukan URL management
│   │   │   ├── hours/shop.hours.controller.js     # open/close time, holidays
│   │   │   └── management/                        # (placeholder) staff/team - not yet built
│   │   └── routes/shop.routes.js
│   │
│   ├── product/
│   │   ├── models/
│   │   │   ├── product.model.js       # category is now a Category ref, not a string
│   │   │   └── category.model.js      # supports nested categories via `parent`
│   │   ├── services/
│   │   │   ├── pricing.service.js     # effective price, discount %, line-item & order totals
│   │   │   └── inventory.service.js   # stock set/decrement/restore + low-stock rule
│   │   ├── controllers/
│   │   │   ├── product.create.controller.js
│   │   │   ├── product.read.controller.js   # list/detail/by-shop/my-products, all in one file with an index comment
│   │   │   ├── product.update.controller.js # full update, stock (via service), toggle-active
│   │   │   ├── product.delete.controller.js
│   │   │   └── category.controller.js
│   │   └── routes/
│   │       ├── product.routes.js
│   │       └── category.routes.js
│   │
│   └── admin/
│       ├── controllers/
│       │   ├── admin.dashboard.controller.js  # platform-wide stats
│       │   ├── admin.user.controller.js       # list/view users, change role, ban/unban
│       │   ├── admin.shop.controller.js       # list all shops, verify, force toggle
│       │   └── admin.product.controller.js    # list all products, force toggle/delete
│       └── routes/admin.routes.js             # entire module gated by authorizeRoles(ADMIN)
│
├── index.js            # app entry point (ESM)
├── package.json        # "type": "module"
└── .env.example
```

> Folders not yet created: `database/`, `docs/`, `interfaces/`, `jobs/`, `logs/`, `queues/`, `tests/`, `uploads/` — still on the roadmap, see below.

## Architecture Pattern: Controller vs Service

- **Controller** — HTTP only: parse `req`, call a service or model, send `res`. No business rules live here.
- **Service** — pure business logic: validation rules, calculations, decisions. Takes plain data in, returns plain data out — no `req`/`res`. Easily unit-testable and reusable across modules (e.g. `pricing.service.js` will be reused by the future Order/checkout module).

Example: stock updates go through `inventory.service.js`'s `setStock()`, which owns the "can't go negative" and "low-stock threshold" rules — the controller just calls it and returns the result.

## Setup

```bash
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, CLIENT_URL, etc.
npm run dev
```

## Environment Variables (`.env`)

| Variable                                   | Description                                                        |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `PORT`                                     | Server port (default 5000)                                         |
| `NODE_ENV`                                 | `development` / `production` (controls cookie `secure`/`sameSite`) |
| `MONGO_URI`                                | MongoDB connection string                                          |
| `JWT_SECRET`                               | Secret key for signing JWT tokens                                  |
| `JWT_EXPIRES_IN`                           | Token expiry (e.g. `7d`)                                           |
| `COOKIE_EXPIRES_DAYS`                      | httpOnly auth cookie lifetime in days                              |
| `CLIENT_URL`                               | Frontend origin, used for CORS `credentials: true`                 |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`  | Payment gateway (not yet integrated)                               |
| `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` | Courier/shipment API (not yet integrated)                          |

## Authentication

JWT is issued on register/login and set as an **httpOnly cookie** (not returned in the response body, not stored in `localStorage`) — this protects the token from theft via XSS.

- `httpOnly: true` — JavaScript cannot read the cookie at all
- `secure: true` in production — cookie only sent over HTTPS
- `sameSite` — CSRF protection
- `middleware/authMiddleware.js` reads the token from the cookie first, falling back to an `Authorization: Bearer` header (useful for Postman/mobile)
- Logout calls `res.clearCookie()` with matching options
- Banned users (`isActive: false`) are blocked both at login and on every subsequent authenticated request

## Data Models

### User

| Field                 | Type                | Notes                                                 |
| --------------------- | ------------------- | ----------------------------------------------------- |
| name, email, password | String              | password hashed via bcrypt, never returned by default |
| phone                 | String              |                                                       |
| role                  | enum                | `buyer` \| `seller` \| `admin`                        |
| shop                  | ObjectId ref `Shop` | set when user creates a shop                          |
| isActive              | Boolean             | `false` = banned by admin, blocks login               |

### Shop (Dukan)

| Field                      | Type                | Notes                                                                                          |
| -------------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| owner                      | ObjectId ref `User` | one shop per seller                                                                            |
| shopName                   | String              |                                                                                                |
| **slug**                   | String, unique      | custom dukan URL → `/shop/:slug`, auto-generated from shopName if not provided, collision-safe |
| logo, banner, description  | String              |                                                                                                |
| address                    | Object              | street, city, state, pincode, country                                                          |
| contactPhone, contactEmail | String              |                                                                                                |
| **businessHours**          | Object (per day)    | `{ open: "09:00", close: "21:00", isClosed: false }` for each day of week                      |
| **holidayDates**           | [String]            | specific `YYYY-MM-DD` dates the shop is closed                                                 |
| isVerified, isActive       | Boolean             |                                                                                                |

Instance method: `shop.isCurrentlyOpen()` — computes open/closed right now based on business hours + holidays.

### Category (new)

| Field           | Type                    | Notes                                              |
| --------------- | ----------------------- | -------------------------------------------------- |
| name            | String, unique          |                                                    |
| slug            | String, unique          | auto-generated                                     |
| parent          | ObjectId ref `Category` | supports nested categories (Electronics → Mobiles) |
| image, isActive |                         |                                                    |

### Product

| Field                | Type                    | Notes                                    |
| -------------------- | ----------------------- | ---------------------------------------- |
| shop                 | ObjectId ref `Shop`     |                                          |
| name, description    | String                  | text-indexed for search                  |
| category             | ObjectId ref `Category` | no longer a free-text string             |
| price, discountPrice | Number                  |                                          |
| images               | [String]                |                                          |
| stock                | Number                  | managed via `inventory.service.js`       |
| weightKg             | Number                  | used later for shipment rate calculation |

## API Endpoints

### Auth (`/api/auth`)

| Method | Route              | Access  | Description                                 |
| ------ | ------------------ | ------- | ------------------------------------------- |
| POST   | `/register`        | Public  | Register as buyer or seller                 |
| POST   | `/login`           | Public  | Login, sets httpOnly JWT cookie             |
| POST   | `/logout`          | Private | Clears the auth cookie                      |
| GET    | `/me`              | Private | Get logged-in user's profile                |
| PUT    | `/me`              | Private | Update name/phone                           |
| PUT    | `/change-password` | Private | Change password (requires current password) |

### Shop (`/api/shops`)

| Method | Route               | Access  | Description                                                                     |
| ------ | ------------------- | ------- | ------------------------------------------------------------------------------- |
| GET    | `/`                 | Public  | List all active shops (search, pagination)                                      |
| GET    | `/slug-check/:slug` | Public  | Check custom URL availability before submitting                                 |
| GET    | `/me`               | Private | Get own shop                                                                    |
| POST   | `/`                 | Private | Create shop (auto sets role to seller)                                          |
| PUT    | `/me`               | Private | Update shop details                                                             |
| PUT    | `/me/slug`          | Private | Change custom dukan URL                                                         |
| PATCH  | `/me/toggle-active` | Private | Hide/show own dukan                                                             |
| PUT    | `/me/hours`         | Private | Update business hours                                                           |
| PATCH  | `/me/holidays`      | Private | Add/remove a holiday date                                                       |
| GET    | `/:slug`            | Public  | **Dukan page** — where supplier clicks redirect to (includes computed `isOpen`) |
| GET    | `/:slug/is-open`    | Public  | Lightweight open/closed check                                                   |

### Product (`/api/products`)

| Method | Route                | Access           | Description                                                                   |
| ------ | -------------------- | ---------------- | ----------------------------------------------------------------------------- |
| GET    | `/`                  | Public           | Homepage feed — filter (category/price), search, **sort**, pagination         |
| GET    | `/me`                | Private (seller) | Seller's own products (dashboard)                                             |
| GET    | `/shop/:slug`        | Public           | All products of one specific dukan                                            |
| GET    | `/:id`               | Public           | Single product detail (includes computed `effectivePrice`, `discountPercent`) |
| POST   | `/`                  | Private (seller) | Add product                                                                   |
| PUT    | `/:id`               | Private (seller) | Update own product                                                            |
| PATCH  | `/:id/stock`         | Private (seller) | Dedicated stock update (via inventory service)                                |
| PATCH  | `/:id/toggle-active` | Private (seller) | Show/hide product from storefront                                             |
| DELETE | `/:id`               | Private (seller) | Delete own product                                                            |

### Category (`/api/categories`)

| Method | Route  | Access          | Description         |
| ------ | ------ | --------------- | ------------------- |
| GET    | `/`    | Public          | List all categories |
| POST   | `/`    | Private (admin) | Create category     |
| PUT    | `/:id` | Private (admin) | Update category     |
| DELETE | `/:id` | Private (admin) | Delete category     |

### Admin (`/api/admin`) — entire module requires role `admin`

| Method | Route                         | Description                                      |
| ------ | ----------------------------- | ------------------------------------------------ |
| GET    | `/dashboard`                  | Platform-wide stats (users, shops, products)     |
| GET    | `/users`                      | List all users (filter by role, search)          |
| GET    | `/users/:id`                  | User detail                                      |
| PUT    | `/users/:id/role`             | Change a user's role                             |
| PATCH  | `/users/:id/ban`              | Ban/unban a user                                 |
| GET    | `/shops`                      | List **all** shops including inactive/unverified |
| PATCH  | `/shops/:id/verify`           | Mark a shop as verified                          |
| PATCH  | `/shops/:id/toggle-active`    | Force hide/show any shop                         |
| GET    | `/products`                   | List all products across all shops               |
| PATCH  | `/products/:id/toggle-active` | Force hide/show any product                      |
| DELETE | `/products/:id`               | Permanently delete any product                   |

## Key Flow: Supplier → Dukan Redirect

1. Homepage calls `GET /api/products` — each product includes `shop: { shopName, slug, logo }`.
2. Frontend renders the supplier's logo/name on the product card.
3. On click, frontend navigates to `/shop/:slug`, which calls `GET /api/shops/:slug` to render that seller's public dukan page (now also shows if the shop is currently open).
4. Sellers can also share their dukan URL (`yourapp.com/shop/their-slug`) directly anywhere (WhatsApp, Instagram, etc.) — no login required for buyers to view it.

## Roadmap (Not Yet Built)

- [ ] Order module (cart, checkout, order history) — will reuse `pricing.service.js` and `inventory.service.js`
- [ ] Payment integration (Razorpay)
- [ ] Shipment module — Shiprocket API integration (multi-courier selection: Delhivery, Bluedart, DTDC, Ekart, etc.)
- [ ] Seller dashboard endpoints (orders, earnings, shipment status updates)
- [ ] Staff/team management (`modules/shop/controllers/management/` placeholder already reserved)
- [ ] Image upload (Multer / cloud storage)
- [ ] Geo-location / nearby shop search
- [ ] Frontend (React) — Home, Shop page, Product detail, Seller dashboard, Checkout
- [ ] Rate limiting, input validation library (Joi/Zod), Winston logging, tests

## Error Handling

All controllers throw custom errors from `exceptions/ApiError.js` (`BadRequestError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`), caught centrally by `middleware/errorHandler.js` for consistent JSON error responses.
