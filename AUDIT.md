# UI Audit Report

Date: 2026-09-23
Scope: Full frontend audit across both apps in this Turborepo.
Note: API routes were excluded from the UI route list; this audit covers page routes and visible components only.

---

## Public App: Route Inventory

- `/` — Home
- `/about` — About
- `/collections` — All collections
- `/collections/[slug]` — Category collection page
- `/contact` — Contact form
- `/products/[id]` — Product detail page
- `/store` — Redirect page to `/collections`
- `/thank-you` — Post-inquiry thank-you page

## Public App: Findings

### Critical

- File path + component name: `apps/public/src/app/about/page.tsx` (`AboutPage`); `apps/public/src/app/collections/page.tsx` (`CollectionsPage`); `apps/public/src/app/collections/CollectionsClient.tsx` (`CollectionsPage`); `apps/public/src/app/collections/[slug]/page.tsx` (`CategoryPage`); `apps/public/src/app/collections/[slug]/CategoryClient.tsx` (`CategoryPage`); `apps/public/src/app/products/[id]/page.tsx` (`ProductDetailPage`)
  - Route(s) affected: `/about`, `/collections`, `/collections/[slug]`, `/products/[id]`
  - Severity: Critical
  - Description: Missing route-level `loading.tsx` / `error.tsx` boundaries for every data-fetching segment, and the client loaders do not surface a fetch failure state; this is the same silent blank-state class that caused the earlier “no data, no skeleton, nothing” bug.
  - Fix: Add route-level loading and error files per segment and explicit `error` handling in each client fetcher.

- File path + component name: `apps/public/src/app/collections/CollectionsClient.tsx` (`CollectionsPage`)
  - Route(s) affected: `/collections`
  - Severity: Critical
  - Description: The SWR fetch is handled with `isLoading` but not `error`; failed requests silently render an empty catalog and give the user no actionable feedback.
  - Fix: Add `error` UI, retry affordance, and a non-empty fallback when the products endpoint fails.

- File path + component name: `apps/public/src/app/collections/[slug]/CategoryClient.tsx` (`CategoryPage`)
  - Route(s) affected: `/collections/[slug]`
  - Severity: Critical
  - Description: Category fetches and filtering work, but a failed category/products request still renders an empty state with no error messaging or recovery path.
  - Fix: Surface a true failure state plus a “View all collections” recovery action.

- File path + component name: `apps/public/src/components/Header.tsx` (`Header`)
  - Route(s) affected: All public routes beneath the shared layout
  - Severity: Critical
  - Description: The mobile nav and desktop category dropdown do not close on Escape, do not trap/focus correctly, and the click-away behavior is not robust for keyboard users; this is a navigation accessibility failure.
  - Fix: Add Escape-to-close, focus management, and click-outside handling to the menu and category popover.

### Moderate

- File path + component name: `apps/public/src/components/FeaturedFestivalSection.tsx` (`FeaturedFestivalSection`)
  - Route(s) affected: `/`
  - Severity: Moderate
  - Description: It fetches active festival / offer data in a background interval, but there is no explicit error, retry, or empty state UI for failed or empty responses beyond a text fallback; this makes the section feel unreliable during outages.
  - Fix: Add an explicit loading skeleton, empty-state card, and retry messaging before/after data fetch attempts.

- File path + component name: `apps/public/src/components/HomeProductsSection.tsx` (`HomeProductsSection`)
  - Route(s) affected: `/`
  - Severity: Moderate
  - Description: Loading skeleton exists, but no explicit error/empty-state fallback is present if product fetching fails; the section can silently render nothing after a network failure.
  - Fix: Add a fetch-failure card and empty-state copy for zero-product results.

- File path + component name: `apps/public/src/components/FilterSortBar.tsx` (`FilterSortBar`)
  - Route(s) affected: `/collections`, `/collections/[slug]`
  - Severity: Moderate
  - Description: Filter controls are functionally okay, but the mobile layout is cramped at narrow widths and the filter drawer relies on a simple open/close toggle without keyboard or screen-reader polish.
  - Fix: Increase mobile spacing, ensure interactive controls meet touch targets, and add better focus and label semantics.

