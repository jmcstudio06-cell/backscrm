import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Goal {
  id: string;
  title: string;
  type: string;
  target_value: number;
  current_value: number | null;
  month: number;
  year: number;
  created_at: string;
}

export function useGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading: loading } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Goal[];
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const addGoal = async (goalData: Partial<Goal>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("goals")
        .insert([{
          title: goalData.title || "",
          type: goalData.type || "financial",
          target_value: goalData.target_value || 0,
          current_value: goalData.current_value || 0,
          month: goalData.month || new Date().getMonth() + 1,
          year: goalData.year || new Date().getFullYear(),
          user_id: user.id,
        }])
        .select().single();

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["goals", user.id] });
      toast.success("Meta adicionada com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding goal:", error);
      toast.error("Erro ao adicionar meta");
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const { data, error } = await supabase
        .from("goals").update(updates).eq("id", id).select().single();
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
      toast.success("Meta atualizada com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Erro ao atualizar meta");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
      toast.success("Meta excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Erro ao excluir meta");
    }
  };

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });

  return { goals, loading, addGoal, updateGoal, deleteGoal, refetch };
}
