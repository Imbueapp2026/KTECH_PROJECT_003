# Admin Sync Service

This service provides real-time synchronization of offers, price data, and banners from the admin panel to the public site.

## Overview

The Admin Sync Service automatically fetches and updates:
- **Banners**: Featured categories and limited-edition products with priority ordering
- **Offers**: Active offers with discount information
- **Products**: Product data with associated offers and pricing

## Files

### Core Library
- `apps/public/src/lib/admin-sync.ts` - Main sync service with data fetching and real-time subscriptions

### React Hooks
- `apps/public/src/hooks/useAdminData.ts` - React hooks for easy component integration

### Updated Components
- `apps/public/src/components/ProductCard.tsx` - Now uses admin sync for real-time offer pricing
- `apps/public/src/components/FeaturedFestivalSection.tsx` - Uses admin sync for banner data

### Updated API Routes
- `apps/public/src/app/api/banner/route.ts` - Fetches from admin-managed tables
- `apps/public/src/app/api/offers/route.ts` - Fetches from admin-managed offers table

## Usage

### Basic Hook Usage

```tsx
import { useAdminData } from "@/hooks/useAdminData";

function MyComponent() {
  const { data, loading, error, refresh } = useAdminData({ 
    realtime: true,
    autoRefresh: true 
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Banners: {data?.banners.products.length}</h2>
      <h2>Offers: {data?.offers.length}</h2>
      <h2>Products: {data?.products.length}</h2>
    </div>
  );
}
```

### Specialized Hooks

```tsx
// For banner data only
import { useBannerData } from "@/hooks/useAdminData";

function BannerSection() {
  const { items, loading } = useBannerData();
  // items are formatted for the Banner component
}

// For offers data only
import { useOffersData } from "@/hooks/useAdminData";

function OffersSection() {
  const { offers, products, loading } = useOffersData();
  // offers: active offers with discounts
  // products: products with active offers
}

// For featured products only
import { useFeaturedProducts } from "@/hooks/useAdminData";

function FeaturedSection() {
  const { products, loading } = useFeaturedProducts();
  // products: limited + offer products
}
```

### Helper Functions

```tsx
import {
  getBannerItems,
  getProductsWithActiveOffers,
  getFeaturedProducts,
  calculateDiscountedPrice,
} from "@/lib/admin-sync";

// Get banner items for Banner component
const bannerItems = getBannerItems(data);

// Get products with active offers
const offerProducts = getProductsWithActiveOffers(data);

// Get featured products (limited + offers)
const featured = getFeaturedProducts(data);

// Calculate discounted price
const price = calculateDiscountedPrice(1000, offer);
```

## Real-time Updates

The service uses Supabase real-time subscriptions to automatically update when:
- Products are added/updated in admin
- Offers are created/modified in admin
- Categories are updated in admin

Components using the hooks will automatically re-render with fresh data.

## Admin Panel Integration

The sync service reads from these admin-managed tables:

### Products Table
- `is_limited` - Marks product as limited edition for banners
- `banner_priority` - Controls display order in banners (higher = first)
- `offer_id` - Links product to an offer
- `price` - Base price (discounts calculated from offers)

### Categories Table
- `is_featured` - Marks category as featured for banners
- `banner_priority` - Controls display order in banners

### Offers Table
- `is_active` - Whether offer is currently active
- `start_date` / `end_date` - Offer validity period
- `applied_to_all` - Whether offer applies to all products
- `discounts` - Related discount records (percentage or flat)

## API Endpoints

The service enhances existing public API endpoints:

### GET /api/banner
Returns banner items ordered by admin-set priorities.

### GET /api/offers
Returns products with active offers and discount information.

## Data Flow

```
Admin Panel (updates)
    ↓
Supabase Database
    ↓
Real-time Subscriptions
    ↓
admin-sync.ts (fetches & caches)
    ↓
useAdminData Hook (React)
    ↓
Components (ProductCard, Banner, etc.)
```

## Caching

The service maintains an in-memory cache to reduce database queries:
- Initial fetch loads all data
- Real-time updates refresh cache on changes
- Optional auto-refresh every 5 minutes
- Manual refresh available via `refresh()` function

## Error Handling

The service includes error handling for:
- Network failures
- Database errors
- Invalid data formats
- Subscription failures

Components receive error state via the hook's `error` property.

## Performance

- Single initial fetch for all data (banner, offers, products)
- Efficient real-time subscriptions
- Optimized queries with proper indexing
- Caching to reduce database load
- Optional auto-refresh with configurable interval

## Future Enhancements

Potential improvements:
- Add server-side rendering support
- Implement local storage persistence
- Add analytics for sync performance
- Support for offline mode
- More granular subscription options
