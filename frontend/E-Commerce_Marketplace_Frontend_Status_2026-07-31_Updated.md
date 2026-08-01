# E-Commerce Marketplace Frontend — Development Status

> **Last updated:** 2026-07-31
> **Purpose:** Living frontend handoff + date-wise progress tracker.
>
> Update this document whenever a feature is created, changed, fixed, tested, or planned.

---

## 1. Project Snapshot

| Item             | Current State                                                                 |
| ---------------- | ----------------------------------------------------------------------------- |
| Application      | Multi-vendor e-commerce marketplace                                           |
| Frontend         | Next.js 16 App Router + TypeScript                                            |
| Styling          | Tailwind CSS                                                                  |
| State Management | Redux Toolkit                                                                 |
| HTTP Client      | Axios                                                                         |
| Authentication   | HttpOnly JWT cookie + Redux auth state                                        |
| Passkeys         | WebAuthn / SimpleWebAuthn foundation                                          |
| Theme            | Light / Dark / System                                                         |
| Interfaces       | Buyer, Seller, Admin                                                          |
| Architecture     | Feature-based frontend + App Router route/layout layer                        |
| Current focus    | Shop module completion, public marketplace, seller shop management foundation |

---

## 2. Status Legend

| Status            | Meaning                              |
| ----------------- | ------------------------------------ |
| ✅ Complete       | Implemented and usable               |
| 🟡 In Progress    | Currently being developed            |
| 🟠 Partial        | Foundation exists; more work remains |
| ⏳ Planned        | Decided but not implemented          |
| 🧪 Needs Testing  | Implemented but needs verification   |
| 🐞 Issue          | Known unresolved problem             |
| 🔁 Refactor Later | Works but should later be improved   |
| ❌ Not Started    | No implementation yet                |

---

## 3. Master Progress Tracker