- File path + component name: `apps/public/src/app/contact/page.tsx` (`ContactPage` / `ContactForm`)
  - Route(s) affected: `/contact`
  - Severity: Moderate
  - Description: The form has `required` fields but no inline validation feedback beyond a generic error banner after submission; invalid state is not exposed before the user submits.
  - Fix: Add field-level validation messages, `aria-invalid` states, and clearer inline instructions for required fields.

- File path + component name: `apps/public/src/components/ProductCard.tsx` (`ProductCard`); `apps/public/src/components/FeaturedFestivalSection.tsx` (`FeaturedFestivalSection`); `apps/public/src/components/Hero.tsx` (`Hero`)
  - Route(s) affected: `/`, `/collections`, `/collections/[slug]`, `/products/[id]`
  - Severity: Moderate
  - Description: Visual consistency is inconsistent across equivalent elements: cards mix `rounded-sm`, `rounded-lg`, and `rounded-xl`; some sections use `shadow-sm` while others use `shadow-md`; headings and product labels vary in font weight/size for essentially the same role.
  - Fix: Normalize spacing, radius, shadow, and heading typography to a single design system scale and reuse shared card/button patterns.

- File path + component name: `apps/public/src/app/thank-you/page.tsx` (`ThankYouPage`)
  - Route(s) affected: `/thank-you`
  - Severity: Moderate
  - Description: The success state is visually polished, but the button style and typography use hardcoded color values rather than shared theme tokens, and it repeats brand colors inconsistently with the rest of the app.
  - Fix: Replace hardcoded hex values with the existing design tokens (`gold`, `dusty-rose`, `charcoal`) and align button styling with the rest of the storefront.

- File path + component name: `apps/public/src/app/products/[id]/ProductDetailView.tsx` (`ProductDetailView`)
  - Route(s) affected: `/products/[id]`
  - Severity: Moderate
  - Description: The detail page is very dense and long, especially the technical specification panel; it is easy to miss the CTA and there is no progressive/summary-first layout on smaller screens.
  - Fix: Collapse the technical specs into an accordion or a short summary block and keep the inquiry CTA above the fold on mobile.

### Minor

- File path + component name: `apps/public/src/components/Header.tsx` (`Header`)
  - Route(s) affected: All routes with the shared header
  - Severity: Minor
  - Description: Header transitions are visually polished but not always semantically consistent; some navigation items are links while others are buttons, and the categories dropdown uses a mix of `button`/`Link` affordances that feel slightly inconsistent.
  - Fix: Align nav item semantics and interactive styling around a single pattern.

- File path + component name: `apps/public/src/components/FilterSortBar.tsx` (`FilterSortBar`)
  - Route(s) affected: `/collections`, `/collections/[slug]`
  - Severity: Minor
  - Description: The “occasion” filter is present in the UI but never used in the filtering logic, creating an affordance mismatch between the control and the actual results.
  - Fix: Either wire the filter up or remove the unused control to avoid dead UI.

- File path + component name: `apps/public/src/app/about/page.tsx` (`AboutPage`)
  - Route(s) affected: `/about`
  - Severity: Minor
  - Description: Some content blocks rely on fixed fallback hero imagery from remote sources instead of local brand assets; the page feels visually anchored to external images and lacks a stronger brand visual system.
  - Fix: Standardize the about-page visual system around curated local images and a defined editorial spacing scale.

---

## Admin App: Route Inventory

- `/login` — Admin sign-in
- `/forgot-password` — Password reset
- `/` — Dashboard home
- `/products` — Product list
- `/products/new` — Create product
- `/products/[id]` — Product detail
- `/products/[id]/edit` — Edit product
- `/inquiries` — Inquiry inbox
- `/categories` — Category list
- `/categories/new` — Create category
- `/categories/[id]` — Category detail
- `/offers` — Offers and discounts
- `/offers/new` — Create offer
- `/festivals` — Festival management
- `/festivals/new` — Create festival
- `/festivals/[id]` — Festival detail
- `/festivals/[id]/edit` — Edit festival
- `/analytics` — Analytics dashboard
- `/admin/banners` — Banner management

## Admin App: Findings

### Critical

