# E-Commerce Marketplace Frontend — Development Status

> **Last updated:** 2026-08-16 (v4 — Notification system built + wired,
> live-update bug fixes)
> **Purpose:** Living frontend handoff + date-wise progress tracker.
> **Note:** This replaces v3 (2026-08-08). Since v3, the Notification
> feature (previously ❌ Not Started) went from zero to fully built,
> backend-wired, and socket-live on both buyer and seller sides. Two
> real-time bugs found during that work are also fixed — see section 0.

---

## 0. TL;DR — what's actually done right now

If you only read one section, read this one.

✅ **Fully wired and working (unchanged from v3):**
- Auth, profile, products (CRUD + wishlist heart on both card and detail),
  shop (CRUD + directory + public page), cart, checkout, buyer + seller
  orders, logistics/tracking, wishlist, seller dashboard, messaging
  (chat + broadcasts), full admin panel.

✅ **NEW since v3 — Notification system (was ❌, now ✅ end-to-end):**
- **Backend**: `modules/notification/` (model, controller, routes),
  `services/notification.service.js` as the single call site every other
  module uses (`createNotification()` / `createNotificationsBulk()`),
  `sockets/emit.js` has `emitNotification()`, mounted at
  `/api/notifications`.
- **Wired into existing flows**: order placed (→ seller), order status
  update (→ buyer), order shipped (→ buyer), order cancelled by buyer
  (→ seller). Shop offer broadcasts → past buyers of that shop.
- **Frontend**: `features/notification/` (types, slice, selectors,
  `NotificationBell`, `NotificationDropdown`, `NotificationItem`,
  `NotificationsPage`) following the same structure as
  `features/messaging`. 13th reducer registered in `store/store.ts`.
  Bell icon wired into `Navbar` (desktop + mobile), live via the shared
  Socket.io connection's `notification:new` event, with a 30s polling
  fallback in `NotificationBell` in case a socket event is missed.
- **Routes**: `/buyer/notifications` and `/seller/notifications` both
  built (`NotificationsPage` reused via the same shared-component
  pattern as `ProfileView`).
- **Known real-time gaps still open** (not yet wired, same "defer" logic
  as before): `new_product` and `new_shop` types exist in the type union
  and DB schema but nothing calls `createNotification()` with them yet;
  `feedback` type reserved for when the reviews module gets built.

🐛 **Two real-time bugs fixed this session — worth knowing about:**
1. **Socket listener location bug**: the app has (had) two `SocketProvider`
   components — `providers/SocketProvider.tsx` (the one actually composed
   in `AppProvider.tsx`, imported as `./SocketProvider`) and
   `features/messaging/components/Socketprovider.tsx` (a near-identical
   copy, no longer wired into the app). The notification listener was
   initially added to the *wrong* one. **`providers/SocketProvider.tsx` is
   the canonical file** — it now owns the `notification:new` handler
   alongside all the messaging events. The messaging-folder copy should be
   deleted once confirmed unreferenced (see Housekeeping below — this is a
   new item, not the old `profile copy N` one).
2. **Stale `currentOrder` after buyer-side mutations**: `orderSlice.ts`'s
   `cancelMyOrder.fulfilled` and `updateOrderStatus.fulfilled` only patched
   `state.myOrders` / `state.shopOrders` (the list views), never
   `state.currentOrder` (what `OrderDetail.tsx` actually renders via
   `selectCurrentOrder`). Buyer cancelling their own order looked like it
   required a manual refresh to reflect on the detail page — it wasn't a
   socket issue, it was a missing reducer update. Fixed by also patching
   `state.currentOrder` in `cancelMyOrder.fulfilled`, `updateOrderStatus.fulfilled`,
   and `shipOrder.fulfilled`.

🟠 **Partially done — real remaining work (unchanged from v3):**
- Dark-mode migration: `Footer`, `MyProductsList`, `ShopDashboard`
  sub-components, `SellerDashboardOverview`, `SellerOrdersList`,
  messaging components still use hardcoded gray/white Tailwind classes
  instead of semantic tokens (`bg-surface`, `text-primary`, etc). The new
  `features/notification` components were built dark-mode-correct from
  the start (semantic tokens throughout) — no migration debt added.
- Admin platform-broadcast composer UI not built (backend endpoint
  `POST /api/messages/broadcasts/platform` exists, no frontend form).