|   # | Area                      | Status              | What Exists Now                                                                                     | Next Action                           |
| --: | ------------------------- | ------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------- |
|   1 | Next.js project           | ✅ Complete         | App Router frontend                                                                                 | Maintain                              |
|   2 | TypeScript                | ✅ Complete         | Type-safe architecture                                                                              | Maintain                              |
|   3 | Tailwind CSS              | ✅ Complete         | Responsive/theme styling                                                                            | Maintain                              |
|   4 | Root layout               | ✅ Complete         | Fonts, metadata, providers                                                                          | Maintain                              |
|   5 | Theme system              | ✅ Complete         | Light/Dark/System                                                                                   | Add toggle if needed                  |
|   6 | Redux store               | ✅ Complete         | `makeStore()` architecture                                                                          | Add reducers gradually                |
|   7 | Redux Provider            | ✅ Complete         | Stable store instance using `useRef`                                                                | Maintain                              |
|   8 | Typed Redux hooks         | ✅ Complete         | Typed dispatch/selectors                                                                            | Maintain                              |
|   9 | Axios/API layer           | ✅ Complete         | Centralized Axios instance (`lib/api.ts`) with shared base URL, credentials, and JSON configuration | Maintain                              |
|  10 | Authentication Redux      | ✅ Complete         | Auth slice/selectors                                                                                | Regression testing                    |
|  11 | Auth persistence          | ✅ Complete         | Cookie → `/api/auth/me` → Redux                                                                     | Test expiry/401                       |
|  12 | Auth initialization       | ✅ Complete         | Predictable auth initialization                                                                     | Maintain                              |
|  13 | Registration              | ✅ Complete         | Buyer registration                                                                                  | Test/validation                       |
|  14 | Login                     | ✅ Complete         | Email/password login                                                                                | E2E test                              |
|  15 | Forgot password           | 🟠 Partial          | Frontend flow                                                                                       | E2E test                              |
|  16 | Reset password            | 🟠 Partial          | Frontend flow                                                                                       | E2E test                              |
|  17 | Passkey backend           | 🟠 Partial          | Register/login/list/delete                                                                          | Device testing                        |
|  18 | Passkey frontend          | 🟠 Partial          | Redux/settings integration                                                                          | E2E testing                           |
|  19 | Passkey Security settings | 🟠 Partial          | Add/manage passkey foundation                                                                       | Test authenticator flows              |
|  20 | Toasts                    | ✅ Complete         | Global feedback                                                                                     | Reuse                                 |
|  21 | Auth layout               | ✅ Complete         | Responsive auth shell                                                                               | Maintain                              |
|  22 | Navbar                    | ✅ Complete         | Responsive auth/role-aware Navbar                                                                   | Real counts later                     |
|  23 | Navbar hydration safety   | ✅ Complete         | Stable server/client initial markup                                                                 | Regression test                       |
|  24 | Account dropdown          | ✅ Complete         | Profile/orders/wishlist/logout                                                                      | Extend later                          |
|  25 | Navbar Avatar             | ✅ Complete         | Initials-based reusable Avatar                                                                      | Image later if backend supports       |
|  26 | Logout                    | 🧪 Needs Testing    | Backend/Redux action wired                                                                          | Verify cookie clearing                |
|  27 | Footer                    | ✅ Initial Complete | Marketplace footer                                                                                  | Real links later                      |
|  28 | Common Sidebar            | ✅ Complete         | Reusable role-independent sidebar                                                                   | Mobile Drawer                         |
|  29 | Buyer feature namespace   | ✅ Complete         | `features/buyer`                                                                                    | Add only buyer-specific UI            |
|  30 | Buyer Sidebar             | ✅ Complete         | Profile/Orders/Wishlist/Addresses                                                                   | Mobile Drawer                         |
|  31 | Buyer layout              | ✅ Foundation       | Header + Sidebar + content                                                                          | Route protection/mobile               |
|  32 | Shared profile feature    | 🟠 Partial          | Reusable ProfilePage/store/types foundation                                                         | Complete editable profile             |
|  33 | Buyer profile             | 🟠 Partial          | `/profile` foundation                                                                               | Complete/test                         |
|  34 | Seller profile            | 🟠 Partial          | `/seller/profile` foundation                                                                        | Complete/test                         |
|  35 | Seller Sidebar            | ✅ Complete         | Seller navigation                                                                                   | Keep routes aligned                   |
|  36 | Seller layout             | ✅ Foundation       | Shared sidebar/content layout                                                                       | Mobile/route protection               |
|  37 | Seller dashboard          | 🟠 Partial          | Dashboard foundation                                                                                | Real data                             |
|  38 | Seller shop               | 🟠 Partial          | Seller shop CRUD, Redux, routing foundation                                                         | Public shop pages & testing           |
|  39 | Public Shop Marketplace   | 🟠 Partial          | `/shop`, shop Redux, shop types, selectors, list fetch foundation                                   | Individual shop page, filters, search |
|  40 | Homepage shell            | ✅ Complete         | Navbar + main + Footer                                                                              | Dynamic sections                      |
|  41 | Global loading/error/404  | ✅ Complete         | Global route states                                                                                 | Maintain                              |
|  42 | UI primitives             | ✅ Initial Complete | 14 reusable UI components                                                                           | Adopt incrementally                   |
|  43 | Product                   | ❌ Not Started      | Directory exists                                                                                    | Build API/store/UI                    |
|  44 | Category                  | ❌ Not Started      | Directory exists                                                                                    | Build integration                     |
|  45 | Cart                      | ❌ Not Started      | Directory exists                                                                                    | Build                                 |
|  46 | Wishlist                  | ❌ Not Started      | Directory/navigation exists                                                                         | Build                                 |
|  47 | Orders                    | ❌ Not Started      | Directory/routes planned                                                                            | Build                                 |
|  48 | Search                    | 🟠 Partial          | Navbar query routing                                                                                | Results/API                           |
|  49 | Seller onboarding         | ⏳ Planned          | Architecture decided                                                                                | Build                                 |
|  50 | Admin dashboard           | ❌ Not Started      | Namespace exists                                                                                    | Later                                 |
|  51 | Logistics frontend        | ❌ Not Started      | Namespace exists                                                                                    | After orders                          |
|  52 | Payments frontend         | ❌ Not Started      | Namespace exists                                                                                    | Checkout                              |
|  53 | Messaging                 | ❌ Not Started      | Namespace exists                                                                                    | Later                                 |
|  54 | Notifications             | ❌ Not Started      | Namespace exists                                                                                    | Later                                 |

---

## 4. Current Architecture

```text
frontend/
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── passkey/
│   │   ├── register/
│   │   ├── reset-password/
│   │   └── layout.tsx
│   ├── (buyer)/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── admin/
│   ├── chat/
│   ├── seller/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── shop/
│   │   └── layout.tsx
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── common/
│   │   ├── Breadcrumb.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Logo.tsx
│   │   ├── Navbar.tsx
│   │   ├── OfferBadge.tsx
│   │   ├── ProductCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── Sidebar.tsx
│   ├── layouts/
│   │   └── AuthLayout.tsx
│   └── ui/
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Dialog.tsx
│       ├── Drawer.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Pagination.tsx
│       ├── Select.tsx
│       ├── Skeleton.tsx
│       ├── Spinner.tsx
│       ├── Table.tsx
│       └── Tabs.tsx
├── features/
│   ├── admin/
│   ├── auth/
│   ├── buyer/
│   │   └── components/
│   │       └── BuyerSidebar.tsx
│   ├── cart/
│   ├── category/
│   ├── home/
│   ├── logistics/
│   ├── messaging/
│   ├── notification/
│   ├── order/
│   ├── payment/
│   ├── product/
│   ├── profile/
│   │   ├── components/
│   │   │   └── ProfilePage.tsx
│   │   ├── store/
│   │   └── types/
│   ├── search/
│   ├── seller/
│   │   └── components/
│   │       └── SellerSidebar.tsx
│   ├── shop/
│   ├── upload/
│   └── wishlist/
├── hooks/
├── lib/
├── providers/
├── services/
├── store/
├── types/
└── utils/
```

