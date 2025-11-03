import webpush from 'web-push';

console.log('🔑 Generating VAPID keys for Web Push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys Generated!\n');
console.log('Copy these keys to your .env file:\n');
console.log('VITE_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('\n📝 Note:');
console.log('- VITE_VAPID_PUBLIC_KEY: Add to .env (exposed to client)');
console.log('- VAPID_PRIVATE_KEY: Add to Supabase Edge Function secrets (server-side only)');
