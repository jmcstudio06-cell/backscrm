import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Erro ao carregar metas");
    } finally {
      setLoading(false);
    }
  };

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
        .select()
        .single();

      if (error) throw error;
      setGoals([data, ...goals]);
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
        .from("goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setGoals(goals.map(g => g.id === id ? data : g));
      toast.success("Meta atualizada com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Erro ao atualizar meta");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setGoals(goals.filter(g => g.id !== id));
      toast.success("Meta excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Erro ao excluir meta");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return { goals, loading, addGoal, updateGoal, deleteGoal, refetch: fetchGoals };
}
