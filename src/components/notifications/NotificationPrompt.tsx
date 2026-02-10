import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { isWebPushSubscribed, subscribeToWebPush } from "@/lib/webPush";
import { Bell, X } from "lucide-react";

const PROMPT_DISMISSED_KEY = "notification_prompt_dismissed";
const PROMPT_DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function NotificationPrompt() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const check = async () => {
      if (
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) return;

      // Already granted & subscribed
      try {
        if (await isWebPushSubscribed()) return;
      } catch { /* ignore */ }

      // Already denied — can't prompt again
      if (Notification.permission === "denied") return;

      // Dismissed recently
      const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < PROMPT_DISMISSED_DURATION) return;
      }

      // Show banner after short delay
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    };

    check();
  }, [user]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const granted = await subscribeToWebPush();
      if (granted) {
        toast.success("Notificações ativadas!", {
          description: "Você receberá alertas importantes sobre seus shows.",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setVisible(false);
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 bg-primary/10 rounded-full p-2.5">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Ativar notificações</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Receba lembretes de shows, cobranças e alertas importantes.
          </p>
          <button
            onClick={handleEnable}
            disabled={loading}
            className="mt-2 bg-primary text-primary-foreground text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Ativando..." : "Ativar agora"}
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
