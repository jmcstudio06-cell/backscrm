import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { isWebPushSubscribed, subscribeToWebPush } from "@/lib/webPush";

const PROMPT_DISMISSED_KEY = "notification_prompt_dismissed";
const PROMPT_DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function NotificationPrompt() {
  const { user } = useAuth();
  const prompted = useRef(false);

  useEffect(() => {
    if (!user || prompted.current) return;

    const tryNativePrompt = async () => {
      // Browser support check
      if (
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        return;
      }

      // Already subscribed
      try {
        if (await isWebPushSubscribed()) return;
      } catch {
        // ignore
      }

      // Already denied or granted
      if (Notification.permission !== "default") return;

      // Dismissed recently
      const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < PROMPT_DISMISSED_DURATION) return;
      }

      // Wait a bit before prompting
      const timer = window.setTimeout(async () => {
        prompted.current = true;
        localStorage.setItem(PROMPT_DISMISSED_KEY, Date.now().toString());

        try {
          const granted = await subscribeToWebPush();
          if (granted) {
            toast.success("Notificações ativadas!", {
              description: "Você receberá alertas importantes sobre seus shows.",
            });
          }
        } catch (error) {
          console.error("Error requesting notification permission:", error);
        }
      }, 5000);

      return () => clearTimeout(timer);
    };

    tryNativePrompt();
  }, [user]);

  // No UI — uses native browser prompt only
  return null;
}
