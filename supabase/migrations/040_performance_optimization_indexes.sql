-- 040_performance_optimization_indexes.sql
-- Optimizations for 2 CPU / 8 GB RAM server & high speed queries

-- 1. Index on offer_id for offer-based filtering
CREATE INDEX IF NOT EXISTS idx_products_offer_id ON products(offer_id);

-- 2. Index on price for minPrice/maxPrice range filters and price sorting
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- 3. Index on created_at for sorting and "new_only" queries
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 4. Partial composite index targeting the active public catalog
-- Filters for status = 'published' AND availability != 'sold' which are included in every public product query
CREATE INDEX IF NOT EXISTS idx_products_active_catalog 
ON products(category_id, created_at DESC) 
WHERE status = 'published' AND availability != 'sold';

-- 5. Inquiry status and created_at index for admin dashboard inquiry list
CREATE INDEX IF NOT EXISTS idx_inquiries_status_created 
ON inquiries(status, created_at DESC);
