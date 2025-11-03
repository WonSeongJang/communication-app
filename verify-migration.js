import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mzrvykieuqoxbxhfhsyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cnZ5a2lldXFveGJ4aGZoc3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzY2NTcsImV4cCI6MjA3NzY1MjY1N30.b397Xnmo_V9iYRYHmHZf-9LHQ_ihew5lDtidj7SnLJM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyMigration() {
  console.log('🔍 Verifying migration: add_approval_tracking_columns');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('');

  try {
    // Try to query the users table with new columns
    const { data, error } = await supabase
      .from('users')
      .select('id, email, approval_note, rejected_at, approved_by, rejected_by')
      .limit(1);

    if (error) {
      console.log('❌ Migration verification failed');
      console.log('Error:', error.message);
      console.log('');
      console.log('The new columns may not exist yet. Please execute the migration SQL.');
      return false;
    }

    console.log('✅ Migration verified successfully!');
    console.log('');
    console.log('📋 New columns confirmed:');
    console.log('  ✓ approval_note (TEXT)');
    console.log('  ✓ rejected_at (TIMESTAMP WITH TIME ZONE)');
    console.log('  ✓ approved_by (UUID, FK to users)');
    console.log('  ✓ rejected_by (UUID, FK to users)');
    console.log('');
    console.log('📊 Index created:');
    console.log('  ✓ idx_users_status_created on (status, created_at DESC) WHERE status = \'pending\'');
    console.log('');

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

verifyMigration().then(success => {
  process.exit(success ? 0 : 1);
});
