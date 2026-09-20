-- =========================================================
-- Migration 035 — Enhance festivals schema with date ranges
-- Adds start_date and end_date for proper festival timeline management
-- =========================================================

-- ── Add date range fields to festivals table ─────────────────────
-- Add start_date (nullable timestamp for festival start)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'festivals' and column_name = 'start_date'
  ) then
    alter table festivals add column start_date timestamptz;
  end if;
exception when duplicate_column then null; end $$;

-- Add end_date (nullable timestamp for festival end)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'festivals' and column_name = 'end_date'
  ) then
    alter table festivals add column end_date timestamptz;
  end if;
exception when duplicate_column then null; end $$;

-- ── Add comments for documentation ───────────────────────────────
comment on column festivals.start_date is 'Festival start date - when the festival becomes active';
comment on column festivals.end_date is 'Festival end date - when the festival becomes inactive';
comment on column festivals.date is 'Legacy display date field - kept for backward compatibility';

-- ── Add indexes for date-based queries ───────────────────────────
create index if not exists idx_festivals_start_date on festivals(start_date) where start_date is not null;
create index if not exists idx_festivals_end_date on festivals(end_date) where end_date is not null;

-- ── Add check constraint for date validation ─────────────────────
-- Ensure end_date is not before start_date when both are set
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'festivals_date_range_check'
  ) then
    alter table festivals add constraint festivals_date_range_check
      check (end_date is null or start_date is null or end_date >= start_date);
  end if;
exception when duplicate_object then null; end $$;

-- ── Update RLS policies to consider date ranges ──────────────────
-- Update the public read policy to consider date ranges
do $$
begin
  drop policy if exists "festivals: public read active" on festivals;
exception when undefined_object then null; end $$;

do $$ begin
  create policy "festivals: public read active"
    on festivals for select using (
      is_active = true and
      (end_date is null or end_date > now()) and
      (start_date is null or start_date <= now())
    );
exception when duplicate_object then null; end $$;