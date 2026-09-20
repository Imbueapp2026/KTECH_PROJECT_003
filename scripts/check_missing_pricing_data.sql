-- =========================================================
-- Backfill Check: Count products with missing gold pricing data
-- =========================================================
-- Run this query against your database to count products that need attention
-- This should be run after the migrations are applied

-- Count products with missing required gold pricing fields
SELECT 
  COUNT(*) as total_products_with_missing_data,
  COUNT(*) FILTER (WHERE purity_carats IS NULL) as missing_purity_carats,
  COUNT(*) FILTER (WHERE weight_grams IS NULL OR weight_grams <= 0) as missing_weight_grams,
  COUNT(*) FILTER (WHERE making_charge_type IS NULL) as missing_making_charge_type,
  COUNT(*) FILTER (WHERE making_charge_type = 'percent' AND (making_charge_percent IS NULL OR making_charge_percent < 0)) as missing_making_charge_percent,
  COUNT(*) FILTER (WHERE making_charge_type = 'flat' AND (making_charge_flat IS NULL OR making_charge_flat < 0)) as missing_making_charge_flat
FROM products
WHERE 
  purity_carats IS NULL 
  OR weight_grams IS NULL 
  OR weight_grams <= 0
  OR making_charge_type IS NULL
  OR (making_charge_type = 'percent' AND (making_charge_percent IS NULL OR making_charge_percent < 0))
  OR (making_charge_type = 'flat' AND (making_charge_flat IS NULL OR making_charge_flat < 0))
  AND status IN ('draft', 'published'); -- Only active products

-- To get the actual product IDs and names:
SELECT 
  id,
  name,
  CASE 
    WHEN purity_carats IS NULL THEN 'purity_carats'
    WHEN weight_grams IS NULL OR weight_grams <= 0 THEN 'weight_grams'
    WHEN making_charge_type IS NULL THEN 'making_charge_type'
    WHEN making_charge_type = 'percent' AND (making_charge_percent IS NULL OR making_charge_percent < 0) THEN 'making_charge_percent'
    WHEN making_charge_type = 'flat' AND (making_charge_flat IS NULL OR making_charge_flat < 0) THEN 'making_charge_flat'
  END as missing_field
FROM products
WHERE 
  purity_carats IS NULL 
  OR weight_grams IS NULL 
  OR weight_grams <= 0
  OR making_charge_type IS NULL
  OR (making_charge_type = 'percent' AND (making_charge_percent IS NULL OR making_charge_percent < 0))
  OR (making_charge_type = 'flat' AND (making_charge_flat IS NULL OR making_charge_flat < 0))
  AND status IN ('draft', 'published')
ORDER BY name;
