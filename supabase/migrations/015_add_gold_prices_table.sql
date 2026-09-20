-- =========================================================
-- Migration 008 — Add gold_prices table for live gold price tracking
-- =========================================================

-- Create gold_prices table
create table if not exists gold_prices (
  id              uuid           primary key default gen_random_uuid(),
  price_per_gram  numeric(10, 2) not null,
  currency        text           not null default 'INR',
  source          text           not null, -- 'api' or 'manual'
  source_url      text, -- URL of the API if source='api'
  updated_at      timestamptz    not null default now(),
  is_current      boolean        not null default true
);

alter table gold_prices enable row level security;

-- Policy: Admin can insert/update gold prices
do $$ begin
  create policy "gold_prices: admin insert"
    on gold_prices for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "gold_prices: admin update"
    on gold_prices for update using (true);
exception when duplicate_object then null; end $$;

-- Policy: Public can read current gold price
do $$ begin
  create policy "gold_prices: public read"
    on gold_prices for select using (is_current = true);
exception when duplicate_object then null; end $$;

-- Index for efficient current price lookup
create index if not exists idx_gold_prices_is_current on gold_prices(is_current);
create index if not exists idx_gold_prices_updated_at on gold_prices(updated_at desc);

-- Function to get current gold price with fallback
create or replace function get_current_gold_price()
returns table (price_per_gram numeric, updated_at timestamptz, source text)
language plpgsql
as $$
begin
  return query
  select price_per_gram, updated_at, source
  from gold_prices
  where is_current = true
  limit 1;
end;
$$;

-- Function to set new current gold price (marks old ones as not current)
create or replace function set_current_gold_price(
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
  update gold_prices
  set is_current = false
  where is_current = true;
  
  -- Insert new current price
  insert into gold_prices (price_per_gram, source, source_url, is_current)
  values (p_price_per_gram, p_source, p_source_url, true)
  returning id into new_id;
  
  return new_id;
end;
$$;
