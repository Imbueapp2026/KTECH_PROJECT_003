/**
 * Script to run the festivals table migration
 * This directly executes SQL against Supabase using the service role key
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: './apps/admin/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSQL = `
-- =========================================================
-- Migration 028 — Add festivals table
-- Adds support for festival-based product management
-- =========================================================

-- ── festivals table ───────────────────────────────────────
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

alter table festivals enable row level security;

-- ── RLS Policies ────────────────────────────────────────────
-- Allow public read access (published festivals only)
do $$ begin
  create policy "festivals: public read active"
    on festivals for select using (is_active = true);
exception when duplicate_object then null; end $$;

-- Allow service role full access (for admin API)
do $$ begin
  create policy "festivals: service role full access"
    on festivals for all using (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;

-- ── Updated_at trigger ──────────────────────────────────────
do $$ begin
  create trigger festivals_updated_at
    before update on festivals
    for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;

-- ── Indexes ───────────────────────────────────────────────
create index if not exists idx_festivals_is_active on festivals(is_active);
create index if not exists idx_festivals_created_at on festivals(created_at desc);

-- ── Add festival_id to products table if not exists ───────
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

async function runMigration() {
  try {
    console.log('Running festivals table migration...');
    
    // Execute the SQL directly using RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
    console.log('Festivals table created with RLS policies and indexes.');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
