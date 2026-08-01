# E-Commerce Marketplace Frontend

This README is the **frontend development status and architecture handoff document**.

If this file is provided in a new ChatGPT/AI conversation, use it to understand what has already been completed and continue from the **Next Development Step**. Do not rebuild completed frontend foundation files unless a change is specifically required.

---

## 1. Project Overview

This is the frontend for a **large multi-vendor e-commerce marketplace**.

The application has three major interfaces:

1. **Buyer / Customer Marketplace**
2. **Seller Dashboard**
3. **Admin Dashboard**

The home page is intended to work as the main marketplace discovery page where products from different vendors will eventually be displayed by categories, offers, featured products, trending products, best sellers, new arrivals, and recommendations.

The backend was developed separately and the frontend will connect to those backend APIs gradually.

---

# 2. Frontend Technology

The frontend is built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Redux Toolkit planned for application state and backend API state
- Axios planned for backend communication

Project location:

```text
frontend/
```

The project was originally bootstrapped using `create-next-app`.

---

# 3. Development Approach

The frontend is being developed **step by step**.

Do not attempt to build the entire application at once.

Current development order:

```text
Global foundation
      ↓
Navbar / Footer
      ↓
Redux Store
      ↓
Redux Provider
      ↓
Feature slices
      ↓
Backend API connection
      ↓
Homepage components
      ↓
Buyer pages
      ↓
Authentication
      ↓
Seller dashboard
      ↓
Admin dashboard
```

Reusable components should be added gradually when they are actually required.

---

# 4. COMPLETED — Global Root Layout

File:

```text
📄 app/layout.tsx
```

Status:

```text
✅ COMPLETE
```

The root layout currently handles:

- Global HTML structure
- `<html>`
- `<body>`
- Geist font
- Geist Mono font
- `globals.css`
- Global metadata
- Global background/text styling

The root layout should remain primarily a **Server Component**.

Later, the Redux Provider will be connected here without converting the entire root layout into a Client Component.

Expected future structure:

```text
RootLayout
    │
    └── ReduxProvider
            │
            └── children
```

---

# 5. COMPLETED — Homepage Foundation

The homepage has been intentionally kept minimal.

Status:

```text
✅ BASIC FOUNDATION COMPLETE
```

The page should eventually become the main buyer marketplace page.

Current concept:

```text
Homepage
│
├── Navbar
├── Main Content
└── Footer
```

The main content is intentionally mostly empty because homepage components will be added one at a time.

Planned future homepage sections include:

```text
Hero / Promotional Banner
        ↓
Categories
        ↓
Deals / Offers
        ↓
Featured Products
        ↓
Trending Products
        ↓
Best Sellers
        ↓
New Arrivals
        ↓
Recommended Products
```

Do NOT put all of this markup directly inside `page.tsx`.

These should eventually become components under:

```text
features/home/components/
```

Example future composition:

```tsx
<HeroBanner />
<CategorySection />
<DealsSection />
<FeaturedProducts />
<TrendingProducts />
<BestSellerSection />
<NewArrivalSection />
<RecommendedProducts />
```

---

# 6. COMPLETED — Global Error Page

File:

```text
📄 app/error.tsx
```

Status:

```text
✅ COMPLETE
```

Important:

`error.tsx` MUST be a Client Component.

It contains:

```tsx
"use client";
```

The error page includes:

- Error UI
- Error icon
- "Something went wrong" message
- Try Again button
- `reset()` support
- Homepage navigation
- Error digest/reference support
- Console error logging

Do not remove `"use client"` from this file.

---

# 7. COMPLETED — Global Loading Page

File:

```text
📄 app/loading.tsx
```

Status:

```text
✅ COMPLETE
```

A marketplace-style skeleton loading interface has been created.

It contains skeleton placeholders for:

- Hero/banner
- Categories
- Product sections
- Product cards

It does NOT require `"use client"`.

Next.js automatically uses this special file during route loading where applicable.

---

