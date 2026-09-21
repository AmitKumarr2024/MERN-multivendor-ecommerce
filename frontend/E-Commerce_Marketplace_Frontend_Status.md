# E-Commerce Marketplace Frontend — Development Status

<!-- ============================================================
     📋 UPDATE BLOCK TEMPLATE — copy this whole block, fill it in,
     and paste it right below this comment at the START of a new
     session's summary, as the new "section 0" content, pushing the
     previous session's TL;DR content down into the Master Tracker
     table + relevant sections further below. Bump the version number
     in the header (v8 → v9, etc.) and the "Last updated" date.
============================================================
## 0. TL;DR — what's actually done right now — YYYY-MM-DD

✅ **NEW since v<N-1> — <short title>:**
- What was built, where it's wired in, what patterns it reused

🐛 **Bugs fixed this session:**
- Symptom → root cause → fix

❌ **Not built yet / still pending from this session's work:**
- Anything flagged but not finished

✅ **Everything from v<N-1> unchanged**: <one-line summary + call out
anything still unverified from before>
============================================================ -->

# E-Commerce Marketplace Frontend — Development Status


> **Last updated:** 2026-09-21 (v11: Shop Loyalty / Reward Points frontend
> written; NOT yet compiled or manually tested. Backend suite green at
> 204/204.) Replaces v10.

✅ **NEW since v10: Loyalty (`features/loyalty/`), ⚠️ unverified**
- Seller: "Loyalty" tab in `Shopdashboard.tsx` -> `SellerLoyalty` with 3 tabs:
  Program (`LoyaltyProgramForm`: enable, points per ₹, redeem threshold,
  reward value, optional expiry, live example), Customers (`LoyaltyCustomers`:
  All/Top, search, sort, pagination, History modal, Adjust modal with
  mandatory reason), Redeemed rewards (`LoyaltyRedemptions`, "Mark as given").
- Buyer: `/buyer/loyalty` -> `MyLoyalty` (per-shop balances, drill-down with
  earned/redeemed/expired, next expiry warning, negative-balance notice,
  available rewards + Redeem, voucher code, history via shared `TxList`,
  "My rewards" list).
- Public shop page: `LoyaltyInfoCard` (shows rules only when program enabled).
- Redux: new `loyalty` slice, **19 reducers** now. Thunk generics kept on ONE
  line (paste-corruption lesson). `addMatcher` splits `actionLoading`
  (saveProgram/adjust/fulfill/redeem) from `loading`.
- Uses project tokens (`border-default`, `bg-accent`, etc.) and
  `components/ui/Modal` (with `open` prop).

⚠️ **Wiring checklist (verify, none confirmed yet)**
- `store.ts`: `loyalty: loyaltyReducer`
- `app/buyer/loyalty/page.tsx` renders `<MyLoyalty />`
- `Shopdashboard.tsx`: nav item `loyalty` + `{active === "loyalty" && <SellerLoyalty shopId={shop._id} />}`
- `PublicShopPage.tsx`: `<LoyaltyInfoCard shopId={shop._id} />` beside `KhataApplyCard`
- `nav.config.ts`: buyer menu "Loyalty Points" -> `/buyer/loyalty`
- `notification.types.ts`: add `loyalty_*` (and the missing `khata_*`) to
  `NotificationType` AND `NOTIFICATION_META`, otherwise `NotificationItem`
  crashes (`meta` undefined) on those notifications.

❌ **Pending:** run `npx tsc --noEmit` and fix (likely `addMatcher` typing in
`loyaltySlice.ts`); manual E2E (enable program -> deliver order -> points ->
redeem -> mark given -> cancel delivered order -> reversal); zero frontend
tests; no mobile card view for the customers table.

Also update: Master Tracker row 32 "Loyalty" 🟠; Redux section 7 -> 19
reducers; Route tracker + `/buyer/loyalty`; Immediate next steps #0 ->
verify loyalty frontend, then fix the `updateOrderStatus` cancel bug.


> 2026-09-21 (v10 — Shop Following + Customer
> Segments built: follow button on shop page, buyer "Followed shops"
> page, seller Customers page with New/Returning/Regular tabs. Backend
> suite green at 182/182. This module's frontend has zero tests, same
> gap as khata and staff.)
> **Purpose:** Living frontend handoff + date-wise progress tracker.
> **Note:** This replaces v9 (2026-09-18). See section 0 for what's new.

---

## 0. TL;DR — what's actually done right now

If you only read one section, read this one.

✅ **NEW since v9 — Shop Following + Customer Segments (`features/follow/`):**

- **Buyer**:
  - `FollowButton` — rendered in `ShopHeader.tsx` (public shop page).
    Shows Follow / Following (`aria-pressed`) plus "N followers · M
    customers" (public aggregate counts). Guests are redirected to
    `/login?redirect=...`; the shop owner never sees it
    (`user.shop === shopId`).
  - `FollowedShopsList` at **`/buyer/following`** — followed shops with
    open/closed status, city, follow date, unfollow (optimistic list
    removal). Linked from the buyer account dropdown as "Followed Shops"
    (`nav.config.ts`).
- **Seller**: `SellerCustomers` at **`/seller/customers`** (route now
  replaces the old ComingSoon page; `SellerCustomersPage` loads the
  seller's shop first). Summary cards (customers, regular, followers,
  revenue), tabs New/Returning/Regular/All with counts, debounced
  search, sort (latest order / most orders / highest spend / oldest),
  paginated table (name, segment badge, orders, total spent, first
  order, last order, last activity, "follower" tag) and a footnote with
  the live rules from the API. "Customers" added to `SellerSidebar`.
- **Redux**: new `follow` slice (**18 reducers** now). State:
  `byShop` (per-shop follow status so many buttons coexist),
  `publicStats`, `followed`, `customers`, `mutatingShopId`, `loading`,
  `error`. Thunks: `fetchShopPublicStats`, `fetchFollowStatus`,
  `followShop`, `unfollowShop`, `fetchMyFollowedShops`,
  `fetchShopCustomers`. Selectors in `followSelectors.ts`.
- **Rules live on the backend** (`CUSTOMER_RULES`): regular = 3+ orders
  in 180 days with 2+ delivered; returning = 2+; new = 1; cancelled
  ignored; following never affects segment. Frontend just displays what
  `rules` returns.
- Private customer data is only requested by the seller page; public
  pages only ever call the counts endpoint.

❌ **Pending from this work:** zero frontend tests for follow; the
customer table is desktop-first (`min-w-[820px]` with horizontal scroll,
no mobile card view); thunk `rejected` handlers use `error.message`
(generic axios text) rather than the backend message; no follower
notifications (`new_shop`/`new_product` types exist but nothing sends
them yet).

⚠️ **Wiring checklist (if anything looks missing)**: `store.ts` has
`follow: followReducer`; `ShopHeader.tsx` renders `<FollowButton>`;
`nav.config.ts` buyer menu has Followed Shops; `SellerSidebar` has
Customers; backend `index.js` mounts `/api/follows` and
`/api/shops/:shopId/customers`.

✅ **NEW since v8 — Digital Khata module built end-to-end, frontend
+ backend, this session:**

- **New feature: `features/khata/`** — shop-specific buyer credit
  ("buy now, pay later" shop khata). Buyer applies at a shop, seller
  approves with a credit limit, buyer can then pay for orders on
  credit up to that limit, seller records payments, both sides see
  transaction history and monthly statements.

