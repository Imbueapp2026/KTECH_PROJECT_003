-- Add performance indexes for frequently queried columns

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);

-- Gold prices table index for timestamp-based queries
CREATE INDEX IF NOT EXISTS idx_gold_prices_updated_at ON gold_prices(updated_at DESC);

-- Products composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status);