❌ **Not started (real gaps):**
- Category feature (frontend) — no `features/category` slice/CRUD UI,
  even though the Redux reducer is registered and the directory exists.
- Seller Settings + Shipping pages — route folders exist, completely
  empty.

🧹 **Housekeeping pending:**
- 3 duplicate folders under `frontend/features/`: `profile copy 10/`,
  `profile copy 11/`, `profile copy 12/` — unchanged from v3, still
  pending deletion after a `grep` confirms they're unreferenced.
- **NEW**: `features/messaging/components/Socketprovider.tsx` — the
  unused duplicate SocketProvider described above. Confirm nothing
  imports it (`grep -rn "messaging/components/Socketprovider" frontend/`),
  then delete it so there's only one socket-listener source of truth.

**Lesson learned this cycle, worth repeating**: when there are two
similarly-named files doing the same job (`SocketProvider.tsx` in two
different folders, in this case), always confirm which one `AppProvider`
actually imports before adding a new event handler — grep the import
path, don't assume. This cost a full debug cycle (DB write confirmed,
socket room confirmed, emit confirmed — turned out the listener itself
was in a file nothing rendered).

---

## 1. Project Snapshot

| Item             | Current State                                           |
| ----------------- | -------------------------------------------------------- |
| Application       | Multi-vendor e-commerce marketplace ("Marketplace")      |
| Frontend          | Next.js 16 App Router + TypeScript (Turbopack)            |
| Styling           | Tailwind CSS v4, semantic dark-mode color tokens          |
| State Management  | Redux Toolkit — **13 reducers** (see section 7)            |
| HTTP Client       | Axios (`services/axios.ts`)                               |
| Real-time         | Socket.io client, single global connection (see section 8 for the canonical-file note) |
| Authentication    | HttpOnly JWT cookie + Redux auth state                    |
| Passkeys          | WebAuthn / SimpleWebAuthn                                  |
| Theme             | Light / Dark / System (next-themes)                        |
| Interfaces        | Buyer, Seller, Admin — all three have working UI          |
| Architecture      | Feature-based (`features/<name>/{types,store,components}`) + `providers/AppProvider.tsx` composing all app-wide providers |
| Current focus     | Dark-mode migration of remaining older components, Category feature (frontend), seller settings/shipping pages, housekeeping (duplicate SocketProvider + `profile copy N`) |

---

## 2. Status Legend

| Status            | Meaning                              |
| ------------------ | ------------------------------------- |
| ✅ Complete       | Implemented and usable               |
| 🟠 Partial        | Foundation exists; more work remains |
| ⏳ Planned        | Decided but not implemented          |
| 🧪 Needs Testing  | Implemented but needs verification   |
| ❌ Not Started    | No implementation yet                |

---

## 3. Master Progress Tracker