- **Buyer surfaces**:
  - `KhataApplyCard` — renders on the public shop page
    (`PublicShopPage.tsx`) whenever the shop has khata enabled, shown
    **unconditionally above the products section** — this satisfies a
    hard business requirement that a buyer must always see khata
    availability even before their request is approved (or even
    submitted). Shows Apply button when no request exists, or a
    status badge (Pending/Approved/Rejected/Suspended) once one does.
  - `KhataDashboard` — credit limit / outstanding / available-credit
    stat cards + transaction history, for an approved khata.
  - `KhataStatementView` — month-picker + monthly statement.
  - `MyKhatasList` — all of a buyer's khatas across every shop, new
    page at `/buyer/khata`, linked from the navbar's account dropdown
    (`nav.config.ts`'s buyer `extraMenuItems`).

- **Seller surfaces** — new "Khata" tab in `ShopDashboard.tsx`
  (alongside Details/Hours/Team/Announcements):
  - `KhataSettingsToggle` — enable/disable khata for the shop.
  - `KhataRequestsList` — **Card view + Table view, toggleable**,
    same pattern as Staff's list (`localStorage`-persisted preference
    key `khata-list-view-mode`, `KhataTableView` with 10/page
    pagination). Built specifically because a shop could realistically
    have 1000+ khata buyers — an all-cards grid alone doesn't scale,
    same reasoning that justified Staff's Card/Table split originally.
  - **List→detail navigation is same-page inline, NOT a `Modal`** —
    a deliberate choice this session, different from Staff's Add/
    Edit/Attendance-in-Modal pattern. Clicking a buyer's card/row
    replaces the list with `KhataDetailPanel` + a "Back to Khata
    list" button, in the same tab. Reasoning: this is drill-down
    navigation into a full sub-view (stats, actions, full transaction
    history), not a quick confirm action — `Modal` stays reserved for
    quick actions (see below). **If a future session is tempted to
    wrap this back into a `Modal`, don't — it was explicitly changed
    away from that pattern per user request.**
  - `KhataDetailPanel` — buyer info, credit-limit/outstanding/
    available stats, credit-utilization bar, action buttons (Record
    Payment / Update Limit / Suspend or Reactivate / Close Month),
    transaction history. Suspend and Update-Limit use small `Modal`
    confirm dialogs (this is fine — see distinction above).
  - `KhataApproveModal` / `KhataRejectModal` — quick-confirm dialogs
    for the pending-request card/row actions, still `Modal`-based.
  - `KhataRecordPaymentModal` / `KhataCloseMonthModal` — same, quick
    actions inside the detail panel.

- **Checkout integration**: `KhataPaymentOption` added to
  `CheckoutPage.tsx`'s payment-method section, shown only when the
  cart is **single-shop** (khata credit is shop-specific, can't split
  across a multi-vendor cart — this mirrors a hard rule enforced on
  the backend too). Auto-falls back to COD if the cart becomes
  multi-shop after khata was selected. The "Pay online (Razorpay)"
  radio was **fully commented out** (not just disabled) this session,
  since there's no backend gateway API at all yet — payment
  integration is explicitly future work, khata needed no gateway so
  it shipped independently.

🐛 **Bugs fixed this session (all in freshly-written khata code, not
pre-existing bugs):**

- **`createAsyncThunk<A, B, C>` generic brackets silently stripped on
  paste** — happened a 5th time, this time in `khataSlice.ts`.
  Multiple thunks (`applyForKhata`, `setShopKhataEnabled`,
  `fetchShopKhataRequests`, `approveKhata`, `rejectKhata`,
  `suspendKhata`, `updateCreditLimit`, `recordKhataPayment`,
  `closeKhataMonth`, `fetchTransactionHistory`,
  `fetchMonthlyStatement`, `checkKhataEligibility`) lost their opening
  `<` on paste, producing "Expected 2-3 arguments, but got 1" errors.
  Fixed by re-adding every stripped `<`. **This is now confirmed as
  the single most common paste-corruption bug in this codebase —
  always visually verify `<` survived immediately after pasting any
  multi-line `createAsyncThunk<...>` block.**
- **`khata.types.ts` was missing `KhataSettlement` and
  `ShopKhataStatus`** (the slice imported them but they didn't exist
  yet) plus `KhataTransaction` was missing `shop`/`buyer`/
  `recordedBy` fields that the backend actually sends. Fixed by
  completing the type file to match the real API responses.
- **`Modal.tsx` didn't accept a `subtitle` prop** — several khata
  components (`KhataApplyCard`, `KhataApproveModal`,
  `KhataRejectModal`, `KhataRecordPaymentModal`) were written against
  an assumed shadcn-style Modal API before the real component was
  checked. Fixed by adding an optional `subtitle?: string` to the
  real `Modal.tsx` (renders under the title when present) — this is
  the only change made to the shared component; its portal/Esc-close/
  scroll-lock behavior (if present — **note**: the actual `Modal.tsx`
  content shared this session did NOT show portal rendering,
  body-scroll-lock, or a mobile bottom-sheet switch, unlike what the
  v8 doc describes — **this needs a follow-up spot-check**, see open
  items below; may indicate the doc description is aspirational or
  there are two different Modal implementations in play).
- **Initial khata component drafts used shadcn-style tokens**
  (`border-border`, `bg-card`, `text-muted-foreground`) instead of
  this project's actual tokens (`border-default`, `bg-surface`,
  `text-secondary`, `text-primary`) — caught by comparing against
  `Navbar.tsx`/`ShopDashboard.tsx`'s real usage before too much was
  built on the wrong tokens. All khata components use the correct
  token set now.
- **`PaymentMethod` type (`order.types.ts`) didn't include `"khata"`**
  — caused a TS "no overlap" comparison error everywhere
  `paymentMethod === "khata"` was checked. Also **`"razorpay"` was
  removed entirely** (not just left as-is) since no backend gateway
  exists — `PaymentMethod` is now `"cod" | "khata"` only, with a
  comment marking where to add `"razorpay"` back once that
  integration actually happens. `PaymentStatus` also gained
  `"khata_pending"`.
- **`OrderDetail.tsx`'s payment-method label only handled `"cod"` vs.
  a generic "Paid online" fallback** — would have silently
  mislabeled a khata order as "Paid online" (implying a completed
  gateway payment that never happened). Fixed to a three-way check:
  `"Cash on delivery"` / `"Khata (Credit)"`.

❌ **Not built yet / still pending from this session's work:**

- **Zero frontend test coverage for the khata module** — same gap as
  staff's frontend. Backend is fully tested (169/169), frontend
  components have no tests at all yet.
- The `Modal.tsx` portal/scroll-lock/bottom-sheet discrepancy noted
  above needs a direct spot-check — confirm which behavior the real
  component actually has, since a later session may need to route a
  khata dialog through an `overflow-x-auto` table container the same
  way Staff's `StaffActionsMenu` needed portal-rendering to avoid
  clipping.
- Khata's own `KhataRequestsList` search + Card/Table view state
  (`query`, `viewMode`) are local component state — not yet persisted
  across a page reload beyond the `localStorage` view-mode key itself
  (search text resets each visit, which is probably fine, but wasn't
  a deliberate decision, just default behavior — flag if it ever
  matters).

✅ **Everything from v8 unchanged**: Auth, profile, shop, cart,
checkout (now **plus** khata payment option), orders (now **plus**
khata payment-method label), logistics, wishlist, messaging, full
admin panel, notifications, Variants, Specifications, Reviews/Ratings,
Related Products, Search, Category (**still unconfirmed wiring — now
four sessions unverified**), dark-mode migration (**still unverified
by file read — now four sessions unverified**), Staff module (frontend
still has zero tests, `StaffRosterCard` consistency decision still
pending, day-by-day calendar still not built — all unchanged from v8).

---

## 1. Project Snapshot — UPDATED

| Item             | Current State                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application      | Multi-vendor e-commerce marketplace ("Amitora Market")                                                                                                                                                                              |
| Frontend         | Next.js 16 App Router + TypeScript (Turbopack)                                                                                                                                                                                      |
| Styling          | Tailwind CSS v4, semantic dark-mode color tokens — confirmed convention: `border-default`, `bg-surface`, `text-secondary`/`text-primary`/`text-muted`, `bg-accent`/`text-accent-foreground` for active/selected states             |
| State Management | Redux Toolkit — **18 reducers** (17 → 18: `follow` added 2026-09-21)                                                                                                                                                               |
| HTTP Client      | Axios (`services/axios.ts`)                                                                                                                                                                                                         |
| Real-time        | Socket.io client, single global connection (`providers/SocketProvider.tsx` is canonical)                                                                                                                                            |
| Authentication   | HttpOnly JWT cookie + Redux auth state                                                                                                                                                                                              |
| Passkeys         | WebAuthn / SimpleWebAuthn                                                                                                                                                                                                           |
| Theme            | Light / Dark / System (next-themes)                                                                                                                                                                                                 |
| Interfaces       | Buyer, Seller, Admin — all three have working UI                                                                                                                                                                                    |
| Architecture     | Feature-based (`features/<name>/{types,store,components}`) + `providers/AppProvider.tsx`. `components/ui/Modal.tsx` is the project-wide reusable dialog — needs a `subtitle` prop follow-up spot-check, see section 0.             |
| Current focus    | Khata frontend test coverage, `Modal.tsx` behavior spot-check, Staff module's carried-over open items (day-by-day calendar, `StaffRosterCard` consistency), Category wiring + dark-mode spot-checks (4 sessions overdue each)      |