# 8. COMPLETED — Global 404 Page

File:

```text
📄 app/not-found.tsx
```

Status:

```text
✅ COMPLETE
```

The custom 404 page includes:

- Large 404 display
- Page Not Found message
- Homepage navigation
- Browse Products navigation
- Responsive design

It uses Next.js `Link`.

---

# 9. COMPLETED — Buyer Navbar

File:

```text
📄 components/common/Navbar.tsx
```

Status:

```text
✅ INITIAL VERSION COMPLETE
```

This is the **buyer/public marketplace navbar**.

It is NOT intended to be reused as the complete Seller or Admin navbar.

The navbar is a Client Component because it currently contains interactive behavior.

Features currently implemented:

- Marketplace branding
- Home navigation
- Shop navigation
- Category navigation
- Deals navigation
- Product search
- Wishlist icon
- Account icon
- Cart icon
- Cart quantity placeholder
- Start Selling link
- Mobile navigation
- Mobile menu
- Mobile search
- Category/discovery navigation
- Responsive design

The navbar was intentionally designed **not to copy Amazon's visual design**.

It uses a:

- Light interface
- Rounded search bar
- Minimal navigation
- Icon-based actions
- Category discovery pills
- Start Selling CTA

The navbar content was changed to use the **full available page width** rather than being restricted by `max-w-7xl`.

Horizontal padding should still remain.

Example:

```text
w-full px-4 sm:px-6 lg:px-8
```

Do not use `w-screen` unnecessarily.

---

# 10. COMPLETED — Buyer Footer

File:

```text
📄 components/common/Footer.tsx
```

Status:

```text
✅ INITIAL VERSION COMPLETE
```

Footer currently contains:

### Marketplace branding

- Marketplace logo placeholder
- Marketplace description
- Secure Shopping badge
- Trusted Sellers badge

### Shop links

- All Products
- Categories
- Today's Deals
- New Arrivals

### Customer links

- My Account
- My Orders
- Wishlist
- Cart

### Support

- Help Center
- Shipping
- Returns
- Contact Us

### Company

- About Us
- Sell With Us
- Privacy Policy
- Terms & Conditions

### Marketplace benefits

- Secure Payments
- Fast Delivery
- Easy Returns
- Customer Support

### Bottom section

- Dynamic current year
- Copyright
- Privacy
- Terms
- Cookies

The footer has also been changed to use the **full available page width**.

---

# 11. Navbar Architecture Decision

Do NOT try to make one giant Navbar component support Buyer + Seller + Admin through many props.

The interfaces have different responsibilities.

Use:

```text
📁 components
│
├── 📁 common
│   ├── 📄 Navbar.tsx
│   ├── 📄 Footer.tsx
│   ├── 📄 Logo.tsx
│   └── 📄 SearchBar.tsx
│
├── 📁 seller
│   ├── 📄 SellerNavbar.tsx
│   └── 📄 SellerSidebar.tsx
│
└── 📁 admin
    ├── 📄 AdminNavbar.tsx
    └── 📄 AdminSidebar.tsx
```

The complete navbars are different.

Small reusable UI pieces can be shared.

Example:

```text
                   Logo.tsx
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
      BuyerNavbar SellerNavbar AdminNavbar
```

---

# 12. Routing Decision

Next.js Route Groups such as:

```text
(buyer)
(seller)
(admin)
```

do NOT appear in the URL.

This previously caused a routing conflict between:

```text
(buyer)/products/[slug]
```

and:

```text
(seller)/products/[id]
```

because Next.js interpreted both as:

```text
/products/:dynamic
```

Therefore Seller and Admin need real URL namespaces.

Recommended architecture:

```text
📁 app
│
├── 📁 (buyer)
│
├── 📁 seller
│
└── 📁 admin
```

Buyer:

```text
/products
/products/[slug]
/category/[slug]
/cart
/checkout
/wishlist
/orders
/profile
/search
```

Seller:

