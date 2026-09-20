# Frontend Executable Tasks

This document contains a prioritized list of executable tasks to bring the frontend to a production-ready state, adhering to the constraints that no database or backend changes are required.

## Phase 1: Security & Cleanup (Highest Priority)
- [ ] **[PUBLIC]** Remove `apps/public/.env.local` from Git tracking:
  - `git rm --cached apps/public/.env.local`
  - Ensure `.gitignore` ignores `.env.local` globally or at the package level.
- [ ] **[ADMIN]** Remove hardcoded Firebase fallback values in `apps/admin/src/lib/auth/firebase-client.ts`. The file should rely purely on `process.env` (via the validated `env.ts`).

## Phase 2: Performance & SEO (High Priority)
- [ ] **[PUBLIC]** Migrate `<img>` tags to Next.js `<Image>` components:
  - `apps/public/src/components/ProductCard.tsx`
  - `apps/public/src/components/FeaturedFestivalSection.tsx`
  - `apps/public/src/components/BentoCategoryGrid.tsx`
  - Ensure the `next.config.ts` remote patterns are correctly configured to handle these sources (already appears to be configured for Supabase and Unsplash).
- [ ] **[PUBLIC]** Refactor Data Fetching:
  - `apps/public/src/app/collections/page.tsx` and `apps/public/src/app/collections/[slug]/page.tsx` should either fetch data on the server side (`await fetch()`) in the Server Component and pass initial data to a Client Component for filtering, or use SWR/React Query to prevent blank initial states and layout shifts.
- [ ] **[PUBLIC]** Enhance SEO Meta Tags:
  - Add dynamic `generateMetadata` exports to product and collection pages to enable OpenGraph sharing (image, title, description).

## Phase 3: UX & Polish (Medium Priority)
- [ ] **[PUBLIC]** Accessibility Improvements:
  - Add descriptive `aria-label` attributes to the Filter/Sort sidebar toggle buttons and social links in the Footer.
- [ ] **[ADMIN]** UI Improvements:
  - Add a dedicated `<EmptyState>` to `apps/admin/src/app/(dashboard)/inquiries/page.tsx` that visually matches the other empty states (currently it's just a simple div).
  - Review and fix `DatabaseKeepAlive` location (currently imported or existing in `public` but conceptually might be needed in `admin` if Supabase goes idle).
  - Add loading skeletons to the `apps/admin/src/app/(dashboard)/offers/page.tsx` for a smoother transition when offers are loading.

## Phase 4: Testing Setup (Low Priority / Future)
- [ ] **[SHARED]** Set up Vitest and Testing Library in the root or a new `packages/config-jest` to test `apps/admin/src/lib/utils.ts` and pricing logic.
- [ ] **[SHARED]** Initialize Playwright for E2E testing of the Public App's product browsing flow and the Admin App's login flow.
