import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSidebarBadges() {
  const { user } = useAuth();

  // Shows do mês vigente para badge da Agenda
  const { data: currentMonthShows = 0 } = useQuery({
    queryKey: ["sidebar-agenda-badge", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

      const { count } = await supabase
        .from("shows")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)
        .in("status", ["confirmed", "scheduled", "completed"]);

      return count || 0;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Shows com checklist pendente (para Checklist de Show)
  const { data: pendingChecklistCount = 0 } = useQuery({
    queryKey: ["sidebar-checklist-badge", user?.id],
    queryFn: async () => {
      if (!user) return 0;
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
        .eq("completed", false);

      return count || 0;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Shows recém-realizados (completed hoje) para Histórico
  const { data: recentCompletedCount = 0 } = useQuery({
    queryKey: ["sidebar-historico-badge", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const today = new Date().toISOString().split("T")[0];
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];

      const { count } = await supabase
        .from("shows")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("date", threeDaysAgo)
        .lte("date", today);

      return count || 0;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  return {
    agendaBadge: currentMonthShows,
    checklistBadge: pendingChecklistCount,
    historicoBadge: recentCompletedCount,
  };
}