|  # | Area                     | Status | What Exists Now                                                                 | Next Action                                  |
| -: | ------------------------- | :----: | --------------------------------------------------------------------------------- | ---------------------------------------------- |
|  1 | Auth (login/register/passkeys) | ✅ | Unchanged — see section 5. | E2E verification only |
|  2 | Profile (shared, all roles) | ✅ | `ProfileView` works for buyer/seller/admin off one component. | Dark-mode migrate remaining sub-components |
|  3 | Products (full CRUD)     | ✅ | Unchanged from v3. | — |
|  4 | Shop (full CRUD)         | ✅ | Unchanged from v3. | — |
|  5 | Orders                   | ✅ | Unchanged UI-wise, but `orderSlice.ts` reducers fixed so `currentOrder` stays in sync after cancel/status-update/ship — see section 0. | — |
|  6 | Cart                     | ✅ | Unchanged from v3. | — |
|  7 | Checkout                  | ✅ | Unchanged from v3. | — |
|  8 | Logistics                 | ✅ | Unchanged from v3. `shipOrder` now also fires a buyer notification (`order_status`, "Order shipped"). | — |
|  9 | Wishlist                  | ✅ | Unchanged from v3. | — |
| 10 | Seller Dashboard          | ✅ | Unchanged from v3. | Dark-mode migrate |
| 11 | Messaging (chat)          | ✅ | Unchanged from v3, **except**: the messaging-folder `Socketprovider.tsx` is now a dead duplicate — see Housekeeping. | Dark-mode migrate remaining components; delete duplicate SocketProvider |
| 12 | Broadcasts                | ✅ | Unchanged, **plus** shop broadcasts now also create a `new_offer` notification for each past buyer of that shop (in addition to the existing live toast). | Admin platform-broadcast composer still not built |
| 13 | **Admin panel**            | ✅ | Unchanged from v3. | Add admin category CRUD once backend builds those routes |
| 14 | Navbar                    | ✅ | Config-driven, live cart badge, live unread-messages badge, wishlist icon link, **NEW: `NotificationBell` wired in (desktop + mobile), live badge + dropdown.** | Dark-mode migrate |
| 15 | Footer                    | ✅ | Config-driven, mobile accordion. | Dark-mode migrate |
| 16 | `AppProvider`              | ✅ | Composes `ThemeProvider > ReduxProvider > AuthInitializer > SocketProvider`. **`SocketProvider` here is `providers/SocketProvider.tsx` — the canonical one, now also owns the `notification:new` listener.** | — |
| 17 | Theme / Dark mode          | 🟠 | Unchanged from v3 — see that list. New `features/notification` components are dark-mode-correct from the start (no debt added). | Finish remaining components |
| 18 | Homepage                  | ✅ | Unchanged from v3. | — |
| 19 | Category (frontend)       | ❌ | Unchanged from v3. | Build |
| 20 | **Notifications feature**  | ✅ | **NEW — built end-to-end this session.** Backend model/service/controller/routes, socket push (`notification:new`), frontend `features/notification` (slice, selectors, bell, dropdown, item, full page), wired into order lifecycle + shop broadcasts, routes at `/buyer/notifications` and `/seller/notifications`. 30s polling fallback in `NotificationBell` as a safety net alongside the live socket push. | Wire `new_product`/`new_shop` triggers when those flows exist; wire `feedback` type once reviews module is built |
| 21 | Seller Settings / Shipping | ❌ | Unchanged from v3. | Backend-dependent |
| 21b | Seller Analytics / Customers | 🟠 | Unchanged from v3. | Backend-dependent |
| 22 | Payment gateway            | ⏳ | **Explicitly stopped** — unchanged. | Don't resume unless asked |

---

## 4. Current Architecture

```text
frontend/
├── app/
│   ├── (auth)/                      login, register, forgot/reset-password, passkey
│   ├── (public)/
│   │   ├── page.tsx                 homepage
│   │   ├── products/page.tsx, [id]/page.tsx
│   │   ├── shop/page.tsx, [slug]/page.tsx
│   │   ├── categories/, about/, contact/, privacy/, terms/, search/
│   ├── admin/
│   │   ├── dashboard/, users/, shops/, products/, orders/   <- all wired, RequireRole-guarded
│   │   ├── categories/, reports/                             <- ComingSoon (no backend yet)
│   │   └── profile/                                          <- shared ProfileView
│   ├── buyer/
│   │   ├── profile/, cart/, messages/, wishlist/
│   │   ├── checkout/                <- CheckoutPage (with DeliveryEstimate)
│   │   ├── orders/page.tsx          <- MyOrdersList
│   │   ├── orders/[id]/page.tsx     <- OrderDetail (+ OrderTracking) — currentOrder now
│   │   │                               stays live after cancel/status-update, no refresh needed
│   │   ├── notifications/page.tsx   <- NEW: NotificationsPage (shared component)
│   │   ├── addresses/               — still a placeholder
│   ├── seller/
│   │   ├── profile/, shop/, products/, orders/, dashboard/, messages/
│   │   ├── analytics/, customers/   <- ComingSoon placeholders
│   │   ├── notifications/page.tsx   <- NEW: NotificationsPage (same shared component as buyer)
│   │   ├── settings/, shipping/     <- empty, not built
│   ├── layout.tsx                   <- <AppProvider><Navbar>{children}<Footer/><Toaster/></AppProvider>
│   ├── globals.css
│   └── error.tsx, loading.tsx, not-found.tsx
│
├── providers/
│   ├── AppProvider.tsx              <- composes Theme > Redux > AuthInitializer > Socket
│   ├── ThemeProvider.tsx
│   ├── ReduxProvider.tsx
│   └── SocketProvider.tsx           <- ★ CANONICAL socket listener file — owns message/typing/
│                                        presence/broadcast/order/notification events. This is
│                                        the one AppProvider actually renders.
│
├── components/
│   ├── common/                      Navbar.tsx (NotificationBell wired in), Footer.tsx
│   └── ui/                          14 primitives
│
├── features/
│   ├── auth/                        section 5
│   ├── profile/                     ProfileView + RequireRole
│   ├── products/                    ProductCard, ProductDetail, forms
│   ├── shop/                        PublicShopPage (Broadcast+Chat+DeliveryEstimate wired)
│   ├── order/                       orderSlice — currentOrder now patched on all buyer/seller mutations
│   ├── cart/
│   ├── logistics/                   DeliveryEstimate, OrderTracking, checkServiceability
│   ├── wishlist/                    full slice + WishlistButton + WishlistPage
│   ├── admin/                       dashboard + 4 management tables
│   ├── messaging/                   ShopBroadcastBanner, SellerBroadcastForm, StartChatButton,
│   │                                 etc. ⚠️ contains `components/Socketprovider.tsx` — a DEAD
│   │                                 duplicate of providers/SocketProvider.tsx, not imported by
│   │                                 AppProvider. Pending deletion, see Housekeeping.
│   ├── notification/                ★ NEW — types/, store/(notificationSlice + selectors),
│   │                                 components/(NotificationBell, NotificationDropdown,
│   │                                 NotificationItem, NotificationsPage), index.ts barrel.
│   ├── seller-dashboard/            SellerDashboardOverview, ComingSoon
│   ├── category/, payment/, search/, home/, upload/  — directories exist, not built
│
├── services/axios.ts
├── store/store.ts                   configureStore — 13 reducers, see section 7
└── store/hooks.ts
```

