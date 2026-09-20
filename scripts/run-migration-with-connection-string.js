/**
 * Run migration using direct PostgreSQL connection
 * This uses the pg library to connect directly to Supabase
 */

require('dotenv').config({ path: './apps/admin/.env.local' });

const { Pool } = require('pg');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Extract connection details from Supabase URL
// Format: https://[project-ref].supabase.co
const urlParts = supabaseUrl.replace('https://', '').split('.');
const projectRef = urlParts[0];

// For Supabase, we need to use the connection string format
// postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
// But we need to get the password from the service key or use an alternative approach

console.log('Project ref:', projectRef);
console.log('Supabase URL:', supabaseUrl);

// Alternative: Use the migration SQL that can be executed via Supabase dashboard
const migrationSQL = `
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

-- Create trigger
do $$ begin
  create trigger festivals_updated_at
    before update on festivals
    for each row execute function set_updated_at();
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

console.log('\nTo complete the migration, you have two options:');
console.log('\nOption 1: Use Supabase Dashboard (Recommended)');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to SQL Editor');
console.log('4. Run the SQL above');
console.log('\nOption 2: Use Supabase CLI with access token');
console.log('1. Get your access token from https://supabase.com/dashboard/account/tokens');
console.log('2. Run: supabase login --token <your-token>');
console.log('3. Run: supabase link --project-ref cclsnzoixxmrbldveyam');
console.log('4. Run: supabase db push');

console.log('\nHere is the SQL you need to run:');
console.log('='.repeat(80));
console.log(migrationSQL);
console.log('='.repeat(80));
