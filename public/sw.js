// Service Worker for Push Notifications (Backstage Pro)
const SW_VERSION = "backstage-pro-sw-v3";
const DEFAULT_URL = "/dashboard";
const DEFAULT_ICON = "/favicon.ico";
const DEFAULT_BADGE = "/favicon.ico";

// Install
self.addEventListener("install", (event) => {
  console.log(`[SW] Installed: ${SW_VERSION}`);
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activated: ${SW_VERSION}`);
  event.waitUntil((async () => {
    // Não vamos deletar caches aqui porque você não está realmente usando cache offline.
    // Isso evita apagar caches que outros SW/rotas possam usar.
    await clients.claim();
  })());
});

// Helpers
function normalizePayload(payload) {
  // Suporta:
  // 1) { title, body, icon, badge, url }
  // 2) { notification: { title, body, icon, badge }, data: { url } } (padrão comum)
  // 3) texto simples
  const base = {
    title: "Backstage Pro",
    body: "Você tem uma nova notificação!",
    icon: DEFAULT_ICON,
    badge: DEFAULT_BADGE,
    url: DEFAULT_URL,
  };

  if (!payload) return base;

  // Texto
  if (typeof payload === "string") {
    return { ...base, body: payload };
  }

  // Formato padrão
  if (payload.notification) {
    return {
      ...base,
      title: payload.notification.title || base.title,
      body: payload.notification.body || base.body,
      icon: payload.notification.icon || base.icon,
      badge: payload.notification.badge || base.badge,
      url: (payload.data && payload.data.url) || payload.url || base.url,
    };
  }

  // Seu formato direto
  return {
    ...base,
    title: payload.title || base.title,
    body: payload.body || base.body,
    icon: payload.icon || base.icon,
    badge: payload.badge || base.badge,
    url: payload.url || base.url,
  };
}

// Push
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  event.waitUntil((async () => {
    let payload = null;

    if (event.data) {
      try {
        payload = event.data.json();
        console.log("[SW] Payload JSON:", payload);
      } catch (e) {
        const text = event.data.text();
        console.log("[SW] Payload text:", text);
        payload = text;
      }
    }

    const data = normalizePayload(payload);

    const options = {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: "backstage-notification",      // agrupa notificações
      renotify: true,                      // se repetir tag, notifica de novo
      requireInteraction: false,           // não “prende” a notificação
      silent: false,
      timestamp: Date.now(),
      data: {
        url: data.url || DEFAULT_URL,
      },
    };

    console.log("[SW] showNotification:", data.title, options);
    await self.registration.showNotification(data.title, options);
  })());
});

// Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || DEFAULT_URL;
  const targetUrl = new URL(url, self.location.origin).t