---

## 5. Authentication & Passkey Tracker

| Feature              | Status          | Current Behavior                        | Remaining                         |
| -------------------- | --------------- | --------------------------------------- | --------------------------------- |
| Login                | ✅              | Password login updates Redux            | E2E                               |
| Register             | ✅              | Buyer registration                      | E2E                               |
| Refresh persistence  | ✅ Architecture | `/api/auth/me` restores Redux           | Expiry testing                    |
| Logout               | 🧪              | Action exists                           | Verify cookie + Redux clear       |
| Forgot password      | 🟠              | Form exists                             | Backend email test                |
| Reset password       | 🟠              | Form exists                             | Token-state testing               |
| Passkey registration | 🟠              | Backend/frontend foundation             | Real authenticator test           |
| Passkey login        | 🟠              | Verify flow issues JWT                  | Ensure UI updates without refresh |
| List passkeys        | 🟠              | API/state foundation                    | UI/E2E                            |
| Delete passkey       | 🟠              | API/state foundation                    | UI/E2E                            |
| Security settings    | 🟠              | Add/manage passkey location established | Finish                            |

### Session lifecycle

```text
LOGIN / PASSKEY LOGIN
        ↓
Backend authenticates
        ↓
HttpOnly JWT cookie
        ↓
Redux receives user
        ↓
Authenticated UI

REFRESH
   ↓
Redux starts predictable
   ↓
AuthInitializer
   ↓
GET /api/auth/me
   ↓
Backend validates cookie
   ↓
Redux user restored
```

### Passkey lifecycle

```text
Logged-in user
    ↓
Profile / Security
    ↓
Add Passkey
    ↓
GET /api/auth/passkey/register/options
    ↓
Windows Hello / browser authenticator
    ↓
POST /api/auth/passkey/register/verify
    ↓
Credential saved

Future login
    ↓
POST /api/auth/passkey/login/options
    ↓
Authenticator signs challenge
    ↓
POST /api/auth/passkey/login/verify
    ↓
JWT cookie + authenticated user
```

### Passkey API

| Method | Endpoint                             | Purpose                  |
| ------ | ------------------------------------ | ------------------------ |
| GET    | `/api/auth/passkey/register/options` | Registration options     |
| POST   | `/api/auth/passkey/register/verify`  | Save verified credential |
| POST   | `/api/auth/passkey/login/options`    | Login options            |
| POST   | `/api/auth/passkey/login/verify`     | Verify login + issue JWT |
| GET    | `/api/auth/passkey`                  | List credentials         |
| DELETE | `/api/auth/passkey/:credentialId`    | Remove credential        |

---

## 6. Hydration Fix Architecture

The Navbar hydration error was caused by server and first client render producing different auth-dependent markup.

```text
Server render
    ↓
Predictable initial Redux/auth markup
    ↓
Client first render matches server
    ↓
Hydration completes
    ↓
Auth initialization resolves
    ↓
Real account/guest UI
```

| Fix                                                | Status |
| -------------------------------------------------- | ------ |
| `makeStore()` instead of shared provider singleton | ✅     |
| `ReduxProvider` uses stable `useRef` store         | ✅     |
| Auth initialization state                          | ✅     |
| Navbar stable initial markup                       | ✅     |
| Wishlist/account mismatch addressed                | ✅     |
| Regression testing                                 | 🧪     |

---

## 7. Route Tracker

### Auth

| URL                | Purpose            | Status |
| ------------------ | ------------------ | ------ |
| `/login`           | Login              | ✅     |
| `/register`        | Buyer registration | ✅     |
| `/forgot-password` | Reset request      | 🟠     |
| `/reset-password`  | Set new password   | 🟠     |
| `/passkey`         | Passkey login      | 🟠     |

### Buyer

`(buyer)` is a route group and does not appear in the URL.

| URL             | Purpose          | Status        |
| --------------- | ---------------- | ------------- |
| `/`             | Storefront       | ✅ Foundation |
| `/profile`      | Personal profile | 🟠            |
| `/orders`       | Buyer orders     | ⏳            |
| `/wishlist`     | Wishlist         | ⏳            |
| `/addresses`    | Addresses        | ⏳            |
| `/cart`         | Cart             | ⏳            |
| `/products`     | Products         | ⏳            |
| `/category`     | Categories       | ⏳            |
| `/search?q=...` | Search           | 🟠            |

### Seller

| URL                       | Purpose          | Status |
| ------------------------- | ---------------- | ------ |
| `/seller/register`        | Onboarding       | ⏳     |
| `/seller/dashboard`       | Dashboard        | 🟠     |
| `/seller/profile`         | Personal profile | 🟠     |
| `/seller/shop`            | Shop management  | 🟠     |
| `/seller/products`        | Products         | ⏳     |
| `/seller/products/create` | Add product      | ⏳     |
| `/seller/orders`          | Orders           | ⏳     |
| `/seller/inventory`       | Inventory        | ⏳     |
| `/seller/shipping`        | Shipping         | ⏳     |
| `/seller/payments`        | Payments         | ⏳     |
| `/seller/analytics`       | Analytics        | ⏳     |
| `/seller/settings`        | Settings         | ⏳     |

