import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useWorkspace } from "./useWorkspace";

export type FinancialMode = "automatic" | "manual";

export function useFinancialMode() {
  const { user } = useAuth();
  const { ownerId, loading: workspaceLoading } = useWorkspace();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["financial-mode", ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("financial_mode")
        .eq("user_id", ownerId!)
        .maybeSingle();
      if (error) throw error;
      return ((data?.financial_mode as FinancialMode) || "automatic") as FinancialMode;
    },
    enabled: !!user && !!ownerId && !workspaceLoading,
    staleTime: 60 * 1000,
  });

  const setMode = async (mode: FinancialMode) => {
    if (!ownerId) return false;
    const { error } = await supabase
      .from("profiles")
      .update({ financial_mode: mode, updated_at: new Date().toISOString() })
      .eq("user_id", ownerId);
    if (error) return false;
    queryClient.setQueryData(["financial-mode", ownerId], mode);
    queryClient.invalidateQueries({ queryKey: ["financial-mode", ownerId] });
    return true;
  };

  return {
    mode: data ?? "automatic",
    // Enquanto carrega, não sabemos a preferência: evita lançar automático por engano.
    ready: !isLoading && data !== undefined,
    setMode,
  };
}
