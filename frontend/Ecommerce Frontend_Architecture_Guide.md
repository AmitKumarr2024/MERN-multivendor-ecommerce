frontend/
│
├── 📁 app
│ │
│ ├── 📁 (auth)
│ │ ├── 📁 login
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 register
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 forgot-password
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 reset-password
│ │ │ └── 📄 page.tsx
│ │ └── 📁 passkey
│ │ └── 📄 page.tsx
│ │
│ ├── 📁 (buyer)
│ │ ├── 📄 page.tsx ← Home /
│ │ ├── 📄 layout.tsx ← Buyer Navbar + Footer
│ │ │
│ │ ├── 📁 products
│ │ │ ├── 📄 page.tsx
│ │ │ └── 📁 [slug]
│ │ │ └── 📄 page.tsx
│ │ │
│ │ ├── 📁 category
│ │ │ └── 📁 [slug]
│ │ │ └── 📄 page.tsx
│ │ │
│ │ ├── 📁 cart
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 checkout
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 wishlist
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 orders
│ │ │ ├── 📄 page.tsx
│ │ │ └── 📁 [id]
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 profile
│ │ │ └── 📄 page.tsx
│ │ └── 📁 search
│ │ └── 📄 page.tsx
│ │
│ ├── 📁 seller ← NOT (seller)
│ │ ├── 📄 layout.tsx ← Seller Navbar + Sidebar
│ │ ├── 📁 dashboard
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 shop
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 products
│ │ │ ├── 📄 page.tsx
│ │ │ ├── 📁 new
│ │ │ │ └── 📄 page.tsx
│ │ │ └── 📁 [id]
│ │ │ └── 📁 edit
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 inventory
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 orders
│ │ │ └── 📄 page.tsx
│ │ ├── 📁 logistics
│ │ │ └── 📄 page.tsx
│ │ └── 📁 analytics
│ │ └── 📄 page.tsx
│ │
│ ├── 📁 admin ← NOT (admin)
│ │ ├── 📄 layout.tsx ← Admin Navbar + Sidebar
│ │ ├── 📁 dashboard
│ │ ├── 📁 users
│ │ ├── 📁 shops
│ │ ├── 📁 products
│ │ ├── 📁 categories
│ │ ├── 📁 orders
│ │ └── 📁 settings
│ │
│ ├── 📁 chat
│ │ └── 📄 page.tsx
│ │
│ ├── 📄 layout.tsx ← Global Root Layout
│ ├── 📄 loading.tsx
│ ├── 📄 error.tsx
│ ├── 📄 not-found.tsx
│ ├── 📄 globals.css
│ └── 📄 favicon.ico
│
│
├── 📁 components
│ │
│ ├── 📁 ui
│ │ ├── 📄 Button.tsx
│ │ ├── 📄 Input.tsx
│ │ ├── 📄 Modal.tsx
│ │ ├── 📄 Spinner.tsx
│ │ ├── 📄 Skeleton.tsx
│ │ └── 📄 Pagination.tsx
│ │
│ ├── 📁 common
│ │ ├── 📄 Navbar.tsx ← Buyer Navbar
│ │ ├── 📄 Footer.tsx
│ │ ├── 📄 Logo.tsx
│ │ └── 📄 SearchBar.tsx
│ │
│ ├── 📁 seller
│ │ ├── 📄 SellerNavbar.tsx
│ │ └── 📄 SellerSidebar.tsx
│ │
│ └── 📁 admin
│ ├── 📄 AdminNavbar.tsx
│ └── 📄 AdminSidebar.tsx
│
│
├── 📁 features
│ │
│ ├── 📁 home
│ │ ├── 📁 store
│ │ │ ├── 📄 homeSlice.ts
│ │ │ └── 📄 homeSelector.ts
│ │ ├── 📁 components
│ │ │ ├── 📄 HeroBanner.tsx
│ │ │ ├── 📄 CategorySection.tsx
│ │ │ ├── 📄 DealsSection.tsx
│ │ │ ├── 📄 FeaturedProducts.tsx
│ │ │ └── 📄 RecommendedProducts.tsx
│ │ └── 📁 types
│ │ └── 📄 home.types.ts
│ │
│ ├── 📁 auth
│ │ ├── 📁 store
│ │ │ ├── 📄 authSlice.ts
│ │ │ └── 📄 authSelector.ts
│ │ ├── 📁 components
│ │ └── 📁 types
│ │ └── 📄 auth.types.ts
│ │
│ ├── 📁 product
│ │ ├── 📁 store
│ │ │ ├── 📄 productSlice.ts
│ │ │ └── 📄 productSelector.ts
│ │ ├── 📁 components
│ │ │ ├── 📄 ProductCard.tsx
│ │ │ ├── 📄 ProductGrid.tsx
│ │ │ └── 📄 ProductForm.tsx
│ │ └── 📁 types
│ │ └── 📄 product.types.ts
│ │
│ ├── 📁 category
│ │ ├── 📁 store
│ │ │ ├── 📄 categorySlice.ts
│ │ │ └── 📄 categorySelector.ts
│ │ ├── 📁 components
│ │ └── 📁 types
│ │
│ ├── 📁 shop
│ │ ├── 📁 store
│ │ │ ├── 📄 shopSlice.ts
│ │ │ └── 📄 shopSelector.ts
│ │ ├── 📁 components
│ │ └── 📁 types
│ │
│ ├── 📁 cart
│ │ ├── 📁 store
│ │ │ ├── 📄 cartSlice.ts
│ │ │ └── 📄 cartSelector.ts
│ │ ├── 📁 components
│ │ └── 📁 types
│ │
│ ├── 📁 order
│ │ ├── 📁 store
│ │ │ ├── 📄 orderSlice.ts
│ │ │ └── 📄 orderSelector.ts
│ │ ├── 📁 components
│ │ └── 📁 types
│ │
│ ├── 📁 logistics
│ │ ├── 📁 store
│ │ │ ├── 📄 logisticsSlice.ts
│ │ │ └── 📄 logisticsSelector.ts
│ │ ├── 📁 components
│ │ └── 📁 types
│ │
│ ├── 📁 upload
│ │ ├── 📁 store
│ │ │ ├── 📄 uploadSlice.ts
│ │ │ └── 📄 uploadSelector.ts
│ │ └── 📁 types
│ │
│ ├── 📁 payment
│ │ ├── 📁 store
│ │ │ ├── 📄 paymentSlice.ts
│ │ │ └── 📄 paymentSelector.ts
│ │ └── 📁 types
│ │
│ ├── 📁 messaging
│ │ ├── 📁 store
│ │ │ ├── 📄 messagingSlice.ts
│ │ │ └── 📄 messagingSelector.ts
│ │ └── 📁 components
│ │
│ ├── 📁 seller
│ │ ├── 📁 store
│ │ │ ├── 📄 sellerSlice.ts
│ │ │ └── 📄 sellerSelector.ts
│ │ └── 📁 types
│ │
│ ├── 📁 admin
│ │ ├── 📁 store
│ │ │ ├── 📄 adminSlice.ts
│ │ │ └── 📄 adminSelector.ts
│ │ └── 📁 types
│ │
│ ├── 📁 wishlist
│ │ ├── 📁 store
│ │ │ ├── 📄 wishlistSlice.ts
│ │ │ └── 📄 wishlistSelector.ts
│ │ └── 📁 components
│ │
│ ├── 📁 notification
│ │ ├── 📁 store
│ │ │ ├── 📄 notificationSlice.ts
│ │ │ └── 📄 notificationSelector.ts
│ │ └── 📁 components
│ │
│ └── 📁 search
│ ├── 📁 store
│ │ ├── 📄 searchSlice.ts
│ │ └── 📄 searchSelector.ts
│ ├── 📁 components
│ └── 📁 types
│
│
├── 📁 store ← ONLY global Redux setup
│ ├── 📄 store.ts ← combine all feature reducers
│ └── 📄 hooks.ts ← useAppDispatch/useAppSelector
│
├── 📁 providers
│ └── 📄 ReduxProvider.tsx ← "use client"
│
├── 📁 services
│ ├── 📄 axios.ts ← Axios instance
│ └── 📄 interceptor.ts ← token/error handling
│
├── 📁 hooks ← Global reusable hooks
├── 📁 lib
├── 📁 types ← Truly global/shared types only
├── 📁 utils
├── 📁 constants
├── 📁 config
│
├── 📁 public
│ ├── 📁 images
│ ├── 📁 icons
│ ├── 📁 logo
│ ├── 📁 banners
│ └── 📁 placeholder
│
├── 📄 middleware.ts
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 next.config.ts
