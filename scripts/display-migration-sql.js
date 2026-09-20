/**
 * Display the migration SQL for manual execution
 */

const migrationSQL = `
-- =========================================================
-- Migration 028 — Add festivals table
-- Adds support for festival-based product management
-- =========================================================

-- Create festivals table
create table if not exists festivals (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  image_url   text,
  date        text,
  is_active   boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enable RLS
alter table festivals enable row level security;

-- Create RLS policies
do $$ begin
  create policy "festivals: public read active"
    on festivals for select using (is_active = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "festivals: service role full access"
    on festivals for all using (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;

-- Create trigger (only if set_updated_at function exists)
do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    create trigger festivals_updated_at
      before update on festivals
      for each row execute function set_updated_at();
  end if;
exception when duplicate_object then null; end $$;

-- Create indexes
create index if not exists idx_festivals_is_active on festivals(is_active);
create index if not exists idx_festivals_created_at on festivals(created_at desc);

-- Add festival_id to products table
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'festival_id'
  ) then
    alter table products add column festival_id uuid references festivals(id) on delete set null;
    create index if not exists idx_products_festival_id on products(festival_id);
  end if;
end $$;
`;

console.log('='.repeat(80));
console.log('MIGRATION SQL FOR FESTIVALS TABLE');
console.log('='.repeat(80));
console.log('\nTo fix the 500 error, run this SQL in your Supabase Dashboard:');
console.log('\n1. Go to https://supabase.com/dashboard');
console.log('2. Select your project: aviratjewelers-27e34');
console.log('3. Navigate to SQL Editor (in the left sidebar)');
console.log('4. Click "New Query"');
console.log('5. Copy and paste the SQL below');
console.log('6. Click "Run" to execute');
console.log('\n' + '='.repeat(80));
console.log(migrationSQL);
console.log('='.repeat(80));
console.log('\nAfter running this migration, the festivals API endpoint will work correctly.');
