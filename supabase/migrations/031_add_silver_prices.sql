-- =========================================================
-- Migration 031 — Add silver prices and update pricing logic
-- =========================================================

-- Create silver_prices table
create table if not exists silver_prices (
  id              uuid           primary key default gen_random_uuid(),
  price_per_gram  numeric(10, 2) not null,
  currency        text           not null default 'INR',
  source          text           not null, -- 'api' or 'manual'
  source_url      text, -- URL of the API if source='api'
  updated_at      timestamptz    not null default now(),
  is_current      boolean        not null default true
);

alter table silver_prices enable row level security;

-- Policy: Admin can insert/update silver prices
do $$ begin
  create policy "silver_prices: admin insert"
    on silver_prices for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "silver_prices: admin update"
    on silver_prices for update using (true);
exception when duplicate_object then null; end $$;

-- Policy: Public can read current silver price
do $$ begin
  create policy "silver_prices: public read"
    on silver_prices for select using (is_current = true);
exception when duplicate_object then null; end $$;

-- Index for efficient current price lookup
create index if not exists idx_silver_prices_is_current on silver_prices(is_current);
create index if not exists idx_silver_prices_updated_at on silver_prices(updated_at desc);

-- Function to get current silver price with fallback
create or replace function get_current_silver_price()
returns table (price_per_gram numeric, updated_at timestamptz, source text)
language plpgsql
as $$
begin
  return query
  select sp.price_per_gram, sp.updated_at, sp.source
  from silver_prices sp
  where sp.is_current = true
  limit 1;
end;
$$;

-- Function to set new current silver price
create or replace function set_current_silver_price(
  p_price_per_gram numeric,
  p_source text,
  p_source_url text default null
)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  -- Mark all existing prices as not current
  update silver_prices
  set is_current = false
  where is_current = true;
  
  -- Insert new current price
  insert into silver_prices (price_per_gram, source, source_url, is_current)
  values (p_price_per_gram, p_source, p_source_url, true)
  returning id into new_id;
  
  return new_id;
end;
$$;

-- Drop old functions since signature is changing
drop function if exists calculate_product_price(integer, numeric, text, numeric, numeric, numeric);
drop function if exists recalculate_all_products_with_missing_data(numeric);

-- Update calculate_product_price to accept material_type and both metal prices
create or replace function calculate_product_price(
  p_purity_carats integer,
  p_weight_grams numeric,
  p_making_charge_type text,
  p_making_charge_percent numeric,
  p_making_charge_flat numeric,
  p_gold_price_per_gram numeric,
  p_silver_price_per_gram numeric,
  p_material_type text default 'gold'
)
returns numeric
language plpgsql
as $$
declare
  purity_factor numeric;
  metal_value numeric;
  making_charge numeric;
  final_price numeric;
begin
  if p_material_type = 'silver' then
    -- For silver, use fixed purity factor (equivalent to 24K/999) or handle logic if needed
    purity_factor := 1.0;
    metal_value := COALESCE(p_silver_price_per_gram, 0) * p_weight_grams * purity_factor;
  else
    -- Default to gold
    -- Purity factors: 24K = 1.0, 22K = 0.9167, 18K = 0.75, etc.
    case p_purity_carats
      when 24 then purity_factor := 1.0;
      when 22 then purity_factor := 0.9167;
      when 18 then purity_factor := 0.75;
      when 14 then purity_factor := 0.5833;
      when 9 then purity_factor := 0.375;
      else purity_factor := 1.0; -- Default to 24K
    end case;
    metal_value := COALESCE(p_gold_price_per_gram, 0) * p_weight_grams * purity_factor;
  end if;

  -- Calculate making charge
  if p_making_charge_type = 'percent' then
    making_charge := metal_value * (COALESCE(p_making_charge_percent, 0) / 100);
  else
    making_charge := COALESCE(p_making_charge_flat, 0);
  end if;

  -- Final price
  final_price := metal_value + making_charge;

  return round(final_price::numeric, 2);
end;
$$;

-- Update recalculate_all_products_with_missing_data
create or replace function recalculate_all_products_with_missing_data(
  p_gold_price_per_gram numeric,
  p_silver_price_per_gram numeric
)
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
    select id, name, price, purity_carats, weight_grams, making_charge_type, making_charge_percent, making_charge_flat, material_type
    from products
  loop
    -- Check if product has all required fields for recalculation
    missing_fields := array[]::text[];
    
    -- If gold, check purity
    if (product_record.material_type is null or product_record.material_type = 'gold') and product_record.purity_carats is null then
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
        used_metal_price numeric;
      begin
        new_price := calculate_product_price(
          product_record.purity_carats,
          product_record.weight_grams,
          product_record.making_charge_type,
          product_record.making_charge_percent,
          product_record.making_charge_flat,
          p_gold_price_per_gram,
          p_silver_price_per_gram,
          product_record.material_type
        );
        
        if product_record.material_type = 'silver' then
          used_metal_price := p_silver_price_per_gram;
        else
          used_metal_price := p_gold_price_per_gram;
        end if;
        
        -- Update the product
        update products
        set 
          price = new_price,
          gold_price_used = used_metal_price, -- Store whichever price was used
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