### Admin

| URL                 | Purpose    | Status |
| ------------------- | ---------- | ------ |
| `/admin/dashboard`  | Dashboard  | ⏳     |
| `/admin/users`      | Users      | ⏳     |
| `/admin/shops`      | Shops      | ⏳     |
| `/admin/products`   | Products   | ⏳     |
| `/admin/categories` | Categories | ⏳     |
| `/admin/orders`     | Orders     | ⏳     |
| `/admin/settings`   | Settings   | ⏳     |

---

## 8. Profile Architecture

`authSlice` and the Profile feature have different responsibilities.

| Concern                       | Auth          | Profile                  |
| ----------------------------- | ------------- | ------------------------ |
| Logged-in identity            | ✅            | Consumes                 |
| Session/login/logout          | ✅            | ❌                       |
| Role                          | ✅            | Consumes                 |
| Editable profile UI           | ❌            | ✅                       |
| Profile update loading/errors | ❌            | ✅                       |
| Change password UI            | Auth API      | ✅ Security UI           |
| Passkey management UI         | Passkey state | ✅ Security UI           |
| Seller shop/business info     | ❌            | ❌ — seller/shop feature |

Shared profile:

```text
features/profile/
       ↓
Reusable personal profile
       ↓
Buyer: /profile
Seller: /seller/profile
Admin: future personal-profile route
```

Existing account APIs:

| Method | Endpoint                    | Purpose                     |
| ------ | --------------------------- | --------------------------- |
| GET    | `/api/auth/me`              | Current user                |
| PUT    | `/api/auth/me`              | Update user                 |
| PUT    | `/api/auth/change-password` | Password change             |
| PUT    | `/api/auth/role`            | Role update where permitted |
| POST   | `/api/auth/logout`          | Logout                      |

---

## 9. Sidebar Architecture

```text
components/common/Sidebar.tsx
             │
      ┌──────┴──────┐
      ↓             ↓
BuyerSidebar   SellerSidebar
      ↓             ↓
Buyer layout   Seller layout
```

| Layer               | Responsibility                           |
| ------------------- | ---------------------------------------- |
| `Sidebar.tsx`       | UI, active route, badges, disabled state |
| `BuyerSidebar.tsx`  | Buyer menu                               |
| `SellerSidebar.tsx` | Seller menu                              |
| Layout              | Position sidebar + render `{children}`   |
| `Drawer.tsx`        | Future mobile sidebar                    |

Buyer menu:

| Item      | Route        |
| --------- | ------------ |
| Profile   | `/profile`   |
| Orders    | `/orders`    |
| Wishlist  | `/wishlist`  |
| Addresses | `/addresses` |

Seller menu:

| Item        | Route                     |
| ----------- | ------------------------- |
| Dashboard   | `/seller/dashboard`       |
| Products    | `/seller/products`        |
| Add Product | `/seller/products/create` |
| Orders      | `/seller/orders`          |
| Inventory   | `/seller/inventory`       |
| Shipping    | `/seller/shipping`        |
| Payments    | `/seller/payments`        |
| Analytics   | `/seller/analytics`       |
| Shop        | `/seller/shop`            |
| Profile     | `/seller/profile`         |
| Settings    | `/seller/settings`        |

---

## 10. UI Primitive Library

| Component        | Status | Use                             |
| ---------------- | ------ | ------------------------------- |
| `Avatar.tsx`     | ✅     | Navbar/Profile/Chat             |
| `Badge.tsx`      | ✅     | Role/order/payment/stock status |
| `Button.tsx`     | ✅     | Actions/forms                   |
| `Card.tsx`       | ✅     | Dashboard/profile/sections      |
| `Dialog.tsx`     | ✅     | Confirm destructive actions     |
| `Drawer.tsx`     | ✅     | Mobile sidebar/cart/filter      |
| `Input.tsx`      | ✅     | Forms                           |
| `Modal.tsx`      | ✅     | Generic overlay                 |
| `Pagination.tsx` | ✅     | Listings                        |
| `Select.tsx`     | ✅     | Category/status/sorting         |
| `Skeleton.tsx`   | ✅     | Loading                         |
| `Spinner.tsx`    | ✅     | Async actions                   |
| `Table.tsx`      | ✅     | Seller/admin data               |
| `Tabs.tsx`       | ✅     | Profile/settings/details        |

### Avatar decision

No avatar-image field is currently assumed in the User data contract.

```text
Amit Kumar → Avatar.tsx → AK
```

Do not use `user.avatar` until backend/model/API support is actually added.

---

## 11. Feature Development Board

### Buyer

