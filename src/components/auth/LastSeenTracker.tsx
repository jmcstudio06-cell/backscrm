import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "last_seen_ping_at";
const MIN_INTERVAL_MS = 15 * 60 * 1000;
const PUBLIC_PATHS = new Set(["/", "/auth", "/landing", "/reset-password", "/auth/confirm"]);

/**
 * Registra uma visita ao aplicativo e interações reais enquanto ele está visível.
 * A renovação automática da sessão não conta como atividade.
 */
export function LastSeenTracker() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const userId = user?.id;

  useEffect(() => {
    if (!userId || PUBLIC_PATHS.has(pathname) || document.visibilityState !== "visible") return;

    const key = `${STORAGE_KEY}:${userId}`;
    let inFlight = false;
    let disposed = false;

    const recordVisit = async () => {
      if (disposed || inFlight || document.visibilityState !== "visible") return;
      const last = Number(localStorage.getItem(key) || 0);
      if (Date.now() - last < MIN_INTERVAL_MS) return;
      inFlight = true;
      const now = Date.now();
      const { error } = await supabase.from("profiles")
        .update({ last_seen: new Date(now).toISOString() })
        .eq("user_id", userId);
      if (!error) localStorage.setItem(key, String(now));
      inFlight = false;
    };

    const onReturn = () => { if (document.visibilityState === "visible") void recordVisit(); };
    const onActivity = () => { void recordVisit(); };
    const timer = window.setTimeout(onReturn, 3000);
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("touchstart", onActivity);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [userId, pathname]);

  return null;
}
