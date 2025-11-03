import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = 'https://mzrvykieuqoxbxhfhsyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cnZ5a2lldXFveGJ4aGZoc3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzY2NTcsImV4cCI6MjA3NzY1MjY1N30.b397Xnmo_V9iYRYHmHZf-9LHQ_ihew5lDtidj7SnLJM';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runMigration() {
  console.log('🚀 Starting database migration: add_approval_tracking_columns');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('');

  try {
    // Read migration SQL
    const migrationSQL = readFileSync(
      join(__dirname, 'migrations/add_approval_tracking_columns.sql'),
      'utf8'
    );

    console.log('📄 Migration SQL loaded successfully');
    console.log('');

    // Execute the migration using raw SQL
    // Note: This requires service role key for DDL operations
    console.log('⚠️  WARNING: DDL operations require service role key or manual execution');
    console.log('');
    console.log('📋 Migration SQL to execute in Supabase SQL Editor:');
    console.log('━'.repeat(80));
    console.log(migrationSQL);
    console.log('━'.repeat(80));
    console.log('');
    console.log('✅ Please execute the above SQL in your Supabase SQL Editor at:');
    console.log(`   ${SUPABASE_URL}/project/_/sql/new`);
    console.log('');

    // Try to verify if we can read the table structure
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(0);

    if (error && !error.message.includes('0 rows')) {
      console.log('❌ Error connecting to database:', error.message);
      process.exit(1);
    }

    console.log('✅ Database connection verified');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
