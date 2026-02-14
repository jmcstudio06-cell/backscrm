// Service Worker for Push Notifications (PWA)
const CACHE_NAME = "backstage-pro-v3";
const NOTIF_TAG = "backstage-notification";

// ✅ ÍCONES PADRÃO (use os do seu PWA)
const DEFAULT_ICON = "/icons/icon-192.png"; // logo "grande" (colorido ok)
const DEFAULT_BADGE = "/icons/badge-72.png"; // ícone pequeno (Android: branco/transparente)

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
      // ✅ Defaults
      let data = {
        title: "Backstage Pro",
        body: "Você tem uma nova notificação!",
        icon: DEFAULT_ICON,
        badge: DEFAULT_BADGE,
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
          } else if (payload) {
            data = {
              ...data,
              title: payload.title || data.title,
              body: payload.body || data.body,
              icon: payload.icon || data.icon,
              badge: payload.badge || data.badge,
              url: payload.url || data.url,
            };
          }
        } catch (e) {
          // Se vier texto puro
          try {
            const text = event.data.text();
            console.log("[SW] Push data as text:", text);
            data.body = text || data.body;
          } catch {
            // ignore
          }
        }
      }

      // ✅ Fecha notificação anterior com mesma tag (evita duplicadas)
      const existing = await self.registration.getNotifications({ tag: NOTIF_TAG });
      existing.forEach((n) => n.close());

      // ✅ Normaliza URL
      const safeUrl = data.url && typeof data.url === "string" ? data.url : "/dashboard";

      const options = {
        body: data.body,
        // ✅ Aqui é onde o Android “fica bonito”
        icon: data.icon || DEFAULT_ICON,
        badge: data.badge || DEFAULT_BADGE,

        tag: NOTIF_TAG,
        renotify: false,
        requireInteraction: false,

        // (Opcional) mostra a hora certinha em alguns Androids
        timestamp: Date.now(),

        data: {
          url: safeUrl,
          dateOfArrival: Date.now(),
        },
      };

      console.log("[SW] Showing notification:", data.title, options);
      await self.registration.showNotification(data.title, options);
    })(),
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");
  event.notification.close();

  const url = event.notification?.data?.url || "/dashboard";
  const targetUrl = new URL(url, self.location.origin).toString();

  event.waitUntil(
    (async () => {
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Se já tem aba aberta, foca e navega
      for (const client of windowClients) {
        if (client.url && client.url.startsWith(self.location.origin) && "focus" in client) {
          try {
            await client.focus();
            if ("navigate" in client) await client.navigate(targetUrl);
          } catch {
            // ignore
          }
          return;
        }
      }

      // Se não tem, abre nova
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
        return caches.match("/index.html");
      }),
    );
    return;
  }

  // For other assets, network first with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    }),
  );
});
