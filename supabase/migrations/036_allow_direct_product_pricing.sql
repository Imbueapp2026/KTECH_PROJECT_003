-- Allow products to use a manually entered price.
-- Migration 018 added this constraint before direct pricing was supported.
alter table products
drop constraint if exists price_auto_calculated_must_be_true;

comment on column products.price_auto_calculated is
  'Whether price is calculated from metal pricing fields or manually set';
