import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToWebPush } from "@/lib/webPush";

/**
 * Silently re-registers the push subscription on every app load.
 * iOS Safari PWA invalidates push endpoints when the app is suspended,
 * so we must refresh the subscription each time to keep it active.
 */
export function PushSubscriptionRefresher() {
  const { user } = useAuth();
  const lastProcessedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      lastProcessedUserId.current = null;
      return;
    }
    
    // Prevent multiple runs for the same user in the same session
    if (lastProcessedUserId.current === user.id) return;
    
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    lastProcessedUserId.current = user.id;

    // Small delay to not block initial render
    const timer = setTimeout(async () => {
      try {
        await subscribeToWebPush();
        console.log("[PushRefresh] Subscription refresh check completed");
      } catch (err) {
        console.error("[PushRefresh] Failed to check/refresh subscription:", err);
      }
    }, 5000); // Increased delay slightly to ensure stability

    return () => clearTimeout(timer);
  }, [user]);

  return null;
}