- File path + component name: `apps/admin/src/app/admin/banners/page.tsx` (`BannersPage`)
  - Route(s) affected: `/admin/banners`
  - Severity: Critical
  - Description: This admin route is outside the `(dashboard)` layout and does not use `AuthGate`, so it can be opened without the admin session and is effectively exposed to non-admin access.
  - Fix: Move it under the protected dashboard route group or add a server/client auth guard before rendering.

- File path + component name: `apps/admin/src/app/(dashboard)/layout.tsx` (`DashboardLayout`); `apps/admin/src/components/shell/AuthGate.tsx` (`AuthGate`)
  - Route(s) affected: All `/`-nested dashboard routes
  - Severity: Critical
  - Description: The auth gate returns `null` while loading or when unauthenticated, leaving the user on a blank screen with no loading state, no message, and no recovery path; this is a high-friction auth UX issue and a silent failure pattern.
  - Fix: Render a real loading skeleton or redirect message and keep the user informed while auth is resolving.

- File path + component name: `apps/admin/src/app/(dashboard)/products/page.tsx` (`ProductsPage`); `apps/admin/src/components/products/ProductGrid.tsx` (`ProductGrid`)
  - Route(s) affected: `/products`
  - Severity: Critical
  - Description: The admin product grid renders the full product list on the client without pagination, filtering-driven slicing, or virtualization. Large catalogs will become slow and memory-heavy even before there is a real dataset.
  - Fix: Add server-side or client-side pagination and a max-page-size limit for large inventories.

- File path + component name: `apps/admin/src/app/(dashboard)/products/page.tsx` (`ProductsPage`); `apps/admin/src/app/(dashboard)/inquiries/page.tsx` (`InquiriesPage`); `apps/admin/src/app/(dashboard)/categories/page.tsx` (`CategoriesPage`); `apps/admin/src/app/(dashboard)/offers/page.tsx` (`OffersPage`); `apps/admin/src/app/(dashboard)/festivals/page.tsx` (`FestivalsPage`)
  - Route(s) affected: `/products`, `/inquiries`, `/categories`, `/offers`, `/festivals`
  - Severity: Critical
  - Description: There are no route-level `loading.tsx` or `error.tsx` files for the dashboard route segments, despite multiple async fetches and data-driven admin pages. This violates the earlier “no data, no skeleton, nothing” bug condition.
  - Fix: Create route segment loading/error boundaries per dashboard area and keep request failures explicit and recoverable.

### Moderate

- File path + component name: `apps/admin/src/app/(dashboard)/analytics/page.tsx` (`AnalyticsPage`)
  - Route(s) affected: `/analytics`
  - Severity: Moderate
  - Description: The component uses `bg-[var(--color-neutral)]` in multiple places, but `--color-neutral` is not defined in `apps/admin/src/app/globals.css`; this weakens the admin visual system and makes the dashboard styling inconsistent.
  - Fix: Replace undefined neutral tokens with the actual theme token set (`surface-muted`, `tertiary`, etc.) or add the missing design token.

- File path + component name: `apps/admin/src/app/(dashboard)/inquiries/page.tsx` (`InquiriesPage`)
  - Route(s) affected: `/inquiries`
  - Severity: Moderate
  - Description: The inquiry list has no sort, filter, or pagination controls and can grow unbounded; large inboxes will become difficult to manage and slow to render.
  - Fix: Add status filters, sort controls, and pagination or lazy loading for older inquiries.

- File path + component name: `apps/admin/src/app/(dashboard)/products/page.tsx` (`ProductsPage`); `apps/admin/src/components/products/ProductGrid.tsx` (`ProductGrid`)
  - Route(s) affected: `/products`, `/products/[id]`, `/categories/[id]`, `/festivals/[id]`
  - Severity: Moderate
  - Description: Product cards are visually consistent, but the list layout and status chips are still heavily card-based and dense; large inventories will feel overloaded and not guided toward the most important actions.
  - Fix: Introduce stronger grouping, summary chips, and scannable list hierarchy for high-volume catalog pages.

