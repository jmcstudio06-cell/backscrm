 // Service Worker for Push Notifications
 const CACHE_NAME = 'backstage-pro-v1';
 
 // Install event
 self.addEventListener('install', (event) => {
   console.log('Service Worker installed');
   self.skipWaiting();
 });
 
 // Activate event
 self.addEventListener('activate', (event) => {
   console.log('Service Worker activated');
   event.waitUntil(clients.claim());
 });
 
 // Push event - Handle incoming push notifications
 self.addEventListener('push', (event) => {
   console.log('Push notification received:', event);
 
   let data = {
     title: 'Backstage Pro',
     body: 'Você tem uma nova notificação!',
     icon: '/favicon.ico',
     badge: '/favicon.ico',
     url: '/dashboard'
   };
 
   if (event.data) {
     try {
       data = { ...data, ...event.data.json() };
     } catch (e) {
       data.body = event.data.text();
     }
   }
 
   const options = {
     body: data.body,
     icon: data.icon || '/favicon.ico',
     badge: data.badge || '/favicon.ico',
     vibrate: [100, 50, 100],
     data: {
       url: data.url || '/dashboard',
       dateOfArrival: Date.now()
     },
     actions: [
       { action: 'open', title: 'Abrir' },
       { action: 'close', title: 'Fechar' }
     ]
   };
 
   event.waitUntil(
     self.registration.showNotification(data.title, options)
   );
 });
 
 // Notification click event
 self.addEventListener('notificationclick', (event) => {
   console.log('Notification clicked:', event);
   event.notification.close();
 
   const url = event.notification.data?.url || '/dashboard';
 
   if (event.action === 'close') {
     return;
   }
 
   event.waitUntil(
     clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
       // Check if there is already a window open
       for (let client of windowClients) {
         if (client.url.includes(self.location.origin) && 'focus' in client) {
           client.navigate(url);
           return client.focus();
         }
       }
       // Open a new window
       if (clients.openWindow) {
         return clients.openWindow(url);
       }
     })
   );
 });
 
 // Fetch event - Basic caching strategy
 self.addEventListener('fetch', (event) => {
   // Skip non-GET requests
   if (event.request.method !== 'GET') return;
 
   // Skip cross-origin requests
   if (!event.request.url.startsWith(self.location.origin)) return;
 
   event.respondWith(
     fetch(event.request).catch(() => {
       return caches.match(event.request);
     })
   );
 });