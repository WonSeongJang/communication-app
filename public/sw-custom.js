// Custom Service Worker for Push Notifications

// Listen for push events
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received', event);

  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || '새 알림';
    const options = {
      body: data.body || '',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-192x192.svg',
      tag: data.tag || 'default-notification',
      data: {
        url: data.url || '/',
      },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
  }
});

// Listen for notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab with the URL
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Listen for service worker messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