- File path + component name: `apps/admin/src/app/(dashboard)/offers/page.tsx` (`OffersPage`)
  - Route(s) affected: `/offers`
  - Severity: Moderate
  - Description: The page fetches offers and products in the same load, but there is no explicit empty state for an offer with no products beyond the product grid fallback; the UX becomes visually ambiguous when offers are present but empty.
  - Fix: Add more explicit copy and empty-state blocks for “offer exists but no products attached.”

- File path + component name: `apps/admin/src/app/(dashboard)/festivals/page.tsx` (`FestivalsPage`)
  - Route(s) affected: `/festivals`
  - Severity: Moderate
  - Description: The destructive “End Festival” action is protected by a confirm dialog, but the page still defaults to empty or “no active festivals” states without clear guidance on how to recover or create a new festival.
  - Fix: Add a clearer call-to-action and a better empty state with “Add Festival” emphasis.

- File path + component name: `apps/admin/src/components/shell/MobileTopbar.tsx` (`MobileTopbar`)
  - Route(s) affected: Mobile admin pages under `/` and nested dashboard routes
  - Severity: Moderate
  - Description: The mobile section title system is route-based but incomplete; not all dashboard pages map to a title entry, which can lead to empty mobile headers and inconsistent navigation context.
  - Fix: Add title mappings for every route and ensure the top bar still renders on all pages.

- File path + component name: `apps/admin/src/app/(dashboard)/page.tsx` (`DashboardPage`)
  - Route(s) affected: `/`
  - Severity: Moderate
  - Description: The dashboard loads several separate datasets with a single `Promise.all`, but the page uses many ad hoc alerts (`setError`) for non-blocking operations instead of structured notices; status messaging is inconsistent across price update, recalculation, and missing-data flows.
  - Fix: Standardize update notifications and limit the `error` banner to real failures while using toast or inline success states elsewhere.

### Minor

- File path + component name: `apps/admin/src/app/(dashboard)/categories/page.tsx` (`CategoriesPage`)
  - Route(s) affected: `/categories`
  - Severity: Minor
  - Description: The list uses a generated letter badge and card layout that is clear, but the “View products →” affordance is visually subtle and the card hover states are understated compared to the rest of the admin design system.
  - Fix: Increase hover contrast and make the action affordance more obvious.

- File path + component name: `apps/admin/src/components/ui/Button.tsx` (`Button`)
  - Route(s) affected: All admin pages using standard buttons
  - Severity: Minor
  - Description: Most button variants are consistent, but the use of hardcoded hover colors (`#9c7a48`, `#893e36`) bypasses theme tokens and makes the admin palette feel less systemized.
  - Fix: Replace custom hex hover values with semantic theme variables or design-token-driven variants.

- File path + component name: `apps/admin/src/components/ui/Input.tsx` (`Input`)
  - Route(s) affected: All admin forms
  - Severity: Minor
  - Description: The input component is generally consistent, but a few form pages use raw `<textarea>` / `<input>` blocks with custom classes instead of the shared component, creating a minor visual mismatch among similar fields.
  - Fix: Standardize all form controls on the shared input/textarea primitive and keep the spacing/radius consistent.

- File path + component name: `apps/admin/src/app/(dashboard)/festivals/[id]/page.tsx` (`FestivalDetailPage`)
  - Route(s) affected: `/festivals/[id]`
  - Severity: Minor
  - Description: There are two nearly identical `loadData` functions in the same component, which increases maintenance risk and can cause subtle divergence in future edits.
  - Fix: Consolidate data loading into a single fetch routine and reuse it for the page state updates.

---

## Coverage Summary

Public UI coverage:
- Routes audited: 8
- Shared components reviewed: Header, Footer, Hero, ProductCard, NewArrivalsStrip, BentoCategoryGrid, FilterSortBar, FeaturedFestivalSection, InquiryCTA, GoldPriceDisplay, CategoryIntro, TrustSection, etc.

Admin UI coverage:
- Routes audited: 19
- Shared components reviewed: AuthGate, Sidebar, MobileTopbar, ProductGrid, Button, Input, Badge, EmptyState, Skeleton, ConfirmDialog, Toast, ErrorBoundary

This audit did not include API route behavior or backend data integrity checks; it was scoped to UI route structure, page behavior, and component-level UX issues only.
