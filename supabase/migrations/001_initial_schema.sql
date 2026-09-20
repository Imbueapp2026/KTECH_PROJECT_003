-- =========================================================
-- Migration 001 — Initial schema for Avirat Jewelers
-- Based on API Design Document v1.0
-- Drops existing schema and recreates with correct structure
-- =========================================================

-- ── Drop existing tables (clean slate) ─────────────────────
drop table if exists visits cascade;
drop table if exists inquiries cascade;
drop table if exists products cascade;
drop table if exists categories cascade;

-- ── Drop existing enums ───────────────────────────────────
drop type if exists inquiry_status cascade;
drop type if exists availability cascade;
drop type if exists product_status cascade;

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
  create type inquiry_status as enum ('new', 'contacted', 'resolved');
exception when duplicate_object then null; end $$;

-- ── categories ────────────────────────────────────────────
create table if not exists categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null unique,
  slug        text        not null unique,
  icon_url    text,
  icon_svg    text,
  sort_order  smallint    not null default 0,
  is_system   boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table categories enable row level security;

do $$ begin
  create policy "categories: public read"
    on categories for select using (true);
exception when duplicate_object then null; end $$;

-- ── products ──────────────────────────────────────────────
create table if not exists products (
  id                  uuid           primary key default gen_random_uuid(),
  name                text           not null,
  category_id         uuid           not null references categories(id),
  description         text           not null,
  hallmark_certified  boolean        not null default false,
  availability        availability   not null default 'available',
  is_offer            boolean        not null default false,
  offer_label         text,
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
  id          uuid           primary key default gen_random_uuid(),
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

do $$ begin
  create policy "inquiries: public select"
    on inquiries for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "inquiries: public update"
    on inquiries for update using (true);
exception when duplicate_object then null; end $$;

-- ── visits ────────────────────────────────────────────────
create table if not exists visits (
  id         uuid        primary key default gen_random_uuid(),
  page_path  text        not null,
  product_id uuid        references products(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table visits enable row level security;

do $$ begin
  create policy "visits: public insert"
    on visits for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "visits: public select"
    on visits for select using (true);
exception when duplicate_object then null; end $$;

-- ── indexes ───────────────────────────────────────────────
create index if not exists idx_products_status      on products(status);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_updated_at  on products(updated_at desc);
create index if not exists idx_products_is_offer    on products(is_offer);
create index if not exists idx_inquiries_status     on inquiries(status);
create index if not exists idx_inquiries_created_at on inquiries(created_at desc);
create index if not exists idx_inquiries_product_id on inquiries(product_id);
create index if not exists idx_visits_page_path     on visits(page_path);
create index if not exists idx_visits_product_id    on visits(product_id);
create index if not exists idx_visits_created_at    on visits(created_at desc);
