import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOwnerId } from "@/hooks/useWorkspace";
import { toast } from "sonner";

export interface AnnualGoal {
  id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  year: number;
  category: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useAnnualGoals() {
  const { user } = useAuth();
  const ownerId = useOwnerId();
  const [goals, setGoals] = useState<AnnualGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("annual_goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching annual goals:", error);
      toast.error("Erro ao carregar metas anuais");
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goalData: Partial<AnnualGoal>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("annual_goals")
        .insert([{
          title: goalData.title || "",
          description: goalData.description || null,
          target_value: goalData.target_value || 1,
          current_value: goalData.current_value || 0,
          year: goalData.year || new Date().getFullYear(),
          category: goalData.category || "marketing",
          user_id: ownerId ?? user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setGoals([data, ...goals]);
      toast.success("Meta anual adicionada!");
      return data;
    } catch (error) {
      console.error("Error adding annual goal:", error);
      toast.error("Erro ao adicionar meta anual");
    }
  };

  const updateGoal = async (id: string, updates: Partial<AnnualGoal>) => {
    try {
      const { data, error } = await supabase
        .from("annual_goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setGoals(goals.map(g => g.id === id ? data : g));
      toast.success("Meta anual atualizada!");
      return data;
    } catch (error) {
      console.error("Error updating annual goal:", error);
      toast.error("Erro ao atualizar meta anual");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("annual_goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setGoals(goals.filter(g => g.id !== id));
      toast.success("Meta anual excluída!");
    } catch (error) {
      console.error("Error deleting annual goal:", error);
      toast.error("Erro ao excluir meta anual");
    }
  };

  const incrementGoal = async (id: string, delta: number = 1) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newValue = Math.max(0, Math.min(goal.current_value + delta, goal.target_value));
    const completed = newValue >= goal.target_value;

    await updateGoal(id, { current_value: newValue, completed });
  };

  const toggleComplete = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    await updateGoal(id, { completed: !goal.completed });
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return { goals, loading, addGoal, updateGoal, deleteGoal, incrementGoal, toggleComplete, refetch: fetchGoals };
}