---

## 5. Authentication & Passkey Tracker — UNCHANGED

| Feature              | Status          | Current Behavior             | Remaining                         |
| --------------------- | :-------------: | ------------------------------ | ------------------------------------ |
| Login                 | ✅              | Password login updates Redux  | E2E                                  |
| Register              | ✅              | Buyer registration            | E2E                                  |
| Refresh persistence   | ✅ Architecture | `/api/auth/me` restores Redux | Expiry testing                       |
| Logout                | 🧪              | Action exists                 | Verify cookie + Redux clear          |
| Forgot password       | 🟠              | Form exists                   | Backend email test                   |
| Reset password        | 🟠              | Form exists                   | Token-state testing                  |
| Passkey registration  | 🟠              | Backend/frontend foundation   | Real authenticator test              |
| Passkey login         | 🟠              | Verify flow issues JWT        | Ensure UI updates without refresh    |
| List/Delete passkeys  | 🟠              | API/state foundation          | UI/E2E                               |

---

## 6. Route Tracker

### Public
| URL               | Status |
| ------------------ | :----: |
| `/`, `/products`, `/products/:id`, `/shop`, `/shop/:slug` | ✅ |
| `/categories`, `/about`, `/contact`, `/privacy`, `/terms`, `/search` | 🟠 |

### Buyer
| URL                     | Status |
| ------------------------ | :----: |
| `/buyer/profile`, `/buyer/cart`, `/buyer/messages`, `/buyer/wishlist` | ✅ |
| `/buyer/checkout`, `/buyer/orders`, `/buyer/orders/:id` | ✅ |
| `/buyer/notifications` | ✅ **NEW** |
| `/buyer/addresses` | ❌ |

### Seller
| URL                              | Status |
| ---------------------------------- | :----: |
| `/seller/profile`, `/seller/shop`, `/seller/products(/new,/:id/edit)`, `/seller/orders`, `/seller/dashboard`, `/seller/messages` | ✅ |
| `/seller/notifications` | ✅ **NEW** |
| `/seller/analytics`, `/seller/customers` | 🟠 ComingSoon |
| `/seller/settings`, `/seller/shipping` | ❌ |

### Admin
| URL                  | Status |
| ---------------------- | :----: |
| `/admin/dashboard`, `/admin/users`, `/admin/shops`, `/admin/products`, `/admin/orders`, `/admin/profile` | ✅ |
| `/admin/categories`, `/admin/reports` | 🟠 ComingSoon (no backend) |
| `/admin/notifications` | ❌ (not built — only buyer/seller have it so far; low priority, admin already sees everything via the panels) |

---

## 7. Redux Store

