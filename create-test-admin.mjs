import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually
const envPath = join(__dirname, '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestAdmin() {
  try {
    console.log('🔄 Creating test admin account...\n');

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@test.com',
      password: 'admin1234',
      options: {
        data: {
          name: '관리자',
        },
      },
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      process.exit(1);
    }

    if (!authData.user) {
      console.error('❌ No user data returned');
      process.exit(1);
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Create user profile with president role and active status
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'admin@test.com',
        name: '관리자',
        generation: 1,
        occupation: '회장',
        phone: '010-0000-0000',
        messenger_id: 'admin_test',
        role: 'president',
        status: 'active',
        approved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError.message);
      process.exit(1);
    }

    console.log('✅ User profile created with president role\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Test Admin Account Created Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@test.com');
    console.log('🔑 Password: admin1234');
    console.log('👤 Name:     관리자');
    console.log('🏆 Role:     회장 (President)');
    console.log('✅ Status:   활성화 (Active)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🚀 You can now login at: http://localhost:5173/auth/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

createTestAdmin();