| Feature           | UI  | Redux | API           | Routing | Testing | Overall |
| ----------------- | --- | ----- | ------------- | ------- | ------- | ------- |
| Authentication    | ✅  | ✅    | ✅            | ✅      | 🧪      | ✅      |
| Profile           | 🟠  | 🟠    | ✅ foundation | ✅      | ❌      | 🟠      |
| Security/Passkeys | 🟠  | 🟠    | 🟠            | ✅      | 🧪      | 🟠      |
| Sidebar/Layout    | ✅  | N/A   | N/A           | ✅      | 🧪      | ✅      |
| Products          | ❌  | ❌    | ❌            | ⏳      | ❌      | ❌      |
| Categories        | ❌  | ❌    | ❌            | ⏳      | ❌      | ❌      |
| Search            | 🟠  | ❌    | ❌            | 🟠      | ❌      | 🟠      |
| Wishlist          | ❌  | ❌    | ❌            | 🟠      | ❌      | ❌      |
| Cart              | ❌  | ❌    | ❌            | 🟠      | ❌      | ❌      |
| Checkout          | ❌  | ❌    | ❌            | ⏳      | ❌      | ❌      |
| Orders            | ❌  | ❌    | ❌            | 🟠      | ❌      | ❌      |
| Addresses         | ❌  | ❌    | ❌            | 🟠      | ❌      | ❌      |

### Seller

| Feature          | UI  | Redux  | API      | Routing | Testing | Overall |
| ---------------- | --- | ------ | -------- | ------- | ------- | ------- |
| Layout/Sidebar   | ✅  | N/A    | N/A      | ✅      | 🧪      | ✅      |
| Onboarding       | ❌  | ❌     | ❌       | ⏳      | ❌      | ⏳      |
| Dashboard        | 🟠  | ❌     | ❌       | ✅      | ❌      | 🟠      |
| Personal profile | 🟠  | shared | auth API | ✅      | ❌      | 🟠      |
| Shop             | 🟠  | ❌     | ❌       | ✅      | ❌      | 🟠      |
| Products         | ❌  | ❌     | ❌       | ⏳      | ❌      | ❌      |
| Inventory        | ❌  | ❌     | ❌       | ⏳      | ❌      | ❌      |
| Orders           | ❌  | ❌     | ❌       | ⏳      | ❌      | ❌      |
| Shipping         | ❌  | ❌     | ❌       | ⏳      | ❌      | ❌      |
| Payments         | ❌  | ❌     | ❌       | ⏳      | ❌      | ❌      |
| Analytics        | ❌  | ❌     | ❌       | ⏳      | ❌      | ❌      |

### Admin

| Feature    | UI  | Redux | API | Routing | Testing | Overall |
| ---------- | --- | ----- | --- | ------- | ------- | ------- |
| Dashboard  | ❌  | ❌    | ❌  | ⏳      | ❌      | ❌      |
| Users      | ❌  | ❌    | ❌  | ⏳      | ❌      | ❌      |
| Shops      | ❌  | ❌    | ❌  | ⏳      | ❌      | ❌      |
| Products   | ❌  | ❌    | ❌  | ⏳      | ❌      | ❌      |
| Categories | ❌  | ❌    | ❌  | ⏳      | ❌      | ❌      |
| Orders     | ❌  | ❌    | ❌  | ⏳      | ❌      | ❌      |
| Settings   | ❌  | ❌    | ❌  | ⏳      | ❌      | ❌      |

---

## 12. Homepage Board

| Section           | UI  | API  | Responsive | Status     |
| ----------------- | --- | ---- | ---------- | ---------- |
| Shell             | ✅  | N/A  | ✅         | ✅         |
| Navbar            | ✅  | Auth | ✅         | ✅         |
| Footer            | ✅  | N/A  | ✅         | ✅ Initial |
| Hero              | ❌  | ❌   | ❌         | ⏳         |
| Categories        | ❌  | ❌   | ❌         | ⏳         |
| Deals             | ❌  | ❌   | ❌         | ⏳         |
| Featured products | ❌  | ❌   | ❌         | ⏳         |
| Trending          | ❌  | ❌   | ❌         | ⏳         |
| Best sellers      | ❌  | ❌   | ❌         | ⏳         |
| New arrivals      | ❌  | ❌   | ❌         | ⏳         |
| Recommendations   | ❌  | ❌   | ❌         | ⏳         |

---

## 13. Architecture Rules

| Decision             | Rule                                             |
| -------------------- | ------------------------------------------------ |
| `app/`               | Routes, layouts, metadata, thin route components |
| `features/`          | Business feature UI/state/types                  |
| `components/common/` | Shared application components                    |
| `components/ui/`     | Reusable visual primitives                       |
| `(buyer)`            | Route group; hidden from URL                     |
| `(auth)`             | Route group; hidden from URL                     |
| Seller URLs          | `/seller/...`                                    |
| Admin URLs           | `/admin/...`                                     |
| Shared profile       | `features/profile/`                              |
| Buyer feature        | Buyer-specific orchestration only                |
| Seller feature       | Seller-specific orchestration only               |
| Common Sidebar       | Must remain role-independent                     |
| Redux slices         | `features/<feature>/store/`                      |
| Global store         | Configuration + typed hooks                      |
| JWT                  | HttpOnly cookie                                  |
| Session restoration  | `/api/auth/me`                                   |
| Avatar               | Initials until backend image support exists      |
| Pages                | Keep thin                                        |
| Client components    | Only when client behavior is required            |
| Mobile sidebar       | Reuse `Drawer.tsx`                               |