```ts
configureStore({
  reducer: {
    auth: authReducer,
    passkey: passkeyReducer,
    category: categoryReducer,      // reducer registered, feature UI not built
    products: productReducer,
    shop: shopReducer,
    order: orderReducer,
    cart: cartReducer,
    messaging: messagingReducer,
    logistics: logisticsReducer,
    wishlist: wishlistReducer,
    admin: adminReducer,
    notification: notificationReducer, // NEW
  },
});
```

**13 reducers total** (was 12 in v3). Each feature owns its own `types/`,
`store/<name>Slice.ts` + `<name>Selectors.ts`, exported through a barrel
`index.ts` — `features/notification` follows this exactly.

---

## 8. Real-time / Socket Architecture

`SocketProvider` lives in **`providers/SocketProvider.tsx`** — this is the
file actually composed inside `AppProvider.tsx` (imported as
`./SocketProvider`). A near-identical file also exists at
`features/messaging/components/Socketprovider.tsx` but is **not** wired
into the app; it's a leftover duplicate from an earlier pass and is
pending deletion (see Housekeeping, section 0).

Event table (all handled in the one canonical file):
`message:new`, `typing:start/stop`, `presence:online/offline`,
`broadcast:platform`, `broadcast:shop`, `order:new`,
`order:status-update`, **`notification:new`** (NEW — dispatches
`notificationReceived` into `notificationSlice`, shows a toast; bell
badge also does a 30s poll via `fetchUnreadCount` as a fallback in case a
push is missed while the tab was backgrounded).

Backend emits `notification:new` from `sockets/emit.js`'s
`emitNotification(recipientUserId, notification)`, called from
`services/notification.service.js`'s `createNotification()` — the single
call site every module (order, logistics, messaging) uses so "save to DB"
and "push live" never drift apart.

---

## 9. Theme / Dark Mode

Token system in `globals.css`. See row 17 in the Master Tracker for the
current migrated/not-migrated component list. All new
`features/notification` components (`NotificationBell`,
`NotificationDropdown`, `NotificationItem`, `NotificationsPage`) were
built with semantic tokens from the start — no new dark-mode debt.

---

## 10. Known Bugs Fixed (carried over + new)

| # | Issue | Root Cause | Fix |
| -: | ------- | ------------ | ----- |
| 1 | `<EditProductPage>` — "async Client Component" console error | Component had both `"use client"` AND `async function` | Removed `async`, called `const { id } = use(params)` directly |
| 2 | Category ObjectId cast error on product update | `product.update.controller.js` used `findById` instead of `findOne({slug})` | Fixed to slug lookup, matching `createProduct` |
| 3 | Next Image "missing sizes prop" warnings | Several `fill` images missing `sizes` | Added correct `sizes` per rendered size |
| 4 | Hydration mismatch: `cz-shortcut-listen="true"` | ColorZilla extension, not a code bug | `suppressHydrationWarning` on `<body>` |
| 5 | `fetchOrderTracking` type mismatch | Thunk typed wrong vs actual API shape | Retyped as `TrackingResponse` |
| 6 | `SocketProvider` module-not-found | Import typo `authSelector` → `authSelectors` | Fixed typo + normalized relative path |
| 7 | `/buyer/checkout`, `/buyer/orders` 404 | Route folders had no `page.tsx` | Built the pages |
| 8 | Wishlist heart-icon required 1 API call per card | Naive per-card fetch | Single lazy `GET /wishlist` + cached `productIds`, local `.includes()` lookup |
| 9 | **NEW: notifications never appeared live, only after manual refresh** | The `notification:new` socket listener was added to `features/messaging/components/Socketprovider.tsx` — a file `AppProvider` doesn't actually render. `providers/SocketProvider.tsx` is the real one. | Moved the listener to the canonical file; flagged the duplicate for deletion |
| 10 | **NEW: buyer's own `OrderDetail` page didn't reflect a self-initiated cancel without a refresh** | `orderSlice.ts`'s `cancelMyOrder.fulfilled` (and `updateOrderStatus.fulfilled`) only patched the list arrays (`myOrders`/`shopOrders`), never `state.currentOrder` — which `OrderDetail.tsx` actually reads via `selectCurrentOrder` | Added `state.currentOrder` patching to `cancelMyOrder.fulfilled`, `updateOrderStatus.fulfilled`, and `shipOrder.fulfilled` |

---

## 11. Immediate Next Steps

