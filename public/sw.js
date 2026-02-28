// sw.js v2

self.addEventListener('push', function (event) {
  const data = event.data?.json() ?? {};

  event.waitUntil(
    Promise.all([
      // 1. Show native notification
      self.registration.showNotification(data.title || 'New Order!', {
        body: data.body || 'A new order has been placed.',
        icon: '/icon.png',
        tag: 'new-order',
        renotify: true,
        requireInteraction: true,
        silent: false
      }),

      // 2. Message any open tabs to play the MP3
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'PLAY_ORDER_SOUND' });
        });
      })
    ])
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard/orders'));
});
