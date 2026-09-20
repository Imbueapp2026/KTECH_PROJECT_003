-- =========================================================
-- Migration 003 — Add offers and discounts tables
-- Based on API Design Document v1.0 and PRD
-- =========================================================

-- ── Drop existing tables if they exist (for clean migration) ─────────────
drop table if exists discounts cascade;
drop table if exists offers cascade;

-- ── Drop existing enums ───────────────────────────────────────────────────
drop type if exists discount_type cascade;

-- ── Enums ───────────────────────────────────────────────────────────────
do $$ begin
  create type discount_type as enum ('percentage', 'flat');
exception when duplicate_object then null; end $$;

-- ── offers ──────────────────────────────────────────────────────────────
create table if not exists offers (
  id          uuid        primary key default gen_random_uuid(),
  label       text        not null,
  description text,
  is_active   boolean     not null default true,
  start_date  timestamptz not null default now(),
  end_date    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table offers enable row level security;

-- Public can read active offers only
do $$ begin
  create policy "offers: public read active"
    on offers for select using (is_active = true and (end_date is null or end_date > now()));
exception when duplicate_object then null; end $$;

-- Service role (admin) has full access
do $$ begin
  create policy "offers: service role full access"
    on offers for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;

-- Auto-update updated_at trigger for offers
do $$ begin
  create trigger offers_updated_at
    before update on offers
    for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;

-- ── discounts ────────────────────────────────────────────────────────────
create table if not exists discounts (
  id           uuid           primary key default gen_random_uuid(),
  offer_id     uuid           not null references offers(id) on delete cascade,
  discount_type discount_type  not null,
  value        numeric        not null,
  created_at   timestamptz    not null default now(),
  updated_at   timestamptz    not null default now()
);

alter table discounts enable row level security;

-- Public can read discounts for active offers only
do $$ begin
  create policy "discounts: public read via active offers"
    on discounts for select using (
      exists (
        select 1 from offers 
        where offers.id = discounts.offer_id 
        and offers.is_active = true 
        and (offers.end_date is null or offers.end_date > now())
      )
    );
exception when duplicate_object then null; end $$;

-- Service role (admin) has full access
do $$ begin
  create policy "discounts: service role full access"
    on discounts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;

-- Auto-update updated_at trigger for discounts
do $$ begin
  create trigger discounts_updated_at
    before update on discounts
    for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;

-- ── indexes ─────────────────────────────────────────────────────────────
create index if not exists idx_offers_is_active   on offers(is_active);
create index if not exists idx_offers_start_date  on offers(start_date);
create index if not exists idx_offers_end_date    on offers(end_date);
create index if not exists idx_discounts_offer_id on discounts(offer_id);
