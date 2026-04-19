import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SidebarBadgeKey = "agenda" | "checklist" | "historico";
type BadgeData = { unseenIds: string[]; count: number };

const EMPTY_BADGE: BadgeData = { unseenIds: [], count: 0 };

function getSeenIds(key: SidebarBadgeKey): string[] {
  try {
    const raw = localStorage.getItem(`sidebar_seen_ids_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function hasInitialized(key: SidebarBadgeKey): boolean {
  return localStorage.getItem(`sidebar_seen_initialized_${key}`) === "true";
}

function initializeSeenIds(key: SidebarBadgeKey, ids: string[]) {
  localStorage.setItem(`sidebar_seen_ids_${key}`, JSON.stringify(ids));
  localStorage.setItem(`sidebar_seen_initialized_${key}`, "true");
}

function markSeenIds(key: SidebarBadgeKey, ids: string[]) {
  const merged = Array.from(new Set([...getSeenIds(key), ...ids]));
  localStorage.setItem(`sidebar_seen_ids_${key}`, JSON.stringify(merged));
  localStorage.setItem(`sidebar_seen_initialized_${key}`, "true");
}

function buildBadgeData(key: SidebarBadgeKey, ids: string[]): BadgeData {
  if (!hasInitialized(key)) {
    initializeSeenIds(key, ids);
    return EMPTY_BADGE;
  }

  const seenIds = new Set(getSeenIds(key));
  const unseenIds = ids.filter((id) => !seenIds.has(id));

  return {
    unseenIds,
    count: unseenIds.length,
  };
}

export function useSidebarBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const agendaQueryKey = ["sidebar-agenda-badge", user?.id];
  const checklistQueryKey = ["sidebar-checklist-badge", user?.id];
  const historicoQueryKey = ["sidebar-historico-badge", user?.id];

  const { data: agendaData = EMPTY_BADGE } = useQuery({
    queryKey: agendaQueryKey,
    queryFn: async () => {
      if (!user) return EMPTY_BADGE;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

      const { data } = await supabase
        .from("shows")
        .select("id")
        .eq("user_id", user.id)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)
        .in("status", ["confirmed", "scheduled", "completed"]);

      return buildBadgeData("agenda", (data ?? []).map((show) => show.id));
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const { data: checklistData = EMPTY_BADGE } = useQuery({
    queryKey: checklistQueryKey,
    queryFn: async () => {
      if (!user) return EMPTY_BADGE;

      const { data: shows } = await supabase
        .from("shows")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "confirmed");

      if (!shows || shows.length === 0) return EMPTY_BADGE;

      const { data } = await supabase
        .from("show_checklist")
        .select("id")
        .in("show_id", shows.map((show) => show.id))
        .eq("completed", false);

      return buildBadgeData("checklist", (data ?? []).map((item) => item.id));
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const { data: historicoData = EMPTY_BADGE } = useQuery({
    queryKey: historicoQueryKey,
    queryFn: async () => {
      if (!user) return EMPTY_BADGE;

      const { data } = await supabase
        .from("shows")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed");

      return buildBadgeData("historico", (data ?? []).map((show) => show.id));
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const dismiss = useCallback(
    (key: SidebarBadgeKey) => {
      const unseenIdsByKey: Record<SidebarBadgeKey, string[]> = {
        agenda: agendaData.unseenIds,
        checklist: checklistData.unseenIds,
        historico: historicoData.unseenIds,
      };

      const queryKeyByKey: Record<SidebarBadgeKey, (string | undefined)[]> = {
        agenda: agendaQueryKey,
        checklist: checklistQueryKey,
        historico: historicoQueryKey,
      };

      markSeenIds(key, unseenIdsByKey[key]);
      queryClient.setQueryData(queryKeyByKey[key], EMPTY_BADGE);
      queryClient.invalidateQueries({ queryKey: queryKeyByKey[key] });
    },
    [agendaData.unseenIds, checklistData.unseenIds, historicoData.unseenIds, queryClient, user?.id],
  );

  return {
    agendaBadge: agendaData.count,
    checklistBadge: checklistData.count,
    historicoBadge: historicoData.count,
    dismiss,
  };
}

