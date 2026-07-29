-- =========================================================
-- Migration 001 — Initial schema for Avirat Jewelers
-- Safe to run multiple times: all DDL uses IF NOT EXISTS.
-- Run this against your Supabase project via the SQL editor
-- or `supabase db push`.
-- =========================================================

-- ── Extensions ────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────
do $$ begin
  create type product_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type availability as enum ('available', 'made_to_order', 'sold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_status as enum ('new', 'open', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type as enum ('percentage', 'flat');
exception when duplicate_object then null; end $$;

-- ── categories ────────────────────────────────────────────
create table if not exists categories (
  id          uuid        primary key default uuid_generate_v4(),
  name        text        not null unique,
  slug        text        not null unique,
  icon_url    text,
  icon_svg    text,                -- inline SVG string for the UI cards
  sort_order  smallint    not null default 0,
  is_system   boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table categories enable row level security;

do $$ begin
  create policy "categories: public read"
    on categories for select using (true);
exception when duplicate_object then null; end $$;

-- ── offers ────────────────────────────────────────────────
create table if not exists offers (
  id          uuid        primary key default uuid_generate_v4(),
  label       text        not null,
  description text,
  is_active   boolean     not null default true,
  start_date  date,
  end_date    date,
  created_at  timestamptz not null default now()
);

alter table offers enable row level security;

do $$ begin
  create policy "offers: public read active"
    on offers for select using (is_active = true);
exception when duplicate_object then null; end $$;

-- ── discounts ─────────────────────────────────────────────
create table if not exists discounts (
  id            uuid          primary key default uuid_generate_v4(),
  offer_id      uuid          not null references offers(id) on delete cascade,
  discount_type discount_type not null,
  value         numeric(10,2) not null check (value > 0)
);

alter table discounts enable row level security;

do $$ begin
  create policy "discounts: public read"
    on discounts for select using (true);
exception when duplicate_object then null; end $$;

-- ── products ──────────────────────────────────────────────
-- status enforces draft / published / archived at DB level.
-- image_urls stores Supabase Storage public URLs uploaded via
-- the admin /api/admin/products/upload endpoint.
create table if not exists products (
  id                  uuid           primary key default uuid_generate_v4(),
  name                text           not null,
  category_id         uuid           not null references categories(id),
  description         text           not null default '',
  hallmark_certified  boolean        not null default false,
  availability        availability   not null default 'available',
  price               numeric(12,2)  not null check (price >= 0),
  offer_id            uuid           references offers(id) on delete set null,
  -- draft     = hidden / work-in-progress
  -- published = visible to public (RLS enforces this)
  -- archived  = soft-deleted, hidden from all public queries
  status              product_status not null default 'draft',
  image_urls          text[]         not null default '{}',
  created_at          timestamptz    not null default now(),
  updated_at          timestamptz    not null default now()
);

alter table products enable row level security;

do $$ begin
  create policy "products: public read published"
    on products for select using (status = 'published');
exception when duplicate_object then null; end $$;

-- Auto-update updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create trigger products_updated_at
    before update on products
    for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;

-- ── inquiries ─────────────────────────────────────────────
create table if not exists inquiries (
  id          uuid           primary key default uuid_generate_v4(),
  name        text           not null,
  phone       text           not null,
  email       text,
  message     text,
  product_id  uuid           references products(id) on delete set null,
  status      inquiry_status not null default 'new',
  created_at  timestamptz    not null default now()
);

alter table inquiries enable row level security;

do $$ begin
  create policy "inquiries: public insert"
    on inquiries for insert with check (true);
exception when duplicate_object then null; end $$;

-- ── visits ────────────────────────────────────────────────
create table if not exists visits (
  id         uuid        primary key default uuid_generate_v4(),
  page       text        not null,
  referrer   text,
  created_at timestamptz not null default now()
);

alter table visits enable row level security;

do $$ begin
  create policy "visits: public insert"
    on visits for insert with check (true);
exception when duplicate_object then null; end $$;

-- ── indexes ───────────────────────────────────────────────
create index if not exists idx_products_status      on products(status);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_updated_at  on products(updated_at desc);
create index if not exists idx_inquiries_status     on inquiries(status);
create index if not exists idx_inquiries_created_at on inquiries(created_at desc);
