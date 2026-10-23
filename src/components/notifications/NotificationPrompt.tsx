import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Bell, CalendarDays, CheckCircle2, Target, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { subscribeToWebPush } from "@/lib/webPush";
import { isAppInstalled } from "@/lib/pwaInstall";
import { PUBLIC_PREFIXES } from "@/components/onboarding/OnboardingGate";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/**
 * Asked exactly once per device. The flag is written the moment the explanation is shown, so it never
 * returns, whether the person accepts, declines or simply closes the app.
 */
const PROMPT_SHOWN_KEY = "notification_prompt_shown_v2";

const BENEFITS = [
  { icon: CalendarDays, text: "Lembrete do seu show, com dia, hora e local" },
  { icon: Wallet, text: "Aviso de cachês que ainda faltam receber" },
  { icon: Target, text: "Como estão suas metas do mês" },
  { icon: Bell, text: "Aviso antes do seu acesso vencer" },
];

export function NotificationPrompt() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const isPublicRoute = pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));

  useEffect(() => {
    if (!user || profileLoading || !profile || isPublicRoute || visible) return;

    // Only inside the installed app (home-screen icon). On iPhone, push does not work anywhere else.
    if (!isAppInstalled()) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Permission already answered (granted or denied): never ask again. A granted permission is
    // repaired silently by PushSubscriptionRefresher.
    if (Notification.permission !== "default") return;

    // Let the first-access onboarding finish before showing anything else.
    if (!profile.onboarding_completed) return;

    try {
      if (localStorage.getItem(PROMPT_SHOWN_KEY)) return;
    } catch {
      return; // can't remember the answer: better to never ask than to ask every time
    }

    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(PROMPT_SHOWN_KEY, String(Date.now()));
      } catch {
        return;
      }
      setVisible(true);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [user, profile, profileLoading, isPublicRoute, visible]);

  const handleEnable = async () => {
    setBusy(true);
    try {
      const granted = await subscribeToWebPush();
      if (granted) {
        toast.success("Notificações ativadas!", { description: "Você vai receber seus avisos importantes." });
      }
    } catch (error) {
      // Permission may have been granted even if the subscription failed; the silent refresher retries it.
      console.error("[NotifPrompt] Error:", error);
    } finally {
      setVisible(false);
      setBusy(false);
    }
  };

  if (!visible) return null;

  return (
    <Dialog open onOpenChange={() => undefined}>
      <DialogContent
        className="max-w-sm gap-0 p-0 overflow-hidden [&>button:last-child]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-br from-primary to-sky-500 px-6 pb-6 pt-7 text-center text-white">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/20">
            <Bell className="h-7 w-7" />
          </span>
          <DialogTitle className="mt-4 text-xl text-white">Não perca nenhum aviso</DialogTitle>
          <DialogDescription className="mt-1 text-white/85">
            Ative as notificações para o Backstage Pro te avisar na hora certa.
          </DialogDescription>
        </div>

        <div className="space-y-4 px-6 py-5">
          <ul className="space-y-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-foreground">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <p className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-primary" />
            Sem isso, você só vê esses avisos se abrir o app por conta própria, e pode perder o horário de um show ou
            deixar um cachê passar. Em seguida o aparelho vai perguntar: toque em <strong>Permitir</strong>. Esta
            pergunta aparece uma única vez.
          </p>

          <div className="flex flex-col gap-2">
            <Button size="lg" onClick={handleEnable} disabled={busy} className="w-full">
              {busy ? "Ativando..." : "Ativar notificações"}
            </Button>
            <Button variant="ghost" onClick={() => setVisible(false)} disabled={busy} className="w-full text-muted-foreground">
              Agora não
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
