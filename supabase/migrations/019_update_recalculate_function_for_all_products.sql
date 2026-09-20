-- =========================================================
-- Migration 019 — Update recalculate function to handle all products and missing data
-- =========================================================
-- This replaces the previous recalculate_auto_priced_products function with a new version that:
-- 1. Processes ALL products (not just those with price_auto_calculated = true)
-- 2. Gracefully handles products with missing data
-- 3. Returns information about skipped products
-- 4. Continues processing other products even if some are skipped

-- Drop the old function
drop function if exists recalculate_auto_priced_products;

-- Create new function that handles all products and returns skipped products
create or replace function recalculate_all_products_with_missing_data(p_gold_price_per_gram numeric)
returns json
language plpgsql
as $$
declare
  product_record record;
  updated_products jsonb := '[]'::jsonb;
  skipped_products jsonb := '[]'::jsonb;
  missing_fields text[];
  result json;
begin
  -- Process ALL products (not just auto-calculated ones)
  for product_record in
    select id, name, price, purity_carats, weight_grams, making_charge_type, making_charge_percent, making_charge_flat
    from products
  loop
    -- Check if product has all required fields for recalculation
    missing_fields := array[]::text[];
    
    if product_record.purity_carats is null then
      missing_fields := array_append(missing_fields, 'purity_carats');
    end if;
    
    if product_record.weight_grams is null or product_record.weight_grams <= 0 then
      missing_fields := array_append(missing_fields, 'weight_grams');
    end if;
    
    if product_record.making_charge_type is null then
      missing_fields := array_append(missing_fields, 'making_charge_type');
    elsif product_record.making_charge_type = 'percent' and (product_record.making_charge_percent is null or product_record.making_charge_percent < 0) then
      missing_fields := array_append(missing_fields, 'making_charge_percent');
    elsif product_record.making_charge_type = 'flat' and (product_record.making_charge_flat is null or product_record.making_charge_flat < 0) then
      missing_fields := array_append(missing_fields, 'making_charge_flat');
    end if;
    
    -- If missing required fields, skip this product and record it
    if array_length(missing_fields, 1) > 0 then
      skipped_products := skipped_products || jsonb_build_object(
        'id', product_record.id,
        'name', product_record.name,
        'missing_fields', to_jsonb(missing_fields)
      );
    else
      -- Product has all required data, recalculate its price
      declare
        old_price numeric := product_record.price;
        new_price numeric;
      begin
        new_price := calculate_product_price(
          product_record.purity_carats,
          product_record.weight_grams,
          product_record.making_charge_type,
          product_record.making_charge_percent,
          product_record.making_charge_flat,
          p_gold_price_per_gram
        );
        
        -- Update the product
        update products
        set 
          price = new_price,
          gold_price_used = p_gold_price_per_gram,
          updated_at = now()
        where id = product_record.id;
        
        -- Record the update
        updated_products := updated_products || jsonb_build_object(
          'id', product_record.id,
          'name', product_record.name,
          'old_price', old_price,
          'new_price', new_price
        );
      exception
        when others then
          -- If individual product update fails, record it as skipped with error
          skipped_products := skipped_products || jsonb_build_object(
            'id', product_record.id,
            'name', product_record.name,
            'missing_fields', to_jsonb(missing_fields),
            'error', SQLERRM
          );
      end;
    end if;
  end loop;
  
  -- Build result JSON
  result := json_build_object(
    'success', true,
    'updated_count', jsonb_array_length(updated_products),
    'updated_products', updated_products,
    'skipped_count', jsonb_array_length(skipped_products),
    'skipped_products', skipped_products
  );
  
  return result;
end;
$$;

-- Add comment for documentation
comment on function recalculate_all_products_with_missing_data is 'Recalculates prices for ALL products, skipping those with missing required data (purity_carats, weight_grams, making_charge). Returns JSON with updated_products and skipped_products arrays.';
