-- =========================================================
-- Migration 009 — Add gold pricing fields to products table
-- =========================================================

-- Add new columns to products table for gold-based pricing
alter table products
  add column if not exists purity_carats integer,
  add column if not exists weight_grams numeric(8, 3),
  add column if not exists making_charge_percent numeric(5, 2),
  add column if not exists making_charge_flat numeric(10, 2),
  add column if not exists making_charge_type text check (making_charge_type in ('percent', 'flat')),
  add column if not exists certifications text,
  add column if not exists gold_price_used numeric(10, 2),
  add column if not exists price_auto_calculated boolean not null default false,
  add column if not exists price numeric(10, 2) not null default 0;

-- Add comments for documentation
comment on column products.purity_carats is 'Gold purity in carats (e.g., 24, 22, 18)';
comment on column products.weight_grams is 'Weight of gold in grams';
comment on column products.making_charge_percent is 'Making charge as percentage of gold value';
comment on column products.making_charge_flat is 'Making charge as flat amount (INR)';
comment on column products.making_charge_type is 'Type of making charge: percent or flat';
comment on column products.certifications is 'JSON array or text describing certifications (e.g., BIS hallmark, IGI, GIA)';
comment on column products.gold_price_used is 'Gold price per gram used for last price calculation';
comment on column products.price_auto_calculated is 'Whether price is auto-calculated from gold price or manually set';
comment on column products.price is 'Final price of the product (INR)';

-- Note: making_charge_type uses text with check constraint instead of enum
-- This avoids type conversion issues and is more flexible for future changes

-- Create function to calculate product price from gold price
create or replace function calculate_product_price(
  p_purity_carats integer,
  p_weight_grams numeric,
  p_making_charge_type text,
  p_making_charge_percent numeric,
  p_making_charge_flat numeric,
  p_gold_price_per_gram numeric
)
returns numeric
language plpgsql
as $$
declare
  purity_factor numeric;
  gold_value numeric;
  making_charge numeric;
  final_price numeric;
begin
  -- Purity factors: 24K = 1.0, 22K = 0.9167, 18K = 0.75, etc.
  case p_purity_carats
    when 24 then purity_factor := 1.0;
    when 22 then purity_factor := 0.9167;
    when 18 then purity_factor := 0.75;
    when 14 then purity_factor := 0.5833;
    when 9 then purity_factor := 0.375;
    else purity_factor := 1.0; -- Default to 24K
  end case;

  -- Calculate gold value
  gold_value := p_gold_price_per_gram * p_weight_grams * purity_factor;

  -- Calculate making charge
  if p_making_charge_type = 'percent' then
    making_charge := gold_value * (p_making_charge_percent / 100);
  else
    making_charge := p_making_charge_flat;
  end if;

  -- Final price
  final_price := gold_value + making_charge;

  return round(final_price::numeric, 2);
end;
$$;

-- Create function to recalculate all auto-priced products (atomic transaction)
create or replace function recalculate_auto_priced_products(p_gold_price_per_gram numeric)
returns table (product_id uuid, old_price numeric, new_price numeric)
language plpgsql
as $$
declare
  product_record record;
begin
  -- Start transaction for atomic updates
  -- If any update fails, all changes will be rolled back
  for product_record in
    select id, price from products where price_auto_calculated = true
  loop
    update products
    set 
      price = calculate_product_price(
        purity_carats,
        weight_grams,
        making_charge_type,
        making_charge_percent,
        making_charge_flat,
        p_gold_price_per_gram
      ),
      gold_price_used = p_gold_price_per_gram,
      updated_at = now()
    where id = product_record.id
    returning id, product_record.price as old_price, price as new_price
    into product_record.id, product_record.old_price, product_record.new_price;

    return next;
  end loop;
  
  -- Function-level transaction: if any error occurs, entire operation rolls back
  exception
    when others then
      raise exception 'Recalculation failed: %', SQLERRM;
end;
$$;