```text
/seller/dashboard
/seller/products
/seller/products/new
/seller/products/[id]/edit
/seller/inventory
/seller/orders
/seller/logistics
/seller/analytics
```

Admin:

```text
/admin/dashboard
/admin/users
/admin/shops
/admin/products
/admin/categories
/admin/orders
/admin/settings
```

---

# 13. Buyer Layout Decision

Eventually the buyer pages should share one layout:

```text
app/(buyer)/layout.tsx
```

That layout should provide:

```text
Navbar
   ↓
Buyer Page
   ↓
Footer
```

This avoids manually importing Navbar/Footer into:

```text
/products
/cart
/orders
/wishlist
/category
...
```

The homepage should also belong to the buyer/storefront layout if `/` needs the same Navbar/Footer.

Target:

```text
📁 app
│
└── 📁 (buyer)
    ├── 📄 layout.tsx
    ├── 📄 page.tsx
    ├── 📁 products
    ├── 📁 category
    ├── 📁 cart
    ├── 📁 checkout
    ├── 📁 wishlist
    ├── 📁 orders
    ├── 📁 profile
    └── 📁 search
```

Because `(buyer)` is a Route Group:

```text
app/(buyer)/page.tsx
```

still maps to:

```text
/
```

---

# 14. Redux Architecture Decision

Redux Toolkit will be used for application state.

Important architectural decision:

**Do NOT create one giant global `store/slices` folder containing every feature slice.**

Each feature owns its own Redux logic.

Example:

```text
📁 features
│
├── 📁 product
│   └── 📁 store
│       ├── 📄 productSlice.ts
│       └── 📄 productSelector.ts
│
├── 📁 cart
│   └── 📁 store
│       ├── 📄 cartSlice.ts
│       └── 📄 cartSelector.ts
│
├── 📁 auth
│   └── 📁 store
│       ├── 📄 authSlice.ts
│       └── 📄 authSelector.ts
│
└── 📁 order
    └── 📁 store
        ├── 📄 orderSlice.ts
        └── 📄 orderSelector.ts
```

The global store only combines reducers.

```text
📁 store
├── 📄 store.ts
└── 📄 hooks.ts
```

No:

```text
❌ store/slices/
```

---

# 15. Redux API Strategy

The current planned approach is Redux Toolkit slices/thunks for backend-connected feature state.

A typical feature slice may handle:

```text
pending
fulfilled
rejected
```

Example state:

```text
data
loading
error
```

Components will interact through typed Redux hooks:

```text
useAppDispatch()
useAppSelector()
```

Selectors should be separated when useful:

```text
productSelector.ts
cartSelector.ts
authSelector.ts
```

At this stage, do NOT create a separate `api/` folder inside every feature merely for organizational symmetry.

Example:

```text
📁 product
│
├── 📁 store
│   ├── 📄 productSlice.ts
│   └── 📄 productSelector.ts
│
├── 📁 components
│   ├── 📄 ProductCard.tsx
│   ├── 📄 ProductGrid.tsx
│   └── 📄 ProductForm.tsx
│
└── 📁 types
    └── 📄 product.types.ts
```

Architecture can be split further later if individual slices become too large.

---

# 16. Planned Global Redux Setup

These files are the next important foundation:

```text
📁 store
│
├── 📄 store.ts
└── 📄 hooks.ts

📁 providers
└── 📄 ReduxProvider.tsx
```

Responsibilities:

### `store/store.ts`

Configure Redux and combine feature reducers.

Future example:

```text
authReducer
productReducer
categoryReducer
cartReducer
orderReducer
wishlistReducer
sellerReducer
adminReducer
...
        ↓
configureStore()
```

### `store/hooks.ts`

Provide typed hooks:

```text
useAppDispatch
useAppSelector
```

### `providers/ReduxProvider.tsx`

Client Component containing:

```tsx
<Provider store={store}>{children}</Provider>
```

Then connect it to the root application layout.

---

# 17. Backend Communication Architecture

Planned shared HTTP infrastructure:

