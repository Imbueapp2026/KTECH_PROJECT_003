-- Migration 038 — Add one optional hero banner to each offer.

create table if not exists offer_banners (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  image_url text not null,
  alt_text text not null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offer_banners_image_url_not_blank check (length(btrim(image_url)) > 0),
  constraint offer_banners_alt_text_not_blank check (length(btrim(alt_text)) > 0),
  constraint offer_banners_display_order_nonnegative check (display_order >= 0),
  constraint offer_banners_one_per_offer unique (offer_id)
);

alter table offer_banners enable row level security;

do $$ begin
  create policy "offer_banners: public read active offers"
    on offer_banners for select using (
      is_active = true
      and exists (
        select 1 from offers
        where offers.id = offer_banners.offer_id
          and offers.is_active = true
          and offers.start_date <= now()
          and (offers.end_date is null or offers.end_date > now())
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "offer_banners: service role full access"
    on offer_banners for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger offer_banners_updated_at
    before update on offer_banners
    for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;

create index if not exists idx_offer_banners_active_order
  on offer_banners(is_active, display_order);
create index if not exists idx_offer_banners_product_id
  on offer_banners(product_id);