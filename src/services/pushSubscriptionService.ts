import { supabase } from '@/lib/supabase';

interface PushSubscription {
  id: string;
  user_id: string;
  subscription: PushSubscriptionJSON;
  created_at: string;
  updated_at: string;
}

class PushSubscriptionService {
  /**
   * Save or update push subscription for the current user
   */
  async saveSubscription(subscription: PushSubscriptionJSON): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        subscription: subscription,
      }, {
        onConflict: 'user_id'
      });

    if (error) throw new Error(`구독 저장 실패: ${error.message}`);
  }

  /**
   * Get push subscription for the current user
   */
  async getSubscription(): Promise<PushSubscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No subscription found
      throw new Error(`구독 조회 실패: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete push subscription for the current user
   */
  async deleteSubscription(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id);

    if (error) throw new Error(`구독 삭제 실패: ${error.message}`);
  }

  /**
   * Get all push subscriptions (President only)
   * Used for sending push notifications to all users
   */
  async getAllSubscriptions(): Promise<PushSubscription[]> {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw new Error(`전체 구독 조회 실패: ${error.message}`);
    return data || [];
  }

  /**
   * Send push notification to all subscribed users
   * Calls the Supabase Edge Function
   */
  async sendNotificationToAll(payload: {
    title: string;
    body: string;
    url?: string;
  }): Promise<{ success: number; failed: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: payload,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to send push notifications:', error);
      throw new Error('푸시 알림 전송에 실패했습니다.');
    }
  }
}

export const pushSubscriptionService = new PushSubscriptionService();
