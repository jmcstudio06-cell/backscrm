import { useState, useEffect, useRef } from "react";
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
import {
  initOneSignal,
  promptForPushNotifications,
  setExternalUserId,
} from "@/lib/onesignal";

const PROMPT_DISMISSED_KEY = "notification_prompt_dismissed";
const PROMPT_DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function NotificationPrompt() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstruction, setShowIOSInstruction] = useState(false);
  const [loading, setLoading] = useState(false);
  const promptTimers = useRef<number[]>([]);
  const promptOpenRef = useRef(false);
  const iosOpenRef = useRef(false);

  useEffect(() => {
    promptOpenRef.current = showPrompt;
  }, [showPrompt]);

  useEffect(() => {
    iosOpenRef.current = showIOSInstruction;
  }, [showIOSInstruction]);

  useEffect(() => {
    if (user) {
      initializeOneSignal();
    }

    return () => {
      // If user navigates away while the dialog is open, treat as dismiss
      if (promptOpenRef.current || iosOpenRef.current) {
        localStorage.setItem(PROMPT_DISMISSED_KEY, Date.now().toString());
      }

      // Avoid showing prompts after route changes/unmounts
      promptTimers.current.forEach((id) => clearTimeout(id));
      promptTimers.current = [];
    };
  }, [user]);

  const initializeOneSignal = async () => {
    try {
      await initOneSignal();

      // Don't login/link user before permission/subscription, it can break the SDK on some devices.
      // We'll link the user after they grant permission.

      // Check if we should show the prompt
      checkNotificationStatus();
    } catch (error) {
      console.error("Error initializing OneSignal:", error);
    }
  };

  const checkNotificationStatus = () => {
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      promptTimers.current.push(id);
      return id;
    };

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("Notifications not supported");
      return;
    }

    // Check if already granted
    if (Notification.permission === "granted") {
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
      schedule(() => setShowIOSInstruction(true), 2000);
      return;
    }

    // Show prompt after a delay
    schedule(() => {
      if (user) {
        setShowPrompt(true);
      }
    }, 3000);
  };

  const requestNotificationPermission = async () => {
    setLoading(true);
    try {
      const granted = await promptForPushNotifications();

      // Avoid re-prompting immediately if user navigates away
      localStorage.setItem(PROMPT_DISMISSED_KEY, Date.now().toString());

      if (granted) {
        // Link OneSignal subscription to our user AFTER opt-in
        if (user) {
          await setExternalUserId(user.id);
        }

        toast.success("Notificações ativadas! 🔔", {
          description: "Você receberá alertas importantes sobre seus shows.",
        });
      } else {
        toast.error("Notificações não ativadas", {
          description:
            "Se o pop-up do sistema não apareceu, feche e abra o app e tente de novo. Você também pode checar as permissões do navegador.",
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

  const handlePromptOpenChange = (open: boolean) => {
    if (!open) {
      // If it closes by clicking outside, Esc, route change, etc. treat as dismiss
      dismissPrompt();
      return;
    }
    setShowPrompt(true);
  };

  const handleIOSOpenChange = (open: boolean) => {
    if (!open) {
      dismissIOSInstruction();
      return;
    }
    setShowIOSInstruction(true);
  };

  // iOS PWA installation instruction
  if (showIOSInstruction) {
    return (
      <AlertDialog open={showIOSInstruction} onOpenChange={handleIOSOpenChange}>
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
    <AlertDialog open={showPrompt} onOpenChange={handlePromptOpenChange}>
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
