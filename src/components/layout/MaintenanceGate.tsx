import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_MESSAGE =
  "Estamos realizando uma atualização rápida no aplicativo. Volte em alguns minutos.";

/** Public paths that keep working even during maintenance (artist links). */
const PUBLIC_PREFIXES = ["/link/", "/orcamento/", "/artista/", "/assinar/", "/termos", "/privacidade"];

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdmin();
  const { pathname } = useLocation();
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["maintenance_mode", "maintenance_message"]);
      if (cancelled || !data) return;
      const mode = data.find((s) => s.setting_key === "maintenance_mode")?.setting_value;
      const msg = data.find((s) => s.setting_key === "maintenance_message")?.setting_value;
      setEnabled(mode === "true");
      if (msg) setMessage(msg);
    };
    check();
    const id = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pathname]);

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (!enabled || isAdmin || isPublic) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-6">
      <div className="w-full max-w-md text-center rounded-3xl border bg-card/80 backdrop-blur-xl shadow-2xl p-8 space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Wrench className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold">Aplicativo em manutenção</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
          <Loader2 className="w-4 h-4 mr-2" /> Tentar novamente
        </Button>
      </div>
    </div>
  );
}
