// Supabase Edge Function for sending push notifications
// Follow this guide to test and deploy: https://supabase.com/docs/guides/functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { title, body, url }: PushPayload = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', success: 0, failed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    // Send push notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Use web-push npm package via esm.sh
          const webpush = await import('https://esm.sh/web-push@3.6.7');

          webpush.setVapidDetails(
            'mailto:admin@example.com',
            vapidPublicKey,
            vapidPrivateKey
          );

          const payload = JSON.stringify({
            title,
            body,
            url: url || '/',
            tag: `notification-${Date.now()}`,
          });

          await webpush.sendNotification(sub.subscription, payload);
          return { success: true };
        } catch (error) {
          console.error(`Failed to send push to user ${sub.user_id}:`, error);
          return { success: false, error };
        }
      })
    );

    // Count successes and failures
    const success = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - success;

    return new Response(
      JSON.stringify({
        message: `Push notifications sent to ${success} users, ${failed} failed`,
        success,
        failed,
        total: subscriptions.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
