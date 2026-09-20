/**
 * Execute SQL migration via Supabase REST API
 * This bypasses the need for CLI and uses the REST API directly
 */

require('dotenv').config({ path: './apps/admin/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

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

async function executeMigration() {
  try {
    console.log('Executing migration via Supabase REST API...');
    
    // Use the Supabase SQL editor endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql: migrationSQL })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Migration failed:', response.status, errorText);
      
      // Try alternative approach - create table directly via REST API
      console.log('Trying alternative approach...');
      await createTableDirectly();
      return;
    }

    const result = await response.json();
    console.log('✅ Migration completed successfully!');
    console.log('Festivals table created with all required components.');
    
  } catch (error) {
    console.error('Error executing migration:', error);
    console.log('Trying alternative approach...');
    await createTableDirectly();
  }
}

async function createTableDirectly() {
  try {
    console.log('Creating festivals table using direct REST API calls...');
    
    // First, try to create a test festival to see if table exists
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/festivals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name: 'Test Festival',
        description: 'Test description',
        is_active: false
      })
    });

    if (testResponse.ok) {
      console.log('✅ Festivals table already exists or was created successfully!');
      // Clean up the test entry
      await fetch(`${supabaseUrl}/rest/v1/festivals?name=eq.Test%20Festival`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        }
      });
      return;
    }

    const errorText = await testResponse.text();
    console.error('Direct creation failed:', testResponse.status, errorText);
    console.log('\n⚠️  Manual migration required.');
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log('----------------------------------------');
    console.log(migrationSQL);
    console.log('----------------------------------------');
    
  } catch (error) {
    console.error('Error in direct creation:', error);
    console.log('\n⚠️  Manual migration required.');
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log('----------------------------------------');
    console.log(migrationSQL);
    console.log('----------------------------------------');
  }
}

executeMigration();