```text
📁 services
├── 📄 axios.ts
└── 📄 interceptor.ts
```

`axios.ts`:

- Shared Axios instance
- Backend base URL
- Credentials/configuration where required

`interceptor.ts`:

- Authentication/token behavior
- Shared request handling
- Shared response/error handling

Feature-specific Redux logic will use this shared HTTP infrastructure.

---

# 18. Planned Feature Structure

Target:

```text
📁 features
│
├── 📁 home
├── 📁 auth
├── 📁 product
├── 📁 category
├── 📁 shop
├── 📁 cart
├── 📁 order
├── 📁 logistics
├── 📁 upload
├── 📁 payment
├── 📁 messaging
├── 📁 seller
├── 📁 admin
├── 📁 wishlist
├── 📁 notification
└── 📁 search
```

Typical feature:

```text
📁 feature-name
│
├── 📁 store
│   ├── 📄 featureSlice.ts
│   └── 📄 featureSelector.ts
│
├── 📁 components
│
└── 📁 types
    └── 📄 feature.types.ts
```

Not every feature must contain every folder immediately.

Create folders/files when they are actually needed.

---

# 19. Homepage Feature

Planned:

```text
📁 features
└── 📁 home
    │
    ├── 📁 store
    │   ├── 📄 homeSlice.ts
    │   └── 📄 homeSelector.ts
    │
    ├── 📁 components
    │   ├── 📄 HeroBanner.tsx
    │   ├── 📄 CategorySection.tsx
    │   ├── 📄 DealsSection.tsx
    │   ├── 📄 FeaturedProducts.tsx
    │   └── 📄 RecommendedProducts.tsx
    │
    └── 📁 types
        └── 📄 home.types.ts
```

Do not build these all at once.

---

# 20. Server vs Client Component Strategy

Default preference:

```text
Server Component
```

Use `"use client"` only when necessary.

Typical Server Components:

```text
page.tsx
layout.tsx
Footer.tsx
static display components
```

Typical Client Components:

```text
Navbar with menu/search state
ReduxProvider
interactive forms
cart controls
modals
dropdowns
filters
components using Redux hooks
components using browser APIs
```

Do NOT put `"use client"` at the top of large page trees unnecessarily.

Keep the client boundary as small as practical.

---

# 21. Current High-Level Structure

```text
frontend/
│
├── 📁 app
│   ├── 📁 (auth)
│   ├── 📁 (buyer)
│   ├── 📁 seller
│   ├── 📁 admin
│   ├── 📁 chat
│   ├── 📄 layout.tsx
│   ├── 📄 loading.tsx
│   ├── 📄 error.tsx
│   ├── 📄 not-found.tsx
│   ├── 📄 globals.css
│   └── 📄 favicon.ico
│
├── 📁 components
│   ├── 📁 ui
│   ├── 📁 common
│   ├── 📁 seller
│   └── 📁 admin
│
├── 📁 features
│   ├── 📁 home
│   ├── 📁 auth
│   ├── 📁 product
│   ├── 📁 category
│   ├── 📁 shop
│   ├── 📁 cart
│   ├── 📁 order
│   ├── 📁 logistics
│   ├── 📁 upload
│   ├── 📁 payment
│   ├── 📁 messaging
│   ├── 📁 seller
│   ├── 📁 admin
│   ├── 📁 wishlist
│   ├── 📁 notification
│   └── 📁 search
│
├── 📁 services
│   ├── 📄 axios.ts
│   └── 📄 interceptor.ts
│
├── 📁 store
│   ├── 📄 store.ts
│   └── 📄 hooks.ts
│
├── 📁 providers
│   └── 📄 ReduxProvider.tsx
│
├── 📁 hooks
├── 📁 lib
├── 📁 types
├── 📁 utils
├── 📁 constants
├── 📁 config
├── 📁 public
│
├── 📄 middleware.ts
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 next.config.ts
```

Some files/folders above are **target architecture** and may not yet contain implementation.

