import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bell, Smartphone } from "lucide-react";

const PROMPT_DISMISSED_KEY = "notification_prompt_dismissed";
const PROMPT_DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

// Cache for VAPID key
let cachedVapidKey: string | null = null;

async function getVapidPublicKey(): Promise<string | null> {
  if (cachedVapidKey) return cachedVapidKey;
  
  try {
    const { data, error } = await supabase.functions.invoke("get-vapid-key");
    if (error) {
      console.error("Error fetching VAPID key:", error);
      return null;
    }
    cachedVapidKey = data?.publicKey || null;
    return cachedVapidKey;
  } catch (error) {
    console.error("Error fetching VAPID key:", error);
    return null;
  }
}

export function NotificationPrompt() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstruction, setShowIOSInstruction] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, [user]);

  const checkNotificationStatus = () => {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("Notifications not supported");
      return;
    }

    // Check if already granted
    if (Notification.permission === "granted") {
      // Already granted - make sure we have a subscription
      ensureSubscription();
      return;
    }

    // Check if already denied
    if (Notification.permission === "denied") {
      return;
    }

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < PROMPT_DISMISSED_DURATION) {
        return;
      }
    }

    // Check if running as standalone PWA on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // On iOS, push only works if installed as PWA
    if (isIOS && !isStandalone) {
      // Show iOS-specific instruction to install PWA first
      setTimeout(() => setShowIOSInstruction(true), 2000);
      return;
    }

    // Show prompt after a delay
    setTimeout(() => {
      if (user) {
        setShowPrompt(true);
      }
    }, 3000);
  };

  const ensureSubscription = async () => {
    if (!user || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    try {
      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) {
        console.error("Could not get VAPID key");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      if (subscription) {
        await saveSubscription(subscription);
      }
    } catch (error) {
      console.error("Error ensuring subscription:", error);
    }
  };

  const saveSubscription = async (subscription: PushSubscription) => {
    if (!user) return;

    const keys = subscription.toJSON().keys;
    if (!keys) {
      console.error("No keys in subscription");
      return;
    }

    try {
      // Check if subscription already exists
      const { data: existing } = await supabase
        .from("user_push_subscriptions")
        .select("id, endpoint")
        .eq("user_id", user.id)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update if endpoint changed
        if (existing[0].endpoint !== subscription.endpoint) {
          await supabase
            .from("user_push_subscriptions")
            .update({
              endpoint: subscription.endpoint,
              p256dh: keys.p256dh || "",
              auth: keys.auth || "",
              is_active: true,
            })
            .eq("id", existing[0].id);
          console.log("Push subscription updated");
        }
      } else {
        // Create new
        await supabase.from("user_push_subscriptions").insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: keys.p256dh || "",
          auth: keys.auth || "",
          is_active: true,
        });
        console.log("Push subscription created");
      }
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  };

  const requestNotificationPermission = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Get VAPID key
        const vapidKey = await getVapidPublicKey();
        if (!vapidKey) {
          toast.error("Erro de configuração", {
            description: "Chave VAPID não encontrada.",
          });
          return;
        }

        // Register service worker if not already registered
        if ("serviceWorker" in navigator && "PushManager" in window) {
          const registration = await navigator.serviceWorker.ready;

          // Subscribe to push notifications with VAPID key
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            console.log("Push subscription created:", subscription.endpoint);

            // Save to database
            await saveSubscription(subscription);

            toast.success("Notificações ativadas! 🔔", {
              description: "Você receberá alertas importantes sobre seus shows.",
            });
          } catch (subscribeError) {
            console.error("Error subscribing to push:", subscribeError);
            toast.error("Erro ao ativar notificações", {
              description: "Tente novamente mais tarde.",
            });
          }
        }
      } else if (permission === "denied") {
        toast.error("Notificações bloqueadas", {
          description: "Você pode ativar nas configurações do navegador.",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Erro ao ativar notificações");
    } finally {
      setLoading(false);
      setShowPrompt(false);
    }
  };

  const dismissPrompt = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  const dismissIOSInstruction = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, Date.now().toString());
    setShowIOSInstruction(false);
  };

  // iOS PWA installation instruction
  if (showIOSInstruction) {
    return (
      <AlertDialog open={showIOSInstruction} onOpenChange={setShowIOSInstruction}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              Instale o App para Notificações
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3">
              <p>
                Para receber notificações no iPhone, você precisa instalar o
                Backstage Pro na tela inicial.
              </p>
              <div className="bg-muted p-3 rounded-lg text-left text-sm space-y-2">
                <p className="font-medium">Como instalar:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>
                    Toque no botão <span className="font-medium">Compartilhar</span>{" "}
                    (📤)
                  </li>
                  <li>
                    Role e toque em{" "}
                    <span className="font-medium">"Adicionar à Tela de Início"</span>
                  </li>
                  <li>
                    Toque em <span className="font-medium">"Adicionar"</span>
                  </li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground">
                Requer iOS 16.4 ou superior
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={dismissIOSInstruction} className="w-full">
              Depois
            </AlertDialogCancel>
            <AlertDialogAction onClick={dismissIOSInstruction} className="w-full">
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Main notification permission prompt
  return (
    <AlertDialog open={showPrompt} onOpenChange={setShowPrompt}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full animate-pulse">
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">
            Ativar Notificações? 🔔
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-2">
            <p>Receba alertas importantes sobre:</p>
            <ul className="text-left text-sm space-y-1 bg-muted p-3 rounded-lg">
              <li>🎤 Lembretes de shows agendados</li>
              <li>💰 Cachês pendentes de pagamento</li>
              <li>🎯 Progresso das suas metas</li>
              <li>📣 Novidades e dicas exclusivas</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={dismissPrompt} className="w-full">
            Agora não
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={requestNotificationPermission}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Ativando..." : "Ativar Notificações"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
