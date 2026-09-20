-- =========================================================
-- Migration 004 — Update products table schema
-- - Add price field (required, numeric)
-- - Add offer_id field (nullable, FK to offers.id)
-- - Remove deprecated is_offer and offer_label fields
-- =========================================================

-- ── Add new columns ─────────────────────────────────────────────────────
-- Add price field (required, but default to 0 for existing records)
alter table products add column if not exists price numeric not null default 0;

-- Add offer_id field (nullable, FK to offers)
alter table products add column if not exists offer_id uuid references offers(id) on delete set null;

-- ── Remove deprecated columns ───────────────────────────────────────────
-- Drop is_offer column (deprecated)
alter table products drop column if exists is_offer;

-- Drop offer_label column (deprecated)
alter table products drop column if exists offer_label;

-- ── Update indexes ───────────────────────────────────────────────────────
-- Drop deprecated index
drop index if exists idx_products_is_offer;

-- Add new index for offer_id
create index if not exists idx_products_offer_id on products(offer_id);

-- Add index for price (useful for filtering by price range)
create index if not exists idx_products_price on products(price);
