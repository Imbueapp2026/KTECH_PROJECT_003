-- =========================================================
-- Migration 018 — Force price_auto_calculated to always be true
-- =========================================================
-- Decision: Keep the column but always set it to true to avoid disrupting existing queries
-- This is less disruptive than dropping the column since it's referenced in existing SELECT statements

-- Ensure all products have price_auto_calculated set to true
update products 
set price_auto_calculated = true 
where price_auto_calculated = false;

-- Add a check constraint to ensure price_auto_calculated is always true
alter table products 
add constraint price_auto_calculated_must_be_true 
check (price_auto_calculated = true);

-- Update column comment to reflect new behavior
comment on column products.price_auto_calculated is 'Always true - price is always auto-calculated from gold pricing fields (purity, weight, making charge)';