---

## 14. Known Issues / Verification Queue

|   # | Issue                                         | Status                | Resolution / Next                          |
| --: | --------------------------------------------- | --------------------- | ------------------------------------------ |
|   1 | Navbar hydration mismatch                     | ✅ Fixed              | Stable initial markup                      |
|   2 | Wishlist `<div>` vs `<a>` hydration mismatch  | ✅ Fixed architecture | Regression test                            |
|   3 | Shared Redux store SSR risk                   | ✅ Fixed              | `makeStore()` + `useRef`                   |
|   4 | Login lost after refresh                      | ✅ Fixed architecture | `/api/auth/me`                             |
|   5 | Passkey login needs refresh to update UI      | 🧪 Verify             | Ensure auth user is dispatched immediately |
|   6 | Registration success/error handling           | ✅ Fixed              | Response handling aligned                  |
|   7 | Auth role typing                              | ✅ Fixed              | Types aligned                              |
|   8 | Passkey options TypeScript mismatch           | ✅ Fixed architecture | Proper WebAuthn option types               |
|   9 | Missing passkey selector/unknown state typing | ✅ Fixed architecture | Selectors/types aligned                    |
|  10 | Profile layout default export                 | ✅ Fixed              | Valid React export                         |
|  11 | `/buyer/profile` 404                          | ✅ Fixed architecture | `(buyer)` is hidden; intended `/profile`   |
|  12 | `/seller/shop/page` invalid default export    | ✅ Fix identified     | Valid React page required                  |
|  13 | MongoDB ECONNREFUSED                          | ✅ Resolved           | MongoDB service started                    |
|  14 | Logout cookie clearing                        | 🧪                    | Verify backend cookie deletion             |
|  15 | Mobile Buyer/Seller sidebar                   | 🟠                    | Connect Drawer                             |
|  16 | Avatar image missing from DB                  | ✅ Decision           | Initials only                              |

---

## 15. Date-Wise Change Log

### 2026-07-08

| Area             | Change                                                                   | Result                     |
| ---------------- | ------------------------------------------------------------------------ | -------------------------- |
| Category backend | Investigated category/Mongoose middleware error `next is not a function` | Debugging path established |

### 2026-07-13

| Area             | Change                                                     | Result                                        |
| ---------------- | ---------------------------------------------------------- | --------------------------------------------- |
| Logistics        | Selected Shiprocket direction                              | Logistics integration strategy established    |
| Product strategy | Discussed how users will discover the finished application | Marketing/discovery added to product thinking |

### 2026-07-14

| Area                      | Change                          | Result                         |
| ------------------------- | ------------------------------- | ------------------------------ |
| Windows/project structure | Investigated path/folder casing | Structure consistency improved |

### 2026-07-28

| Area         | Change                                              | Result                              |
| ------------ | --------------------------------------------------- | ----------------------------------- |
| Dependencies | Investigated npm `ERESOLVE` with React 19 ecosystem | Conflict identified                 |
| Next.js      | Clarified route-group folder naming                 | Cleaner URLs with organized folders |

### 2026-07-29 — Redux & Authentication

| Area                | Change                                                              | Result                           |
| ------------------- | ------------------------------------------------------------------- | -------------------------------- |
| Redux               | Changed Provider architecture to `makeStore()` + `useRef<AppStore>` | Stable App Router store instance |
| Auth persistence    | Connected refresh model to `/api/auth/me`                           | Login can survive refresh        |
| Auth initialization | Added predictable initialization concept                            | Auth UI waits for restoration    |
| Logout              | Connected logout UI/action                                          | Final cookie test remains        |

### 2026-07-29 — Hydration

| Area   | Change                                         | Result                            |
| ------ | ---------------------------------------------- | --------------------------------- |
| Navbar | Diagnosed server/client auth markup mismatch   | Root cause isolated               |
| Navbar | Fixed Wishlist/account initial markup behavior | Hydration architecture stabilized |
| Home   | Confirmed HomePage only surfaced Navbar error  | Correct file targeted             |

### 2026-07-29 — Buyer

| Area              | Change                                      | Result                                 |
| ----------------- | ------------------------------------------- | -------------------------------------- |
| Routes            | Established `(buyer)` route-group semantics | `/profile` instead of `/buyer/profile` |
| Profile           | Created buyer profile route/foundation      | Account area started                   |
| Layout            | Created Buyer account layout                | Shared buyer shell                     |
| Feature namespace | Added `features/buyer`                      | Buyer-specific UI has a home           |
| Sidebar           | Created BuyerSidebar                        | Account menu centralized               |

### 2026-07-29 — Profile

