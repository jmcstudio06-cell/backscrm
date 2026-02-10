import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToWebPush } from "@/lib/webPush";

/**
 * Silently re-registers the push subscription on every app load.
 * iOS Safari PWA invalidates push endpoints when the app is suspended,
 * so we must refresh the subscription each time to keep it active.
 */
export function PushSubscriptionRefresher() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    // Small delay to not block initial render
    const timer = setTimeout(async () => {
      try {
        await subscribeToWebPush();
        console.log("[PushRefresh] Subscription refreshed successfully");
      } catch (err) {
        console.error("[PushRefresh] Failed to refresh subscription:", err);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user]);

  return null;
}
