-- Add banner-related flags and fields to support featured content and banner management

-- Add featured flag to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add limited flag to products  
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_limited BOOLEAN DEFAULT false;

-- Add banner_priority for custom ordering
ALTER TABLE products ADD COLUMN IF NOT EXISTS banner_priority INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS banner_priority INTEGER DEFAULT 0;

-- Create indexes for banner queries
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured, banner_priority);
CREATE INDEX IF NOT EXISTS idx_products_limited ON products(is_limited, banner_priority);
