require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('Applying migration 006_remove_level_and_topic.sql...');

  const migrationPath = path.join(__dirname, '../supabase/migrations/006_remove_level_and_topic.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Migration failed:', error.message);
    console.log('\nPlease apply the migration manually via Supabase dashboard:');
    console.log(sql);
    process.exit(1);
  }

  console.log('Migration applied successfully');
}

applyMigration().catch(console.error);
