import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function usePendingChecklist() {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const lastFetch = useRef(0);

  useEffect(() => {
    if (!user) {
      setPendingCount(0);
      setLoading(false);
      return;
    }

    const fetchPendingCount = async () => {
      // Debounce: skip if fetched less than 5s ago
      const now = Date.now();
      if (now - lastFetch.current < 5000) return;
      lastFetch.current = now;

      try {
        // Busca shows confirmados do usuário
        const { data: shows } = await supabase
          .from("shows")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "confirmado");

        if (!shows || shows.length === 0) {
          setPendingCount(0);
          setLoading(false);
          return;
        }

        const showIds = shows.map((s) => s.id);

        // Conta itens de checklist não completados
        const { count } = await supabase
          .from("show_checklist")
          .select("*", { count: "exact", head: true })
          .in("show_id", showIds)
          .eq("completed", false);

        setPendingCount(count || 0);
      } catch (error) {
        console.error("Error fetching pending checklist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCount();

    // No realtime subscription - it triggered re-fetches for ALL users' changes
    // The count refreshes on page navigation which is sufficient
  }, [user]);

  return { pendingCount, loading };
}
