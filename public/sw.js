const CACHE_NAME = "backstage-pro-v4";
const NOTIF_TAG = "backstage-notification";

// Notification assets
const DEFAULT_ICON = "/icons/icon-192.png";
const DEFAULT_BADGE = "/icons/badge-72.png"; // se não tiver, pode apontar pro mono-192

self.addEventListener("install", () => {
  console.log("[SW] installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] activated");
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => clients.claim()),
  );
});

self.addEventListener("push", (event) => {
  console.log("[SW] push received");

  event.waitUntil(
    (async () => {
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

          // Formatos suportados:
          // 1) { title, body, icon, badge, url }
          // 2) { notification: { title, body, icon, badge }, data: { url } }
          if (payload?.notification) {
            data.title = payload.notification.title || data.title;
            data.body = payload.notification.body || data.body;
            data.icon = payload.notification.icon || data.icon;
            data.badge = payload.notification.badge || data.badge;
            data.url = payload.data?.url || data.url;
          } else if (payload) {
            data.title = payload.title || data.title;
            data.body = payload.body || data.body;
            data.icon = payload.icon || data.icon;
            data.badge = payload.badge || data.badge;
            data.url = payload.url || data.url;
          }
        } catch {
          try {
            const text = event.data.text();
            if (text) data.body = text;
          } catch {
            // ignore
          }
        }
      }

      // Close duplicates (may not work on iOS)
      try {
        const existing = await self.registration.getNotifications({ tag: NOTIF_TAG });
        existing.forEach((n) => n.close());
      } catch {
        // ignore on iOS
      }

      const options = {
        body: data.body,
        icon: data.icon || DEFAULT_ICON,
        badge: data.badge || DEFAULT_BADGE,
        tag: NOTIF_TAG,
        renotify: true,
        requireInteraction: false,
        data: { url: data.url || "/dashboard" },
      };

      await self.registration.showNotification(data.title, options);
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || "/dashboard";
  const targetUrl = new URL(url, self.location.origin).toString();

  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });

      for (const client of windows) {
        if (client.url?.startsWith(self.location.origin) && "focus" in client) {
          await client.focus();
          if ("navigate" in client) await client.navigate(targetUrl);
          return;
        }
      }

      if (clients.openWindow) await clients.openWindow(targetUrl);
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/index.html")));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
