-- =========================================================
-- Migration 020 — Backfill check: Count products with missing gold pricing data
-- =========================================================
-- This query is for informational purposes only to count products that need attention
-- Run this query to see how many products have missing required fields

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

-- Note: This migration is for informational purposes only and doesn't modify data
-- The actual count will be reported to the admin after running this query
