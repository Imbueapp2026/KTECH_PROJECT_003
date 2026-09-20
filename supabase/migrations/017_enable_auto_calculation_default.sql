-- =========================================================
-- Migration 017 — Enable auto-calculation as default for all products
-- =========================================================

-- Change default value for price_auto_calculated to true
alter table products 
  alter column price_auto_calculated set default true;

-- Enable auto-calculation for all existing products
update products 
  set price_auto_calculated = true 
  where price_auto_calculated = false;

-- Set reasonable default values for existing products that don't have gold pricing fields
-- These are common defaults for jewelry products
update products 
  set 
    purity_carats = 22,  -- 22K is common in India
    weight_grams = 10,   -- Default 10g weight
    making_charge_type = 'percent',
    making_charge_percent = 10,  -- 10% making charge is typical
    gold_price_used = 6500  -- Default gold price
  where 
    purity_carats is null 
    or weight_grams is null 
    or making_charge_type is null
    or making_charge_percent is null;

-- Recalculate prices for all products using current gold price
-- This will update prices based on the new default values
do $$
declare
  current_gold_price numeric;
begin
  -- Get current gold price or use default
  select price_per_gram into current_gold_price 
  from gold_prices 
  where is_current = true 
  limit 1;
  
  if current_gold_price is null then
    current_gold_price := 6500; -- Default fallback
  end if;
  
  -- Recalculate all products
  update products
  set 
    price = calculate_product_price(
      purity_carats,
      weight_grams,
      making_charge_type,
      making_charge_percent,
      making_charge_flat,
      current_gold_price
    ),
    gold_price_used = current_gold_price,
    updated_at = now()
  where price_auto_calculated = true;
  
  raise notice 'Recalculated prices for all products using gold price: %', current_gold_price;
end $$;