| Area           | Change                                                     | Result                                |
| -------------- | ---------------------------------------------------------- | ------------------------------------- |
| Shared feature | Created `features/profile` architecture                    | Reusable across roles                 |
| State design   | Distinguished auth session data from profile editing state | Cleaner Redux responsibility          |
| APIs           | Mapped existing auth account endpoints to profile/security | No duplicate profile backend required |

### 2026-07-29 — Seller

| Area      | Change                                         | Result                                |
| --------- | ---------------------------------------------- | ------------------------------------- |
| Profile   | Created seller profile foundation              | Shared profile reuse                  |
| Dashboard | Created seller dashboard foundation            | Seller center started                 |
| Sidebar   | Created SellerSidebar                          | Seller navigation centralized         |
| Layout    | Added sidebar to seller layout                 | Shared navigation across seller pages |
| Shop      | Fixed/identified valid page export requirement | `/seller/shop` route foundation       |

### 2026-07-29 — Sidebar System

| Area           | Change                         | Result                     |
| -------------- | ------------------------------ | -------------------------- |
| Common Sidebar | Created reusable `Sidebar.tsx` | Active-route UI shared     |
| Buyer          | Connected BuyerSidebar         | No duplicated sidebar UI   |
| Seller         | Connected SellerSidebar        | No duplicated sidebar UI   |
| Responsive     | Desktop sidebar established    | Drawer integration remains |

### 2026-07-29 — Passkeys

| Area             | Change                                          | Result                                    |
| ---------------- | ----------------------------------------------- | ----------------------------------------- |
| Routes           | Reviewed register/login/list/delete endpoints   | API architecture confirmed                |
| Controller       | Reviewed challenge verification + JWT issuance  | Login model confirmed                     |
| Service          | Reviewed SimpleWebAuthn implementation          | WebAuthn verification model confirmed     |
| UX               | Clarified passkeys do not store/reveal password | Correct security model                    |
| Profile/Security | Added passkey-management direction              | Correct settings location                 |
| Redux/Types      | Fixed passkey slice/selector/type issues        | Frontend integration improved             |
| Toasts           | Added passkey feedback                          | Better UX                                 |
| Login state      | Identified refresh-after-passkey-login issue    | Immediate Redux update needs verification |

### 2026-07-29 — Local MongoDB

| Area    | Change                                      | Result                   |
| ------- | ------------------------------------------- | ------------------------ |
| MongoDB | Diagnosed `ECONNREFUSED 127.0.0.1:27017`    | Service issue identified |
| Windows | Corrected service-start command/permissions | MongoDB working          |

### 2026-07-29 — UI Library

| Area     | Change                                                                                                                | Result                     |
| -------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| UI       | Created Avatar, Badge, Button, Card, Dialog, Drawer, Input, Modal, Pagination, Select, Skeleton, Spinner, Table, Tabs | Reusable UI foundation     |
| Strategy | Decided to adopt primitives incrementally                                                                             | Avoid unnecessary rewrites |

### 2026-07-29 — Navbar Avatar

| Area          | Change                                   | Result                                     |
| ------------- | ---------------------------------------- | ------------------------------------------ |
| Avatar        | Added initials-based Avatar direction    | Consistent account identity UI             |
| Data contract | Confirmed no DB avatar should be assumed | Removed invalid `user.avatar` dependency   |
| Future        | Image support deferred                   | Add only with backend field/upload feature |

---

### 2026-07-31 — Shop Marketplace

| Area              | Change                                                               | Result                                                              |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Shop backend      | Reviewed public shop APIs (`GET /api/shops`, `GET /api/shops/:slug`) | Public marketplace endpoints confirmed                              |
| Shop Redux        | Completed shop slice, selectors and async fetch foundation           | Public shop list available through Redux                            |
| Shop routing      | Separated customer shop browsing from seller shop management         | `/shop` reserved for customers, `/seller/shop` for seller dashboard |
| Shop UI           | Added public shop listing page foundation                            | Marketplace can render all seller shops                             |
| Shop architecture | Standardized `Shop`, `ShopCardData`, selectors and state usage       | Shared types across marketplace and seller area                     |

---

## 16. Runtime/Page Rules

Every App Router `page.tsx` and `layout.tsx` must default-export a React component.

```tsx
export default function Page() {
  return <div>Coming soon</div>;
}
```

An empty file, object export, or non-component default export produces:

```text
The default export is not a React Component
```

---

## 17. Security Notes

| Rule                                                 | Reason                                |
| ---------------------------------------------------- | ------------------------------------- |
| Keep JWT HttpOnly                                    | Client JS should not access token     |
| Restore session through `/api/auth/me`               | Backend validates cookie              |
| Do not use localStorage as auth source of truth      | Prevent stale/unsafe session state    |
| Passkeys store public credential data, not passwords | WebAuthn design                       |
| Keep WebAuthn challenges short-lived                 | Security                              |
| Do not assume `user.avatar`                          | Backend currently does not provide it |
| Do not commit credentials/secrets                    | Keep environment secrets private      |

