// Service Worker for Push Notifications
const CACHE_NAME = "backstage-pro-v2";
const NOTIF_TAG = "backstage-notification";

// Install event
self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installed");
  self.skipWaiting();
});

// Activate event - Clear old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activated");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
      })
      .then(() => clients.claim()),
  );
});

// Push event - Handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  event.waitUntil(
    (async () => {
      let data = {
        title: "Backstage Pro",
        body: "Você tem uma nova notificação!",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        url: "/dashboard",
      };

      if (event.data) {
        try {
          const payload = event.data.json();
          console.log("[SW] Push payload:", payload);

          // Suporta formatos:
          // 1) { title, body, icon, badge, url }
          // 2) { notification: { title, body, icon, badge }, data: { url } }
          if (payload && payload.notification) {
            data = {
              ...data,
              title: payload.notification.title || data.title,
              body: payload.notification.body || data.body,
              icon: payload.notification.icon || data.icon,
              badge: payload.notification.badge || data.badge,
              url: (payload.data && payload.data.url) || data.url,
            };
          } else {
            data = { ...data, ...(payload || {}) };
          }
        } catch (e) {
          const text = event.data.text();
          console.log("[SW] Push data as text:", text);
          data.body = text;
        }
      }

      // ✅ MATA DUPLICADAS: fecha qualquer notificação anterior com a mesma TAG
      const existing = await self.registration.getNotifications({ tag: NOTIF_TAG });
      existing.forEach((n) => n.close());

      const options = {
        body: data.body,
        icon: data.icon || "/favicon.ico",
        badge: data.badge || "/favicon.ico",
        tag: NOTIF_TAG,
        renotify: false, // ✅ evita “re-notify” com mesma tag
        requireInteraction: false,
        data: {
          url: data.url || "/dashboard",
          dateOfArrival: Date.now(),
        },
      };

      console.log("[SW] Showing notification with options:", options);
      await self.registration.showNotification(data.title, options);
    })(),
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard";
  const targetUrl = new URL(url, self.location.origin).toString();

  event.waitUntil(
    (async () => {
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if (client.url && client.url.startsWith(self.location.origin) && "focus" in client) {
          try {
            await client.focus();
            await client.navigate(targetUrl);
          } catch {
            // ignore
          }
          return;
        }
      }

      if (clients.openWindow) {
        await clients.openWindow(targetUrl);
      }
    })(),
  );
});

// Fetch event - Network first, no caching for navigation requests
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // For navigation requests (HTML pages), ALWAYS go to network
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // ⚠️ Só funciona se você tiver index.html no cache.
        // Se você não faz precache, esse fallback pode retornar null.
        return caches.match("/index.html");
      }),
    );
    return;
  }

  // For other assets, network first with cache fallback (se existir cache)
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    }),
  );
});
