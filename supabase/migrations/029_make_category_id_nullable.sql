-- =========================================================
-- Migration 029 — Make category_id nullable in products table
-- Allows products to be created without a category selection
-- =========================================================

-- Make category_id nullable in products table safely
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN products.category_id IS 'Category reference (nullable - products can exist without category)';
