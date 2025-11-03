import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { pushSubscriptionService } from '@/services/pushSubscriptionService';

export default function PushNotificationPrompt() {
  const { user } = useAuthStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, [user]);

  const checkNotificationStatus = async () => {
    if (!user) return;

    // Check if browser supports notifications
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }

    // Check if user already granted permission
    if (Notification.permission === 'granted') {
      // Check if subscription exists
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      return;
    }

    // Show prompt if permission is default (not asked yet)
    if (Notification.permission === 'default') {
      setShowPrompt(true);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Subscribe to push notifications
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        });

        // Save subscription to database
        await pushSubscriptionService.saveSubscription(subscription);

        setIsSubscribed(true);
        setShowPrompt(false);

        // Show success notification
        registration.showNotification('알림이 활성화되었습니다', {
          body: '이제 중요한 공지사항을 놓치지 않으실 수 있습니다!',
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-192x192.svg',
        });
      } else {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('알림 설정에 실패했습니다. 나중에 다시 시도해주세요.');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('push-notification-dismissed', Date.now().toString());
  };

  // Don't show if already subscribed or prompt is dismissed
  if (!showPrompt || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              공지사항 알림 받기
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              중요한 공지사항이 올라오면 알림으로 바로 확인하세요!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEnableNotifications}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                알림 켜기
              </button>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700 p-2"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert VAPID public key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
