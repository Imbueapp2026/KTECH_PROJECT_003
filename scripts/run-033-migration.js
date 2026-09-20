const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: './apps/admin/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sqlFilePath = path.join(__dirname, '../supabase/migrations/033_fix_recalculate_function.sql');
const migrationSQL = fs.readFileSync(sqlFilePath, 'utf8');

async function runMigration() {
  try {
    console.log('Running recalculate function migration (033_fix_recalculate_function.sql)...');
    
    // Execute the SQL directly using RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('Function recalculate_all_products_with_missing_data was successfully updated.');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
