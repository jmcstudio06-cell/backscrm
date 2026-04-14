import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function getLastSeen(key: string): string | null {
  return localStorage.getItem(`sidebar_seen_${key}`);
}

function markSeen(key: string) {
  localStorage.setItem(`sidebar_seen_${key}`, new Date().toISOString());
}

export function useSidebarBadges() {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);

  // Shows criados desde a última visita à Agenda
  const { data: agendaBadge = 0 } = useQuery({
    queryKey: ["sidebar-agenda-badge", user?.id, version],
    queryFn: async () => {
      if (!user) return 0;
      const lastSeen = getLastSeen("agenda");
      if (!lastSeen) return 0;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

      const { count } = await supabase
        .from("shows")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)
        .in("status", ["confirmed", "scheduled", "completed"])
        .gt("created_at", lastSeen);

      return count || 0;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Checklist items criados desde a última visita
  const { data: checklistBadge = 0 } = useQuery({
    queryKey: ["sidebar-checklist-badge", user?.id, version],
    queryFn: async () => {
      if (!user) return 0;
      const lastSeen = getLastSeen("checklist");
      if (!lastSeen) return 0;

      const { data: shows } = await supabase
        .from("shows")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "confirmed");

      if (!shows || shows.length === 0) return 0;

      const { count } = await supabase
        .from("show_checklist")
        .select("*", { count: "exact", head: true })
        .in("show_id", shows.map((s) => s.id))
        .eq("completed", false)
        .gt("created_at", lastSeen);

      return count || 0;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Shows que foram auto-completados desde a última visita ao Histórico
  const { data: historicoBadge = 0 } = useQuery({
    queryKey: ["sidebar-historico-badge", user?.id, version],
    queryFn: async () => {
      if (!user) return 0;
      const lastSeen = getLastSeen("historico");
      if (!lastSeen) return 0;

      const { count } = await supabase
        .from("shows")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gt("updated_at", lastSeen);

      return count || 0;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const dismiss = useCallback((key: string) => {
    markSeen(key);
    setVersion((v) => v + 1);
  }, []);

  // Initialize last-seen on first load so badges don't show for old data
  if (user) {
    if (!getLastSeen("agenda")) markSeen("agenda");
    if (!getLastSeen("checklist")) markSeen("checklist");
    if (!getLastSeen("historico")) markSeen("historico");
  }

  return {
    agendaBadge,
    checklistBadge,
    historicoBadge,
    dismiss,
  };
}