---

## 18. Recommended Next Sequence

```text
1. Authentication E2E Verification
   ├── password login
   ├── refresh persistence
   ├── logout + cookie deletion
   ├── expired JWT
   ├── forgot/reset password
   ├── add passkey
   ├── passkey login without refresh
   └── list/delete passkeys

        ↓

2. Finish Profile + Security
   ├── edit personal information
   ├── change password
   └── passkey management

        ↓

3. Mobile Buyer/Seller Navigation
   └── connect Drawer.tsx

        ↓

4. Category

        ↓

5. Product

        ↓

6. Homepage Dynamic Sections

        ↓

7. Wishlist + Cart

        ↓

8. Checkout + Orders

        ↓

9. Seller Onboarding + Real Dashboard

        ↓

10. Seller Products / Inventory / Orders / Shipping

        ↓

11. Payments + Logistics

        ↓

12. Admin
```

---

## 19. Immediate Verification Checklist

| Test                 | Expected                      | Status |
| -------------------- | ----------------------------- | ------ |
| Register             | Buyer account created         | 🧪     |
| Password login       | Auth UI updates immediately   | 🧪     |
| Refresh              | User remains logged in        | 🧪     |
| Navbar hydration     | No mismatch                   | 🧪     |
| `/profile`           | Buyer profile renders         | 🧪     |
| `/seller/dashboard`  | Seller layout/sidebar renders | 🧪     |
| `/seller/profile`    | Shared profile renders        | 🧪     |
| `/seller/shop`       | Valid page renders            | 🧪     |
| Logout               | Cookie + Redux cleared        | 🧪     |
| Refresh after logout | Guest remains guest           | 🧪     |
| Expired token        | Safe guest fallback           | 🧪     |
| Add passkey          | Credential registers          | 🧪     |
| Passkey login        | No manual refresh needed      | 🧪     |
| Delete passkey       | Credential removed            | 🧪     |
| Buyer sidebar        | Active route correct          | 🧪     |
| Seller sidebar       | Active route correct          | 🧪     |
| Mobile sidebar       | Drawer available              | ⏳     |

---

## 20. How to Update This File

For every meaningful task:

```text
Master Tracker
    ↓
Relevant Feature/Route Board
    ↓
Known Issues if applicable
    ↓
Date-Wise Change Log
```

Use exact dates:

```text
YYYY-MM-DD
```

Bug lifecycle:

```text
🐞 Issue
   ↓
🧪 Fix implemented / needs verification
   ↓
✅ Fixed after regression test
```

---

## 21. Continuation Prompt

> This is a Next.js 16 multi-vendor e-commerce frontend using TypeScript, Tailwind CSS, Redux Toolkit, Axios, HttpOnly JWT authentication and WebAuthn passkeys. The global foundation, ThemeProvider, App Router-safe `makeStore()` Redux architecture, auth restoration through `/api/auth/me`, hydration-safe Navbar, account dropdown/logout UI, initials Avatar, shared profile architecture, passkey backend/frontend foundation, common Sidebar, BuyerSidebar, SellerSidebar, buyer/seller layouts, seller dashboard/profile/shop foundations, and reusable UI primitives already exist. Read this status document before suggesting new work. Do not rebuild completed files unless a specific change requires it. Keep routing/layout composition under `app/`, business logic under `features/<feature>/`, visual primitives under `components/ui/`, shared application components under `components/common/`, and global Redux configuration under `/store`. `(buyer)` and `(auth)` are route groups and do not appear in URLs. Personal profile functionality is shared across roles; seller shop/business functionality is seller-specific. Do not assume a database avatar field until backend support exists. First complete the verification checklist, then continue Category → Product → Homepage → Wishlist/Cart → Checkout/Orders → Seller workflows → Admin.

---

## 22. Current Handoff Summary

As of **2026-07-31**, the project has moved beyond the initial authentication/storefront shell.

Completed or established foundations include:

- Next.js App Router + TypeScript + Tailwind
- Centralized Axios API layer (`lib/api.ts`)
- Theme infrastructure
- Redux Toolkit with App Router-safe store creation
- HttpOnly JWT authentication restoration
- Login/register/forgot/reset foundations
- WebAuthn/passkey registration/login architecture
- Hydration-safe auth-aware Navbar
- Reusable initials Avatar
- Shared Footer
- Shared Profile architecture
- Buyer route-group layout and BuyerSidebar
- Seller layout, SellerSidebar, dashboard/profile/shop foundations
- Public Shop Marketplace foundation (`/shop`)
- Shop Redux slice, selectors, and async fetching foundation
- Public/customer shop routing separated from seller shop management
- Seller Shop CRUD foundation
- Common reusable Sidebar
- 14 reusable UI primitives
- Global loading/error/not-found handling
- Feature namespaces for core commerce domains

The priority is now **verification and completion rather than rebuilding foundation**: finish authentication/passkey/profile testing, add mobile sidebar drawers, then start Category and Product.