```text
1. Housekeeping (new + carried over)
   ├── Delete features/messaging/components/Socketprovider.tsx once
   │   grep confirms nothing imports it (dead duplicate of the real
   │   providers/SocketProvider.tsx)
   └── Delete frontend/features/profile copy 10/11/12
       (confirm unreferenced first via grep — carried over from v3)

        ↓

2. Dark-mode migration pass (unchanged from v3)
   └── Footer, MyProductsList, ShopDashboard sub-components
       (ShopSettingsForm, BusinessHoursEditor, HolidayManager,
       ShopSlugManager, ShopDirectory, ShopCard),
       SellerDashboardOverview, SellerOrdersList, messaging components

        ↓

3. Category feature (frontend)
   └── Dedicated features/category slice + admin CRUD UI once backend
       adds admin category routes (currently only public GET /categories exists)

        ↓

4. Seller settings + shipping pages (currently empty)

        ↓

5. Admin platform-broadcast composer
   └── UI for POST /api/messages/broadcasts/platform — backend endpoint
       exists, no frontend form yet

        ↓

6. Wire the remaining notification trigger points as their source
   features get built: new_product (when a "follow a shop" feature
   exists — currently new_offer notifies past buyers as a stand-in),
   new_shop, feedback (once reviews module exists)
```

**Note**: The Notification feature (previously item 3 on the v3 list) is
now fully built and removed from this list. Don't re-suggest building it
— see section 0 for exactly what's wired.

---

## 12. Continuation Prompt

> This is a Next.js 16 (Turbopack) multi-vendor e-commerce marketplace
> frontend using TypeScript, Tailwind CSS v4, Redux Toolkit, Axios,
> HttpOnly JWT authentication, WebAuthn passkeys, and Socket.io for
> real-time chat/broadcasts/order pings/notifications. Auth, profile
> (shared across buyer/seller/admin), products, shop, cart, checkout,
> buyer + seller orders, logistics/tracking, wishlist, seller dashboard,
> messaging, the full admin panel, **and now a complete Notification
> system** (backend model/service/socket-push + frontend
> `features/notification` with a live bell in the Navbar and full pages
> at `/buyer/notifications` and `/seller/notifications`) are all built
> and wired to their respective backend routes. **Read section 0 (TL;DR)
> before suggesting new work** — it's the most current picture. Don't
> rebuild anything marked ✅ unless a specific bug or change is
> requested, and don't re-suggest building the notification system — see
> section 0 for exactly what triggers exist (order placed/status/shipped,
> shop broadcasts) and what's still unwired (`new_product`, `new_shop`,
> `feedback` types exist but have no trigger yet — deferred until their
> source features are built). **Two things to know about before touching
> real-time code**: (1) there are two SocketProvider files —
> `providers/SocketProvider.tsx` is the canonical one actually rendered
> by `AppProvider`; `features/messaging/components/Socketprovider.tsx` is
> a dead duplicate pending deletion, don't add new socket listeners
> there. (2) `orderSlice.ts`'s mutation reducers (`cancelMyOrder`,
> `updateOrderStatus`, `shipOrder`) now patch both the list state AND
> `state.currentOrder` — if adding a new order-mutating thunk, patch
> `currentOrder` too or the detail page will need a manual refresh to
> reflect it. Business logic lives under
> `features/<name>/{types,store,components}` with a barrel `index.ts`;
> routing/thin page components live under `app/`; shared visual
> primitives live under `components/ui/`; role-based nav config lives in
> `components/layouts/config/nav.config.ts`; all app-wide providers are
> composed in `providers/AppProvider.tsx`. `(public)` and `(auth)` are
> route groups and don't appear in URLs — `seller`, `buyer`, and `admin`
> are NOT route groups. Dynamic route `params` is a Promise per Next.js
> 16 (`await params` server components, `use(params)` client components
> — never combine `"use client"` with an `async` component). Dark-mode
> uses semantic Tailwind tokens in `globals.css` (`bg-surface`,
> `border-default`, `text-primary/secondary/muted`) — never name a new
> token with the utility prefix baked in. Category is referenced by
> **slug** in request bodies everywhere, never ObjectId. Payment gateway
> integration is intentionally stopped; don't resume unless explicitly
> asked. **Before treating any status in this doc as current, prefer a
> quick file read over trusting the text** — this doc has drifted from
> the actual code multiple times before.
