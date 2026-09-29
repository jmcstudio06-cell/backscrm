import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { subscribeToWebPush } from "@/lib/webPush";
import { Bell, X } from "lucide-react";

const PROMPT_DISMISSED_KEY = "notification_prompt_dismissed";
const PROMPT_ANSWERED_KEY = "notification_prompt_answered";
const PROMPT_DISMISSED_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days

export function NotificationPrompt() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (!user) {
      console.log("[NotifPrompt] No user, skipping");
      return;
    }

    const check = async () => {
      const hasNotification = "Notification" in window;
      const hasSW = "serviceWorker" in navigator;
      const hasPush = "PushManager" in window;

      console.log("[NotifPrompt] Support check:", { hasNotification, hasSW, hasPush });

      if (!hasNotification || !hasSW || !hasPush) {
        console.log("[NotifPrompt] Browser doesn't support push notifications");

        // iPhone/iPad no Safari: push só funciona com o app na tela inicial.
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
        const standalone =
          window.matchMedia?.("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone === true;

        if (isIOS && !standalone) {
          const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_KEY);
          if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < PROMPT_DISMISSED_DURATION) return;
          setIosHint(true);
          setVisible(true);
        }
        return;
      }



      const permission = Notification.permission;
      console.log("[NotifPrompt] Current permission:", permission);

      // Already denied — can't prompt again
      if (permission === "denied") {
        localStorage.setItem(PROMPT_ANSWERED_KEY, "denied");
        console.log("[NotifPrompt] Permission denied, can't show prompt");
        return;
      }

      // Permission and subscription are separate. Once permission is granted,
      // the silent refresher repairs/syncs the subscription without bothering
      // the user with the activation banner again.
      if (permission === "granted") {
        localStorage.setItem(PROMPT_ANSWERED_KEY, "granted");
        console.log("[NotifPrompt] Permission already granted, skipping prompt");
        return;
      }

      // A previous explicit answer should not be presented again. Browser
      // permission changes are still respected first by the checks above.
      if (localStorage.getItem(PROMPT_ANSWERED_KEY)) return;

      // Dismissed recently
      const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        console.log("[NotifPrompt] Dismissed", Math.round(elapsed / 1000 / 60), "minutes ago");
        if (elapsed < PROMPT_DISMISSED_DURATION) return;
      }

      console.log("[NotifPrompt] Showing banner!");
      setVisible(true);
    };

    // Delay to not block initial render
    const timer = setTimeout(check, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const granted = await subscribeToWebPush();
      console.log("[NotifPrompt] subscribeToWebPush result:", granted);
      if (granted) {
        localStorage.setItem(PROMPT_ANSWERED_KEY, "granted");
        toast.success("Notificações ativadas!", {
          description: "Você receberá alertas importantes sobre seus shows.",
        });
      } else if ("Notification" in window && Notification.permission === "denied") {
        localStorage.setItem(PROMPT_ANSWERED_KEY, "denied");
      }
    } catch (error) {
      console.error("[NotifPrompt] Error:", error);
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
          {iosHint ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              No iPhone, adicione o Backstage Pro à tela de início (botão Compartilhar → Adicionar à Tela de Início) e
              abra pelo ícone para receber os avisos.
            </p>
          ) : (
            <>
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
            </>
          )}
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
