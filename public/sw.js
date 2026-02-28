// sw.js v3

self.addEventListener('push', function (event) {
  const data = event.data?.json() ?? {};

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'New Order!', {
        body: data.body || 'A new order has been placed.',
        icon: '/icon.png',
        tag: 'new-order',
        renotify: true,
        requireInteraction: true,
        silent: false
      }),
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PLAY_ORDER_SOUND',
            orderNumber: data.orderNumber // pass order number to toast
          });
        });
      })
    ])
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard/orders'));
});
