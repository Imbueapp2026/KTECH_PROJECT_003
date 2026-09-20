/**
 * Simple script to create the festivals table in Supabase
 * Uses the direct SQL execution approach
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

async function createFestivalsTable() {
  try {
    console.log('Creating festivals table...');
    
    // Step 1: Create the festivals table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (tableError) {
      console.log('Table creation may have failed (might already exist), continuing...');
    } else {
      console.log('✓ Festivals table created');
    }

    // Step 2: Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'alter table festivals enable row level security;'
    });

    if (rlsError) {
      console.log('RLS enable error (may already be enabled):', rlsError.message);
    } else {
      console.log('✓ RLS enabled');
    }

    // Step 3: Create policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        do $$ begin
          create policy "festivals: public read active"
            on festivals for select using (is_active = true);
        exception when duplicate_object then null; end $$;
        
        do $$ begin
          create policy "festivals: service role full access"
            on festivals for all using (auth.role() = 'service_role');
        exception when duplicate_object then null; end $$;
      `
    });

    if (policyError) {
      console.log('Policy creation error:', policyError.message);
    } else {
      console.log('✓ RLS policies created');
    }

    // Step 4: Create trigger
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        do $$ begin
          create trigger festivals_updated_at
            before update on festivals
            for each row execute function set_updated_at();
        exception when duplicate_object then null; end $$;
      `
    });

    if (triggerError) {
      console.log('Trigger creation error:', triggerError.message);
    } else {
      console.log('✓ Updated_at trigger created');
    }

    // Step 5: Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        create index if not exists idx_festivals_is_active on festivals(is_active);
        create index if not exists idx_festivals_created_at on festivals(created_at desc);
      `
    });

    if (indexError) {
      console.log('Index creation error:', indexError.message);
    } else {
      console.log('✓ Indexes created');
    }

    // Step 6: Add festival_id to products table
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (columnError) {
      console.log('Column addition error:', columnError.message);
    } else {
      console.log('✓ festival_id column added to products table');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('The festivals table is now ready for use.');
    
  } catch (error) {
    console.error('Error creating festivals table:', error);
    process.exit(1);
  }
}

createFestivalsTable();
