import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MonthlyRankingRow {
  user_id: string;
  user_name: string;
  show_count: number;
}

/**
 * Ranking mensal compartilhado entre componentes (Dashboard, Teaser, etc).
 * Cache de 15min reduz drasticamente chamadas redundantes ao banco.
 */
export function useMonthlyRanking() {
  return useQuery({
    queryKey: ["monthly-show-ranking"],
    staleTime: 60 * 60 * 1000, // 1h — ranking muda lentamente
    gcTime: 4 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<MonthlyRankingRow[]> => {
      const { data, error } = await supabase.rpc("get_monthly_show_ranking");
      if (error || !data) return [];
      return data as MonthlyRankingRow[];
    },
  });
}