---

# 22. Current Progress

| Area                                       | Status                      |
| ------------------------------------------ | --------------------------- |
| Next.js project setup                      | ✅ Complete                 |
| TypeScript setup                           | ✅ Complete                 |
| Tailwind setup                             | ✅ Complete                 |
| Root layout                                | ✅ Complete                 |
| Global CSS foundation                      | ✅ Complete                 |
| Homepage foundation                        | ✅ Complete                 |
| Error page                                 | ✅ Complete                 |
| Loading skeleton                           | ✅ Complete                 |
| 404 page                                   | ✅ Complete                 |
| Buyer Navbar                               | ✅ Initial version complete |
| Buyer Footer                               | ✅ Initial version complete |
| Full-width Navbar/Footer adjustment        | ✅ Complete                 |
| Buyer/Seller/Admin navigation architecture | ✅ Decided                  |
| Feature-based Redux architecture           | ✅ Decided                  |
| Redux store implementation                 | ⏳ Next                     |
| Typed Redux hooks                          | ⏳ Next                     |
| Redux Provider                             | ⏳ Next                     |
| Axios configuration                        | ⏳ Pending                  |
| Backend API integration                    | ⏳ Pending                  |
| Authentication frontend                    | ⏳ Pending                  |
| Product feature                            | ⏳ Pending                  |
| Cart integration                           | ⏳ Pending                  |
| Homepage dynamic data                      | ⏳ Pending                  |
| Seller dashboard UI                        | ⏳ Pending                  |
| Admin dashboard UI                         | ⏳ Pending                  |

---

# 23. NEXT DEVELOPMENT STEP

**Do not start Seller/Admin pages yet.**

The next task is the Redux foundation.

Implement in this order:

```text
1. store/store.ts
        ↓
2. store/hooks.ts
        ↓
3. providers/ReduxProvider.tsx
        ↓
4. Connect ReduxProvider to app/layout.tsx
        ↓
5. Verify Redux works
```

After Redux foundation works:

```text
services/axios.ts
        ↓
services/interceptor.ts
        ↓
first feature slice
```

The first backend-connected feature should then be selected based on dependency order, likely authentication/category/product rather than building random UI pages.

---

# 24. Important Instructions for Future Development

When continuing this project:

1. Do not rebuild files marked complete unless necessary.
2. Develop one architectural layer at a time.
3. Keep pages small.
4. Put feature-specific components inside their feature.
5. Keep truly reusable UI inside `components/`.
6. Keep Redux feature state inside `features/<feature>/store/`.
7. Keep only global Redux configuration inside `/store`.
8. Prefer Server Components by default.
9. Add `"use client"` only when the component actually needs client functionality.
10. Buyer, Seller and Admin should have separate navigation/layout systems.
11. Seller routes must use `/seller/...`.
12. Admin routes must use `/admin/...`.
13. Avoid duplicating Navbar/Footer manually across buyer pages once the buyer layout is established.
14. Backend integration should use the existing backend rather than mock APIs once API work starts.
15. Build the homepage gradually from reusable feature components.

---

# 25. Notes for AI Coding Assistants

The project may contain instructions similar to:

```text
This is NOT the Next.js you know.
```

When working with version-sensitive Next.js APIs, conventions, caching, routing, middleware, or file structure, inspect the documentation shipped with the installed Next.js package when necessary rather than assuming older Next.js behavior.

Do not blindly copy architecture from older Next.js tutorials.

---

# 26. Immediate Continuation Prompt

If this README is provided in a new conversation, continue with:

> We have completed the basic Next.js frontend foundation, global layout, homepage shell, global error/loading/404 pages, buyer Navbar, buyer Footer, routing decisions, and feature-based Redux architecture. Start from the Redux foundation. First help implement `store/store.ts`, then `store/hooks.ts`, then `providers/ReduxProvider.tsx`, and finally connect the provider to `app/layout.tsx`. Proceed step by step and explain where each file belongs.
