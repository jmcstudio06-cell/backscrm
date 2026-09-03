import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "last_seen_ping_at";
const MIN_INTERVAL_MS = 60 * 60 * 1000; // no máximo 1 escrita por hora por usuário

/**
 * Atualiza profiles.last_seen no máximo 1x por hora, para que o painel
 * administrativo mostre corretamente os usuários ativos sem gerar
 * escritas desnecessárias no banco.
 */
export function LastSeenTracker() {
  const { user } = useAuth();
  const doneRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      doneRef.current = null;
      return;
    }
    if (doneRef.current === user.id) return;
    doneRef.current = user.id;

    const key = `${STORAGE_KEY}:${user.id}`;
    const last = Number(localStorage.getItem(key) || 0);
    if (Date.now() - last < MIN_INTERVAL_MS) return;

    const timer = setTimeout(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("user_id", user.id);
      if (!error) localStorage.setItem(key, String(Date.now()));
    }, 3000);

    return () => clearTimeout(timer);
  }, [user]);

  return null;
}