---

## 2. Status Legend

_(unchanged)_

---

## 3. Master Progress Tracker — UPDATED (new row 30, row 6/7 note)

|   # | Area                             | Status | What Exists Now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Next Action                                                                   |
| --: | -------------------------------- | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
|   1–5 | Auth, Profile, Products, Shop, Orders | ✅ | Orders (#5) now carries a khata payment-method label fix in `OrderDetail.tsx`; otherwise unchanged. | — |
|   6 | Cart                              |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|   7 | Checkout                          |   ✅   | **Khata added as a payment method this session** — `KhataPaymentOption`, single-shop-cart only, auto-falls-back to COD if cart becomes multi-shop. "Pay online (Razorpay)" fully commented out, no backend gateway exists yet.                                                                                                                                                                                                                                                              | —                                                                             |
|   8 | Logistics                        |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|   9 | Wishlist                         |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  10 | Seller Dashboard                 |   ✅   | Unchanged from v8 — `StaffRosterCard` still flagged inconsistent, still an open decision. (Khata's seller UI lives in the Shop Dashboard's new Khata tab, not here — see row 30.)                                                                                                                                                                                                                                                                                                              | Decide: align StaffRosterCard to modal pattern or keep as exception           |
|  11 | Messaging (chat)                 |   ✅   | Unchanged — duplicate SocketProvider cleanup still pending.                                                                                                                                                                                                                                                                                                                                                                                                                                     | Delete duplicate SocketProvider                                               |
|  12 | Broadcasts                       |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Admin platform-broadcast composer still not built                             |
|  13 | Admin panel                      |   ✅   | Unchanged from v8.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                             |
|  14 | Navbar                           |   ✅   | Buyer's account-dropdown `extraMenuItems` gained a "Khata" link → `/buyer/khata` (`nav.config.ts`). Otherwise unchanged.                                                                                                                                                                                                                                                                                                                                                                       | —                                                                             |
|  15 | Footer                           |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Dark-mode spot-check (4 sessions overdue)                                     |
|  16 | `AppProvider`                    |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  17 | Theme / Dark mode                |   🟠   | **Still unverified — now four sessions running.**                                                                                                                                                                                                                                                                                                                                                                                                                                              | Spot-check before trusting further                                            |
|  18 | Homepage                         |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  19 | Category (frontend)              |   🟠   | Unchanged — now 4 sessions flagged.                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Still the actual next verification task                                       |
|  20 | Notifications feature            |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  21 | Product Variants (size/color)    |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  22 | Specifications                   |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  23 | Reviews / Ratings                |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  24 | Admin Review Moderation          |   ✅   | Unchanged from v8.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                             |
|  25 | Related/Similar Products         |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  26 | Search (Amazon-style)            |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Real search-analytics for trending (still a proxy)                            |
|  27 | Seller Settings / Shipping       |   ❌   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Backend-dependent                                                             |
| 27b | Seller Analytics / Customers     |   🟠   | **Customers now built** (`/seller/customers`, see row 31). Analytics still ComingSoon/backend-dependent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Backend-dependent                                                             |
|  28 | Payment gateway                  |   ⏳   | Explicitly stopped. Khata is not a gateway and does not reopen this.                                                                                                                                                                                                                                                                                                                                                                                                                            | Don't resume unless asked                                                     |
|  29 | Shop Staff / Team Management     |   🟠   | Unchanged from v8 — day-by-day calendar still not built, zero frontend tests, `StaffRosterCard` decision pending.                                                                                                                                                                                                                                                                                                                                                                              | Build day-by-day calendar; add tests; decide on `StaffRosterCard` consistency |
|  30 | **Digital Khata (credit ledger)**|   🟠   | **NEW this session.** Full buyer + seller UI built and wired (apply, approve/reject/suspend/reactivate, credit limit, record payment, statements, close-month, Card/Table requests list with pagination), plus checkout integration. Backend fully tested; **frontend has zero tests**.                                                                                                                                                                                                     | Add frontend test coverage; spot-check `Modal.tsx`'s actual portal/scroll-lock behavior |
|  31 | **Shop Following + Customers**   |   🟠   | **NEW 2026-09-21.** FollowButton, Followed Shops page, seller Customers page (segments/search/sort/pagination). Backend tested (13 tests); frontend has zero tests. | Add frontend tests; mobile card view for customers table |

---

## 4. Current Architecture — UPDATED

```text
frontend/
├── app/
│   ├── (auth)/                      login, register, forgot/reset-password, passkey
│   ├── (public)/
│   │   ├── page.tsx                 homepage
│   │   ├── products/page.tsx, [id]/page.tsx
│   │   ├── shop/page.tsx, [slug]/page.tsx   <- StaffSection opens StaffProfileModal;
│   │   │                                        KhataApplyCard ★ NEW, always visible when
│   │   │                                        shop.khataEnabled, rendered above ProductsSection
│   │   ├── categories/, about/, contact/, privacy/, terms/   <- categories/ wiring still unconfirmed
│   ├── search/page.tsx
│   ├── admin/
│   │   ├── dashboard/, users/, shops/, products/, orders/, reviews/, categories/, reports/, profile/
│   ├── buyer/
│   │   ├── profile/, cart/, messages/, wishlist/
│   │   ├── checkout/                <- CheckoutPage.tsx now includes KhataPaymentOption
│   │   │                                (single-shop-cart only), Razorpay radio commented out
│   │   ├── orders/page.tsx, orders/[id]/page.tsx  <- OrderDetail.tsx: 3-way payment-method label
│   │   ├── notifications/page.tsx
│   │   ├── khata/page.tsx           ★ NEW — renders <MyKhatasList />
│   │   ├── addresses/               — still a placeholder
│   ├── seller/
│   │   ├── profile/, shop/          <- ShopDashboard.tsx: NEW "Khata" nav item alongside
│   │   │                                Details/Hours/Team/Announcements
│   │   ├── products/, orders/, dashboard/, messages/
│   │   │   dashboard/ <- SellerDashboardOverview.tsx still renders StaffRosterCard (unchanged)
│   │   ├── analytics/, customers/   <- ComingSoon
│   │   ├── notifications/page.tsx
│   │   ├── settings/, shipping/     <- empty, not built
│   ├── layout.tsx
│   ├── globals.css
│   └── error.tsx, loading.tsx, not-found.tsx
│
├── providers/
│   ├── AppProvider.tsx
│   ├── ThemeProvider.tsx
│   ├── ReduxProvider.tsx
│   └── SocketProvider.tsx           <- ★ CANONICAL socket listener file
│
├── components/
│   ├── common/                      Navbar.tsx (account dropdown gained "Khata" link), Footer.tsx
│   ├── layouts/                     AdminSidebar.tsx
│   └── ui/                          14 primitives + Modal.tsx — gained an optional `subtitle`
│                                     prop this session; project-wide reusable dialog for
│                                     small quick-confirm actions — see khata's list→detail
│                                     pattern note for when NOT to use Modal (drill-down nav)
│
├── features/
│   ├── auth/, profile/, products/, shop/                    <- ShopDashboard.tsx's "Khata" tab
│   ├── order/                       order.types.ts: PaymentMethod = "cod" | "khata"
│   │                                (razorpay removed, commented for future);
│   │                                PaymentStatus gained "khata_pending"
│   ├── cart/, logistics/, wishlist/
│   ├── admin/                       Adminslice.ts (incl. review-moderation state)
│   ├── messaging/                   ⚠️ contains dead duplicate Socketprovider.tsx
│   ├── notification/, reviews/, search/
│   ├── category/                    ⚠️ page-wiring still unconfirmed (4 sessions)
│   ├── staff/                       unchanged from v8 — see row 29 above
│   ├── khata/                       ★ NEW 2026-09-18 — types/khata.types.ts, store/
│   │                                (khataSlice + khataSelectors), components/:
│   │                                  shared/: KhataStatusBadge, KhataTransactionList
│   │                                  buyer/: KhataApplyCard, KhataDashboard,
│   │                                    KhataStatementView, MyKhatasList
│   │                                  seller/: KhataSettingsToggle, KhataRequestsList
│   │                                    (Card+Table toggle, view-mode ★ localStorage
│   │                                    key "khata-list-view-mode"), KhataViewToggle,
│   │                                    KhataTableView (10/page pagination),
│   │                                    KhataDetailPanel (same-page inline, NOT Modal),
│   │                                    KhataApproveModal, KhataRejectModal,
│   │                                    KhataRecordPaymentModal, KhataCloseMonthModal
│   │                                  checkout/: KhataPaymentOption
│   ├── seller-dashboard/
│   ├── payment/, home/, upload/     — directories exist, not built
│
├── services/axios.ts
├── store/store.ts                   configureStore — ★ 17 reducers now (khata added)
└── store/hooks.ts
```

---

## 5. Authentication & Passkey Tracker — UNCHANGED

---

## 6. Route Tracker — UPDATED

### Public

| URL                                                                  |                                     Status                                      |
| -------------------------------------------------------------------- | :-----------------------------------------------------------------------------: |
| `/`, `/products`, `/products/:id`, `/shop`, `/shop/:slug`, `/search` | ✅ — `/shop/:slug` staff cards clickable; **`KhataApplyCard` always visible when the shop has khata enabled** |
| `/categories`, `/about`, `/contact`, `/privacy`, `/terms`            |                                       🟠                                        |

### Buyer

| URL              |  Status  |
| ---------------- | :------: |
| `/buyer/following` | ✅ NEW 2026-09-21 — renders `<FollowedShopsList />` |
| `/buyer/khata`   | ✅ NEW — renders `<MyKhatasList />` |
| `/buyer/checkout`| ✅ — now includes the khata payment option (single-shop carts only) |
| _(rest unchanged from v8)_ | |

### Seller

| URL                                                                                                                              |                                Status                                |
| -------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------: |
| `/seller/customers` | ✅ NEW 2026-09-21 — `SellerCustomersPage` (replaced ComingSoon) |
| `/seller/shop`                                                                                                                    | ✅ — now has a "Khata" nav item alongside Details/Hours/Team/Announcements |
| _(rest unchanged from v8)_                                                                                                        |                                                                        |

### Admin

_(unchanged)_

---

## 7. Redux Store — UPDATED

**18 reducers as of 2026-09-21**: `follow: followReducer` (from
`@/features/follow`) added after `khata`; see section 0 for its state
shape and thunks.

**17 reducers** (was 16): `khata: khataReducer` added, imported from
`@/features/khata`'s barrel export. `khataSlice.ts` handles apply/
approve/reject/suspend/reactivate/credit-limit/payment/statement/
close-month/eligibility-check thunks; `khataSelectors.ts` exposes
`selectMyKhatas`, `selectShopKhatas`, `selectShopKhataStatus`,
`selectActiveKhata`, `selectKhataTransactions`, `selectKhataStatement`,
`selectLastSettlement`, `selectKhataLoading`/`selectKhataActionLoading`
(separate flags so list views don't full-reload on a single action),
`selectKhataError`, `selectMyKhataForShop(shopId)`,
`selectShopKhataByStatus(status)`, `selectAvailableCredit(khata)`,
`selectPendingRequestCount`.

---

## 8. Real-time / Socket Architecture — UNCHANGED

---

## 9. Theme / Dark Mode — STILL UNVERIFIED (now 4 sessions running)

Still not independently file-verified. No new data points this
session (khata components were built using the confirmed real tokens
from `Navbar.tsx`/`ShopDashboard.tsx`, not by re-deriving them).

---

## 10. Known Bugs Fixed (carried over + new)

|    # | Issue                                                                            | Root Cause                                                                                                                          | Fix                                                                                                                                                           |
| ---: | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–25 | _(see v8 for full list)_                                                         | —                                                                                                                                   | —                                                                                                                                                             |
|   26 | **NEW: `createAsyncThunk<...>` generics stripped on paste, 5th occurrence**      | Multiline `createAsyncThunk<A, B>(...)` blocks in `khataSlice.ts` lost the opening `<`, TS read the generics as a comma-expression argument | Re-added every stripped `<` across 12 thunks                                                                                                                  |
|   27 | **NEW: `khata.types.ts` missing types the slice already imported**               | `KhataSettlement`, `ShopKhataStatus` types never written; `KhataTransaction` missing real API fields (`shop`/`buyer`/`recordedBy`)   | Completed the type file to match actual backend responses                                                                                                     |
|   28 | **NEW: `Modal.tsx` had no `subtitle` prop**                                      | Khata components assumed a shadcn-style Modal API before checking the real component                                                | Added optional `subtitle?: string`, rendered under the title — only change made to the shared component                                                      |
|   29 | **NEW: khata components initially used shadcn tokens, not this project's**       | Built against generic Tailwind conventions instead of checking real usage first                                                     | Rewrote all khata components with `border-default`/`bg-surface`/`text-secondary`/`text-primary`/`bg-accent` etc.                                              |
|   30 | **NEW: `PaymentMethod` type didn't include `"khata"`, TS "no overlap" error**    | Type only had `"cod" \| "razorpay"`                                                                                                  | `PaymentMethod` is now `"cod" \| "khata"` — `"razorpay"` removed entirely (commented, ready for future gateway work), `PaymentStatus` gained `"khata_pending"` |
|   31 | **NEW: `OrderDetail.tsx` mislabeled khata orders as "Paid online"**              | Payment-method label only checked `"cod"` vs. a generic online fallback                                                              | Three-way check: Cash on delivery / Khata (Credit) / (Paid online, now effectively unreachable but harmless)                                                  |

---

## 11. Immediate Next Steps — UPDATED

```text
0. Add frontend tests for features/follow (and mobile card view for
   the seller customers table) — same gap as khata/staff.

        ↓

1. Add frontend test coverage for the Khata module
   └── Backend is fully tested (169/169). Frontend has zero tests,
       same gap as Staff's frontend — now two modules with this gap.

        ↓

2. Spot-check Modal.tsx's actual behavior (portal? scroll-lock?
   mobile bottom-sheet?) against what the v8 doc claims
   └── The real Modal.tsx content shared this session showed none of
       those — either the doc description is stale/aspirational, or
       there are two different Modal implementations in the codebase.
       Resolve before any khata dialog needs to render inside an
       overflow-x-auto container (same clipping risk StaffActionsMenu
       hit).

        ↓

3. Decide on StaffRosterCard interaction consistency (carried over)

        ↓

4. Build the day-by-day attendance calendar grid view (carried over)

        ↓

5. Add frontend test coverage for the Staff module (carried over)

        ↓

6. Verify Category page wiring (4 sessions overdue)

        ↓

7. Spot-check the dark-mode "done" claim (4 sessions overdue)

        ↓

8. Housekeeping (carried over, still not done)
   ├── Delete features/messaging/components/Socketprovider.tsx
   └── Delete frontend/features/profile copy 10/11/12

        ↓

9. Seller settings + shipping pages (currently empty)

        ↓

10. Admin platform-broadcast composer UI

        ↓

11. Real search-analytics for "trending searches"
```

---

## 12. Continuation Prompt

> **2026-09-21 addition**: Redux now has **18 reducers** (`follow` added).
> `features/follow/` provides `FollowButton` (shop header), `FollowedShopsList`
> (`/buyer/following`) and `SellerCustomers` (`/seller/customers`). Customer
> segments are derived server-side from Order history (never from following);
> the frontend only renders them. Public pages must only call the counts
> endpoint, never the customers list.
>
> This is a Next.js 16 (Turbopack) multi-vendor e-commerce marketplace
> frontend ("Amitora Market") using TypeScript, Tailwind CSS v4, Redux
> Toolkit (**17 reducers**), Axios, HttpOnly JWT authentication,
> WebAuthn passkeys, and Socket.io for real-time chat/broadcasts/order
> pings/notifications. Auth, profile, shop, cart, checkout (now
> including a Khata "buy now, pay later" payment option), buyer +
> seller orders, logistics/tracking, wishlist, seller dashboard,
> messaging, the full admin panel, notifications, Product Variants,
> Specifications, Reviews/Ratings, Related Products, Search, a full
> Shop Staff / Team Management module, and a **new Digital Khata
> (shop-specific credit ledger) module** are all built and wired.
> **Read section 0 (TL;DR) before suggesting new work.**
>
> **Khata module, know before touching it**: (1) it's a shop-specific
> buyer credit relationship — apply → seller approves with a credit
> limit → buyer can pay orders on credit up to that limit → seller
> records payments. Every transaction is permanent, closing a month
> never deletes history. (2) `KhataApplyCard` on the public shop page
> must always render whenever `shop.khataEnabled` is true — this is a
> hard business requirement, buyer sees availability even before
> approval. (3) Khata is only offered as a checkout payment method for
> single-shop carts — credit is shop-specific, cannot split across a
> multi-vendor cart. (4) The seller's `KhataRequestsList` uses
> same-page inline list→detail navigation, NOT a `Modal` — this was a
> deliberate change this session specifically because the list needs
> to scale to 1000+ buyers (hence the Card/Table toggle + pagination
> too); don't wrap it back into a Modal. Small quick-confirm actions
> (approve/reject/suspend/record-payment/close-month) correctly stay
> as `Modal` dialogs — the distinction is drill-down navigation vs. a
> quick action. (5) `PaymentMethod` is `"cod" | "khata"` only —
> `"razorpay"` was deliberately removed (commented, not deleted) since
> no backend gateway exists yet; don't add it back without also
> building the gateway integration. (6) Khata's frontend has **zero**
> test coverage even though its backend is fully tested (169/169) —
> flagged as the top priority open item.
>
> **New this session, know before touching Modal.tsx**: its
> `subtitle` prop was added (optional, renders under the title). A
> discrepancy was noticed but not resolved: the v8 doc describes
> `Modal.tsx` as portal-rendered with Esc-to-close, body-scroll-lock,
> and a mobile bottom-sheet breakpoint switch — but the actual
> `Modal.tsx` content reviewed this session showed a plain `fixed`
> div with none of that. This needs a direct spot-check before
> assuming either description is current.
>
> **Known open items, in priority order**: (1) Khata frontend test
> coverage — zero; (2) `Modal.tsx` behavior discrepancy — unresolved;
> (3) day-by-day attendance calendar grid for Staff — still not built
> (now 4 sessions); (4) zero frontend tests for Staff too; (5)
> `StaffRosterCard` consistency decision pending; (6) Category
> page-wiring unconfirmed (4 sessions); (7) dark-mode migration
> unverified (4 sessions).
>
> **Trip-hazards for this codebase**: (1) two SocketProvider files —
> `providers/SocketProvider.tsx` is canonical, `features/messaging/
components/Socketprovider.tsx` is dead, never add listeners there.
> (2) `createAsyncThunk<A, B, C>(...)` generic brackets have been
> silently stripped on paste **five** separate times now
> (`reviewSlice`, `searchSlice`, `Adminslice`, `staffSlice`,
> `khataSlice`) — any "X only refers to a type" or "Expected 2-3
> arguments" error in a thunk file is almost certainly this; visually
> verify the `<` survived every multi-line paste. (3) `as const`
> nav-item arrays require every entry to share the exact same shape.
> (4) When writing code that imports a shared middleware/util/
> component you haven't personally read, ask for its real content
> first — this has cost multiple debugging rounds across this
> project's history, most recently the `Modal.tsx` `subtitle` prop
> and the project's real color-token names (khata components were
> initially written with shadcn tokens before being corrected). (5)
> Double-check template-literal usage in copy-pasted JSX — a stray
> backtick around a plain property access silently produces a literal
> string with no compiler error. (6) **New this session**: any new
> `PaymentMethod` value must be added in three separate places
> (`Order.model.js` enum, `order.validation.js`'s `checkoutSchema`
> enum, and this frontend's `order.types.ts` `PaymentMethod` type,
> backend-side details in the backend handoff) — missing one produces
> a different, misleadingly unrelated failure each time (500, silent
> 400, or a frontend TS error). Business logic lives under
> `features/<name>/{types,store,components}` with a barrel `index.ts`;
> routing/thin page components live under `app/`; shared visual
> primitives live under `components/ui/`; all app-wide providers are
> composed in `providers/AppProvider.tsx`. Admin sub-resources all live
> in ONE `Adminslice.ts`. `(public)` and `(auth)` are route groups;
> `seller`, `buyer`, `admin` are NOT. Dynamic route `params` is a
> Promise per Next.js 16. Category is referenced by **slug**, never
> ObjectId. Payment **gateway** integration is intentionally stopped
> (Khata is a separate, already-shipped, non-gateway feature — don't
> confuse the two when someone says "payment").
> **Before treating any status in this doc as current — especially a
> ❌ or "Not Started" or "reported complete" — prefer a quick file read
> over trusting the text.** This doc has drifted from actual code
> multiple times before.

---

<!-- ===================== PRIOR SESSIONS BELOW (v8 and earlier, preserved for history) ===================== -->

> **2026-08-26** (v8 — Full Staff module UI redesign)

_(v8 and all earlier sections preserved in full below this line — see
prior handoff exports for complete v7/v6/v5/v4 history if needed.
Trimmed here for length; the v8 section 0/3/4/6/7/10/11/12 content
from the previous handoff remains valid as historical record and is
superseded by the v9 sections above wherever they overlap.)

>-------------------------------------------------------------------------

 2026-08-26 (v8 — Full Staff module UI redesign:
> Card/Table view toggle, dialog/modal pattern for Add/Edit/Attendance,
> portal-based dropdown fixes, mobile-responsive polish across all
> staff components)
> **Purpose:** Living frontend handoff + date-wise progress tracker.
> **Note:** This replaces v7 (2026-08-20). See section 0 for what's new.

---

## 0. TL;DR — what's actually done right now

If you only read one section, read this one.

✅ **NEW since v7 — Staff module UI completely redesigned this
session, resolving the v7 "attendance button" open item and going
much further:**

- **Confirmed fixed**: the v7 "known issue" (attendance never openable
  from `StaffList` rows) is now resolved — but the fix that shipped is
  a full interaction-model change, not just a toggle button. See below.

- **New shared component: `components/ui/Modal.tsx`** — a reusable,
  portal-based dialog (renders into `document.body`, backdrop-blur,
  Esc-to-close, body-scroll-lock while open, becomes a bottom-sheet on
  mobile via `items-end` → `items-center` breakpoint switch). This is
  now the standard pattern for any "open a form/detail in an overlay"
  need project-wide, not staff-specific — reuse this for future
  features before building a bespoke modal.

- **Staff module restructured into Card view + Table view, toggleable**:
  - `features/staff/components/list/ViewToggle.tsx` — Cards/Table
    switch, preference persisted to `localStorage`
    (`staff-list-view-mode`)
  - `StaffCardView.tsx` / `StaffCardItem.tsx` — compact card grid,
    4-icon action row (Attendance/Edit/Disable/Remove) at the bottom
  - `StaffTableView.tsx` / `StaffTableRow.tsx` — desktop `<table>` +
    a separate mobile card layout inside the same row component
    (`hidden md:table-row` / `md:hidden` split), client-side pagination
    (10/page) with first/prev/page-numbers/next/last controls
  - `StaffActionsMenu.tsx` — the "⋯" dropdown used in table rows

- **Add / Edit / Attendance now open in `Modal`, not inline expansion**:
  previously these expanded inline inside the card or as an extra
  table row (`colSpan`), which caused layout squeeze, clipped text, and
  a table that looked "broken" on narrow viewports. Now:
  - "Add staff member" → `Modal` wrapping `StaffForm`
  - "Edit" (from either card or table row) → `Modal` wrapping
    `StaffForm` with `existing={member}`
  - "Attendance" → `Modal` (wider, `maxWidth="lg"`) wrapping
    `StaffAttendanceCalendar`
  - This is the practical, real-world interaction pattern the user
    specifically asked for ("ek dialoge box me like ek module open
    ho") — validated first with a standalone HTML/CSS mockup (artifact:
    `staff-modal-preview.html`) before being ported to React/Tailwind.

- **`StaffAttendanceCalendar.tsx` simplified for compact contexts**:
  earlier version assumed a full-width `<section>` with a 3-column
  month-nav header and 4-column stat grid — this broke down inside a
  narrow card. Rebuilt as a self-contained `<div>` that stacks cleanly
  at any container width: one-line month switcher, "mark today" status
  pills that wrap, 2×2 stat grid. Works identically whether opened
  from a card, a table row, or (future) any other trigger.

- **`StaffCardItem.tsx` bottom action row bug fixed**: labels
  ("Attendance", "Edit", etc.) were being visually clipped by the
  card's rounded bottom corners due to insufficient padding — root
  cause was `py-3` with no `truncate`/`leading-tight` handling on
  longer labels. Fixed with more vertical padding, `flex-col` icon
  above label, `truncate` + `leading-tight` so "Attendance" always
  fits on one line without overflowing its grid cell.

🐛 **Bugs fixed this session:**

- **`StaffActionsMenu`'s dropdown appeared clipped/hidden inside table
  rows.** Root cause: `absolute` positioning relative to a parent
  inside `overflow-x-auto` (the table's horizontal-scroll wrapper),
  which clips anything that renders outside its bounds. Fixed by
  rendering the menu via `createPortal(..., document.body)` and
  computing its position from `getBoundingClientRect()` on the trigger
  button, with automatic upward-flip when there isn't enough room
  below in the viewport.
- **View-toggle active state rendered as a solid black button with
  invisible text.** Root cause: used `bg-primary`/`text-primary-foreground`
  Tailwind tokens that don't exist in this project's theme (it uses
  `bg-accent`/`text-accent-foreground` — confirmed against
  `SellerDashboardOverview.tsx`'s established usage). Fixed by
  swapping to the correct token names — **any new component in this
  project should default to `accent`, not `primary`, for the "active/
  selected" visual state**, this is now a confirmed project convention.
- **Table appeared to render inside a fixed-height scrollable box**,
  clipping rows and making the dropdown look "trapped." This turned
  out to be a side effect of the dropdown-clipping bug above, not an
  actual `max-h`/`overflow-y` constraint on the table itself — resolved
  once the portal fix landed. **Lesson**: a scrollbar appearing on an
  `overflow-x-auto` wrapper can be caused by an absolutely-positioned
  child trying to escape its bounds, not just by genuine content
  overflow — check for that before assuming a height constraint needs
  removing.
- **`StaffProfileModal` (public-facing "view staff" popup) confirmed
  wired but was non-functional** — `StaffCard.tsx` (public) rendered as
  a plain `<div>` with no `onClick`, so nothing happened when a buyer
  tapped a staff card on the public shop page. Fixed: `StaffCard` is
  now a `<button>` accepting an `onClick` prop, and `StaffSection.tsx`
  (the public shop page's staff-grid wrapper) now holds
  `selectedStaff` state and renders `StaffProfileModal` when a card is
  clicked. This modal shows the staff's bio, rating, `StaffFeedbackForm`
  (eligibility-gated), and `StaffFeedbackList` — full public profile
  view, previously completely inert.
- **Literal-string bug**: one `Modal` call site had `subtitle={`member.name`}`
  (backticks around the property name, producing the literal text
  "member.name" instead of the actual staff member's name). Fixed to
  `subtitle={member.name}`. **Lesson for future modal/dialog work**:
  double-check template-literal usage doesn't accidentally wrap a plain
  expression when copy-pasting between similar call sites.

❌ **Not built yet / still pending from this session's work:**

- Day-by-day attendance calendar grid (visual month view with per-date
  status dots) — **still not built**, unchanged from v7. Backend's
  `getMonthlyAttendance()` still only gets consumed for aggregate
  totals/percentage in the UI, the `records[]` array it returns is
  still unused on the frontend.
- Frontend test coverage for the staff module — **still zero**,
  unchanged from v7. This is now two sessions of pure UI/UX iteration
  on staff with no accompanying tests; should be prioritized before
  further staff feature work.
- `StaffRosterCard.tsx` (seller dashboard sidebar widget) was **not**
  touched this session — still uses the pre-modal inline-attendance
  interaction pattern (`Present`/`Absent` icon buttons directly in the
  roster list, no dialog). This is intentional for that specific
  component (quick daily mark-off shouldn't require opening a dialog),
  but flagging that it's now visually/interactionally inconsistent with
  the rest of the module — worth a deliberate decision next session on
  whether to leave it as the "quick action" exception or align it.

✅ **Everything from v7 unchanged**: Auth, profile, shop, cart,
checkout, orders, logistics, wishlist, messaging, full admin panel
(incl. Review Moderation), notifications, Variants, Specifications,
Reviews/Ratings, Related Products, Search, Category (**still
unconfirmed wiring — now three sessions unverified**, see v6/v7),
dark-mode migration (**still unverified by file read — now three
sessions unverified**, treat with real suspicion).

---

## 1. Project Snapshot

| Item             | Current State                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application      | Multi-vendor e-commerce marketplace ("Amitora Market")                                                                                                                                                                              |
| Frontend         | Next.js 16 App Router + TypeScript (Turbopack)                                                                                                                                                                                      |
| Styling          | Tailwind CSS v4, semantic dark-mode color tokens (confirmed convention: use `accent`, not `primary`, for active/selected states — see bug fix log)                                                                                  |
| State Management | Redux Toolkit — **16 reducers** (unchanged count from v7 — this session was UI-only, no new slices)                                                                                                                                 |
| HTTP Client      | Axios (`services/axios.ts`)                                                                                                                                                                                                         |
| Real-time        | Socket.io client, single global connection (`providers/SocketProvider.tsx` is canonical)                                                                                                                                            |
| Authentication   | HttpOnly JWT cookie + Redux auth state                                                                                                                                                                                              |
| Passkeys         | WebAuthn / SimpleWebAuthn                                                                                                                                                                                                           |
| Theme            | Light / Dark / System (next-themes)                                                                                                                                                                                                 |
| Interfaces       | Buyer, Seller, Admin — all three have working UI                                                                                                                                                                                    |
| Architecture     | Feature-based (`features/<name>/{types,store,components}`) + `providers/AppProvider.tsx` composing all app-wide providers. **New this session**: `components/ui/Modal.tsx` established as the project-wide reusable dialog pattern. |
| Current focus    | Decide on `StaffRosterCard` interaction consistency, build day-by-day attendance calendar, add staff-module frontend tests, confirm Category page wiring (3 sessions overdue), spot-check dark-mode claim (3 sessions overdue)      |

---

## 2. Status Legend

| Status           | Meaning                                                          |
| ---------------- | ---------------------------------------------------------------- |
| ✅ Complete      | Implemented and usable                                           |
| 🟠 Partial       | Foundation exists; more work remains, or reported-but-unverified |
| ⏳ Planned       | Decided but not implemented                                      |
| 🧪 Needs Testing | Implemented but needs verification                               |
| ❌ Not Started   | No implementation yet                                            |

---

## 3. Master Progress Tracker

|   # | Area                             | Status | What Exists Now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Next Action                                                                   |
| --: | -------------------------------- | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
|   1 | Auth (login/register/passkeys)   |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | E2E verification only                                                         |
|   2 | Profile (shared, all roles)      |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|   3 | Products (full CRUD)             |   ✅   | Unchanged from v7.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                             |
|   4 | Shop (full CRUD)                 |   ✅   | Unchanged, hosts the Team tab.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —                                                                             |
|   5 | Orders                           |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|   6 | Cart                             |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|   7 | Checkout                         |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|   8 | Logistics                        |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|   9 | Wishlist                         |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  10 | Seller Dashboard                 |   ✅   | `StaffRosterCard` unchanged this session — flagged as interactionally inconsistent with rest of staff module now (see section 0).                                                                                                                                                                                                                                                                                                                                                               | Decide: align to modal pattern or keep as deliberate quick-action exception   |
|  11 | Messaging (chat)                 |   ✅   | Unchanged — duplicate SocketProvider cleanup still pending.                                                                                                                                                                                                                                                                                                                                                                                                                                     | Delete duplicate SocketProvider                                               |
|  12 | Broadcasts                       |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Admin platform-broadcast composer still not built                             |
|  13 | Admin panel                      |   ✅   | Unchanged from v7.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                             |
|  14 | Navbar                           |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  15 | Footer                           |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Dark-mode spot-check (3 sessions overdue)                                     |
|  16 | `AppProvider`                    |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  17 | Theme / Dark mode                |   🟠   | **Still unverified — now three sessions running.**                                                                                                                                                                                                                                                                                                                                                                                                                                              | Spot-check before trusting further                                            |
|  18 | Homepage                         |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  19 | Category (frontend)              |   🟠   | Unchanged — components exist, page-wiring still unconfirmed. Now 3 sessions flagged.                                                                                                                                                                                                                                                                                                                                                                                                            | Still the actual next verification task                                       |
|  20 | Notifications feature            |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  21 | Product Variants (size/color)    |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  22 | Specifications                   |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  23 | Reviews / Ratings                |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  24 | Admin Review Moderation          |   ✅   | Unchanged from v7.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                             |
|  25 | Related/Similar Products         |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
|  26 | Search (Amazon-style)            |   ✅   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Real search-analytics for trending (still a proxy)                            |
|  27 | Seller Settings / Shipping       |   ❌   | Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Backend-dependent                                                             |
| 27b | Seller Analytics / Customers     |   🟠   | **Customers now built** (`/seller/customers`, see row 31). Analytics still ComingSoon/backend-dependent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Backend-dependent                                                             |
|  28 | Payment gateway                  |   ⏳   | Explicitly stopped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Don't resume unless asked                                                     |
|  29 | **Shop Staff / Team Management** |   🟠   | **Major UI redesign this session.** Card/Table view toggle, Add/Edit/Attendance now open in a shared `Modal` dialog (portal-based, mobile bottom-sheet), public `StaffCard`→`StaffProfileModal` click flow fixed and confirmed wired, several visual bugs fixed (dropdown clipping, dark-token mismatch, label clipping, literal-string bug). Day-by-day calendar grid still not built. Zero frontend tests. `StaffRosterCard` interaction pattern not yet aligned with the rest of the module. | Build day-by-day calendar; add tests; decide on `StaffRosterCard` consistency |

---

## 4. Current Architecture

```text
frontend/
├── app/
│   ├── (auth)/                      login, register, forgot/reset-password, passkey
│   ├── (public)/
│   │   ├── page.tsx                 homepage
│   │   ├── products/page.tsx, [id]/page.tsx
│   │   ├── shop/page.tsx, [slug]/page.tsx   <- StaffSection now opens StaffProfileModal on card click
│   │   ├── categories/, about/, contact/, privacy/, terms/   <- categories/ wiring still unconfirmed
│   ├── search/page.tsx
│   ├── admin/
│   │   ├── dashboard/, users/, shops/, products/, orders/, reviews/, categories/, reports/, profile/
│   ├── buyer/
│   │   ├── profile/, cart/, messages/, wishlist/
│   │   ├── checkout/, orders/page.tsx, orders/[id]/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── addresses/               — still a placeholder
│   ├── seller/
│   │   ├── profile/, shop/, products/, orders/, dashboard/, messages/
│   │   │   dashboard/ <- SellerDashboardOverview.tsx still renders StaffRosterCard (unchanged pattern)
│   │   ├── analytics/, customers/   <- ComingSoon
│   │   ├── notifications/page.tsx
│   │   ├── settings/, shipping/     <- empty, not built
│   ├── layout.tsx
│   ├── globals.css
│   └── error.tsx, loading.tsx, not-found.tsx
│
├── providers/
│   ├── AppProvider.tsx
│   ├── ThemeProvider.tsx
│   ├── ReduxProvider.tsx
│   └── SocketProvider.tsx           <- ★ CANONICAL socket listener file
│
├── components/
│   ├── common/                      Navbar.tsx, Footer.tsx
│   ├── layouts/                     AdminSidebar.tsx
│   └── ui/                          14 primitives + Modal.tsx ★ NEW 2026-08-26 — project-wide
│                                     reusable portal-based dialog, use this for any future
│                                     "open form/detail in an overlay" need
│
├── features/
│   ├── auth/, profile/, products/, shop/                    <- ShopDashboard.tsx's 4th "Team" tab
│   ├── order/, cart/, logistics/, wishlist/
│   ├── admin/                       Adminslice.ts (incl. review-moderation state)
│   ├── messaging/                   ⚠️ contains dead duplicate Socketprovider.tsx
│   ├── notification/, reviews/, search/
│   ├── category/                    ⚠️ page-wiring still unconfirmed (3 sessions)
│   ├── staff/                       ★ MAJOR REDESIGN 2026-08-26 — types/, store/(staffSlice +
│   │                                staffSelectors, unchanged), components/:
│   │                                  StaffForm, StaffCard (public, now clickable),
│   │                                  StaffProfileModal (now wired), StaffFeedbackForm,
│   │                                  StaffFeedbackList, StaffAttendanceCalendar (rebuilt
│   │                                  compact), StaffRosterCard (unchanged, flagged
│   │                                  inconsistent), StaffSection (public, now holds modal state)
│   │                                components/list/: ViewToggle, StaffCardView,
│   │                                  StaffCardItem (modal-based actions), StaffTableView
│   │                                  (paginated), StaffTableRow (modal-based actions,
│   │                                  desktop+mobile split), StaffActionsMenu (portal dropdown)
│   ├── seller-dashboard/
│   ├── payment/, home/, upload/     — directories exist, not built
│
├── services/axios.ts
├── store/store.ts                   configureStore — 16 reducers, see section 7 (unchanged)
└── store/hooks.ts
```

---

## 5. Authentication & Passkey Tracker — UNCHANGED

_(no changes this session)_

---

## 6. Route Tracker

### Public

| URL                                                                  |                                     Status                                      |
| -------------------------------------------------------------------- | :-----------------------------------------------------------------------------: |
| `/`, `/products`, `/products/:id`, `/shop`, `/shop/:slug`, `/search` | ✅ — `/shop/:slug`'s staff cards are now clickable, opening `StaffProfileModal` |
| `/categories`, `/about`, `/contact`, `/privacy`, `/terms`            |                                       🟠                                        |

### Buyer

_(unchanged from v7)_

### Seller

| URL                                                                                                                              |                                Status                                |
| -------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------: |
| `/seller/profile`, `/seller/shop`, `/seller/products(/new,/:id/edit)`, `/seller/orders`, `/seller/dashboard`, `/seller/messages` | ✅ — `/seller/shop`'s Team tab has the full redesigned Card/Table UI |
| `/seller/notifications`                                                                                                          |                                  ✅                                  |
| `/seller/analytics`, `/seller/customers`                                                                                         |                            🟠 ComingSoon                             |
| `/seller/settings`, `/seller/shipping`                                                                                           |                                  ❌                                  |

### Admin

_(unchanged from v7)_

---

## 7. Redux Store — UNCHANGED (16 reducers, no new slices this session)

_(see v7 for full listing — this session was pure component/UI work,
`staffSlice.ts`/`staffSelectors.ts` untouched)_

---

## 8. Real-time / Socket Architecture — UNCHANGED

_(no changes this session)_

---

## 9. Theme / Dark Mode — STILL UNVERIFIED (now 3 sessions running)

Still not independently file-verified. One relevant data point from
this session: the `bg-primary`/`text-primary-foreground` vs
`bg-accent`/`text-accent-foreground` token-mismatch bug (see section 0)
confirms this project's actual dark-mode-safe token set includes
`accent` variants as the correct "active state" token — useful context
for whoever eventually does the dark-mode spot-check.

---

## 10. Known Bugs Fixed (carried over + new)

|    # | Issue                                                                            | Root Cause                                                                                                                          | Fix                                                                                                                                                           |
| ---: | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–19 | _(see v7 for full list)_                                                         | —                                                                                                                                   | —                                                                                                                                                             |
|   20 | **NEW: `StaffActionsMenu` dropdown clipped/hidden inside table rows**            | `absolute`-positioned menu inside an `overflow-x-auto` scroll container gets clipped by that container's bounds                     | Rendered via `createPortal(..., document.body)`, position computed from `getBoundingClientRect()`, auto-flips upward near viewport bottom                     |
|   21 | **NEW: View-toggle active button rendered solid black with invisible text**      | Used nonexistent `bg-primary`/`text-primary-foreground` tokens instead of the project's actual `bg-accent`/`text-accent-foreground` | Swapped to correct tokens — confirmed project convention: use `accent` for active/selected states                                                             |
|   22 | **NEW: Table appeared to have a fixed-height scrollbox clipping rows**           | Turned out to be a symptom of bug #20 (dropdown escaping its container), not a real `max-h` constraint                              | Resolved automatically once #20 was fixed — no table CSS changed                                                                                              |
|   23 | **NEW: Public `StaffCard` was not clickable — `StaffProfileModal` never opened** | `StaffCard` rendered as a plain `<div>` with no click handler; `StaffSection.tsx` never held modal-open state                       | `StaffCard` converted to a `<button>` with `onClick` prop; `StaffSection.tsx` now manages `selectedStaff` state and renders `StaffProfileModal` conditionally |
|   24 | **NEW: `StaffCardItem`'s bottom action-row labels visually clipped**             | Insufficient vertical padding (`py-3`) combined with no `truncate`/`leading-tight` on longer labels like "Attendance"               | Increased padding, switched to `flex-col` icon-over-label layout, added `truncate` + `leading-tight`                                                          |
|   25 | **NEW: `Modal` call site rendered literal text "member.name"**                   | `subtitle={\`member.name\`}` — backticks around a plain property access produced a literal string instead of the interpolated value | Fixed to `subtitle={member.name}`                                                                                                                             |

---

## 11. Immediate Next Steps

```text
1. Decide on StaffRosterCard interaction consistency
   └── Currently the only staff-module component NOT using the new
       Modal pattern — deliberate "quick action" exception, or should
       it align? Needs an explicit decision, not silent drift.

        ↓

2. Build the day-by-day attendance calendar grid view
   └── Still not built — backend's getMonthlyAttendance() already
       returns a records[] array with every marked date, unused on
       frontend. This is now flagged across 3 consecutive sessions.

        ↓

3. Add frontend test coverage for the staff module
   └── Zero tests, unchanged across 2 sessions of active UI work.
       Backend already has 14 passing tests for this module.

        ↓

4. Verify Category page wiring (3 sessions overdue)

        ↓

5. Spot-check the dark-mode "done" claim (3 sessions overdue)

        ↓

6. Housekeeping (carried over, still not done)
   ├── Delete features/messaging/components/Socketprovider.tsx
   └── Delete frontend/features/profile copy 10/11/12

        ↓

7. Seller settings + shipping pages (currently empty)

        ↓

8. Admin platform-broadcast composer UI

        ↓

9. Real search-analytics for "trending searches"
```

---

## 12. Continuation Prompt

> This is a Next.js 16 (Turbopack) multi-vendor e-commerce marketplace
> frontend ("Amitora Market") using TypeScript, Tailwind CSS v4, Redux
> Toolkit, Axios, HttpOnly JWT authentication, WebAuthn passkeys, and
> Socket.io for real-time chat/broadcasts/order pings/notifications.
> Auth, profile, shop, cart, checkout, buyer + seller orders,
> logistics/tracking, wishlist, seller dashboard, messaging, the full
> admin panel, notifications, Product Variants, Specifications,
> Reviews/Ratings, Related Products, Search, and a full Shop Staff /
> Team Management module (built 2026-08-20, **UI substantially
> redesigned 2026-08-26**) are all built and wired. **Read section 0
> (TL;DR) before suggesting new work.**
> **New this session, know before touching staff UI**: (1)
> `components/ui/Modal.tsx` is now the project-wide reusable dialog —
> portal-based, Esc-to-close, mobile bottom-sheet, body-scroll-lock.
> Use it for any new "open in overlay" need instead of building
> another bespoke modal. (2) Staff has a Card view and Table view,
> toggleable, preference saved to `localStorage`. (3) Add/Edit/
> Attendance all open in `Modal` now, not inline expansion — this was
> a deliberate interaction-model change per explicit user request,
> validated first as a standalone HTML mockup before porting to React.
> (4) `StaffActionsMenu`'s dropdown must stay portal-rendered
> (`createPortal` to `document.body`) — reverting to plain `absolute`
> positioning reintroduces the clipping bug inside the table's
> `overflow-x-auto` wrapper. (5) This project's correct "active/
> selected state" token is `accent` (`bg-accent`/`text-accent-
foreground`), not `primary` — confirmed by a real bug this session.
> (6) `StaffRosterCard.tsx` (seller dashboard sidebar) was
> **deliberately not touched** this session and still uses inline
> Present/Absent buttons rather than the modal pattern — this is an
> open decision, not an oversight, see section 0/11.
> **Known open items, in priority order**: (1) day-by-day attendance
> calendar grid not built (3 sessions flagged); (2) zero frontend
> tests for the staff module; (3) `StaffRosterCard` consistency
> decision pending; (4) Category page-wiring unconfirmed (3 sessions);
> (5) dark-mode migration unverified (3 sessions).
> **Trip-hazards for this codebase**: (1) two SocketProvider files —
> `providers/SocketProvider.tsx` is canonical, `features/messaging/
components/Socketprovider.tsx` is dead, never add listeners there.
> (2) `createAsyncThunk<A, B, C>(...)` generic brackets have been
> silently stripped on paste four separate times (`reviewSlice`,
> `searchSlice`, `Adminslice`, `staffSlice`) — any "X only refers to a
> type" or "Expected 2-3 arguments" error in a thunk file is almost
> certainly this. (3) `as const` nav-item arrays require every entry
> to share the exact same shape. (4) When writing code that imports a
> shared middleware/util/component you haven't personally read, ask
> for its real content first — guessing has cost multiple debugging
> rounds across this project's history (see backend handoff for the
> full list). (5) **New this session**: double-check template-literal
> usage in copy-pasted JSX — a stray backtick around a plain property
> access (`` `member.name` `` vs `member.name`) silently produces a
> literal string instead of the interpolated value, with no compiler
> error. Business logic lives under `features/<name>/{types,store,
components}` with a barrel `index.ts`; routing/thin page components
> live under `app/`; shared visual primitives live under `components/
ui/` (now including `Modal.tsx`); all app-wide providers are
> composed in `providers/AppProvider.tsx`. Admin sub-resources all live
> in ONE `Adminslice.ts`. `(public)` and `(auth)` are route groups;
> `seller`, `buyer`, `admin` are NOT. Dynamic route `params` is a
> Promise per Next.js 16. Category is referenced by **slug**, never
> ObjectId. Payment gateway integration is intentionally stopped.
> **Before treating any status in this doc as current — especially a
> ❌ or "Not Started" or "reported complete" — prefer a quick file read
> over trusting the text.** This doc has drifted from actual code
> multiple times before.

---

<!-- ===================== PRIOR SESSIONS BELOW (v7 and earlier, preserved for history) ===================== -->

> **2026-08-20** (v7 — Shop Staff / Team Management
> frontend built end-to-end and wired into 3 surfaces: seller Team tab,
> seller dashboard sidebar, and the public shop page)

_(v7 and all earlier sections preserved in full below this line — see
prior handoff exports for complete v6/v5/v4 history if needed. Trimmed
here for length; the v7 section 0/3/4/6/7/10/11/12 content from the
previous handoff remains valid as historical record and is superseded
by the v8 sections above wherever they overlap.)_
