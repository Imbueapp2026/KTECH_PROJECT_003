-- Migration 039 — Offer banners target the complete offer collection.
-- Existing product_id values are preserved for backward compatibility, but new
-- banners no longer require a product destination.

alter table offer_banners
  alter column product_id drop not null;

comment on column offer_banners.product_id is
  'Legacy optional product reference. New banners link to the complete offer collection.';
