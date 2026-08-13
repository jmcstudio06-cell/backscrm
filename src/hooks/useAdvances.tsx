import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOwnerId } from "@/hooks/useWorkspace";
import { toast } from "sonner";

export interface Advance {
  id: string;
  user_id: string;
  title: string;
  category: string;
  due_type: string;
  due_date: string | null;
  priority: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdvances() {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const ownerId = useOwnerId();

  const fetchAdvances = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("advances")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdvances(data || []);
    } catch (error: any) {
      console.error("Error fetching advances:", error);
      toast.error("Erro ao carregar avanços");
    } finally {
      setLoading(false);
    }
  };

  const addAdvance = async (advanceData: { title: string; category: string; due_type: string; due_date: string | null; priority: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("advances")
        .insert([{ ...advanceData, user_id: ownerId ?? user.id }])
        .select()
        .single();

      if (error) throw error;

      setAdvances((prev) => [data, ...prev]);
      toast.success("Avanço criado com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error adding advance:", error);
      toast.error("Erro ao criar avanço");
    }
  };

  const updateAdvance = async (id: string, updates: Partial<Advance>) => {
    try {
      const { error } = await supabase
        .from("advances")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setAdvances((prev) =>
        prev.map((adv) => (adv.id === id ? { ...adv, ...updates } : adv))
      );
    } catch (error: any) {
      console.error("Error updating advance:", error);
      toast.error("Erro ao atualizar avanço");
    }
  };

  const completeAdvance = async (id: string) => {
    try {
      const { error } = await supabase
        .from("advances")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setAdvances((prev) =>
        prev.map((adv) =>
          adv.id === id
            ? { ...adv, completed: true, completed_at: new Date().toISOString() }
            : adv
        )
      );
      
      return true;
    } catch (error: any) {
      console.error("Error completing advance:", error);
      toast.error("Erro ao concluir avanço");
      return false;
    }
  };

  const deleteAdvance = async (id: string) => {
    try {
      const { error } = await supabase.from("advances").delete().eq("id", id);

      if (error) throw error;

      setAdvances((prev) => prev.filter((adv) => adv.id !== id));
      toast.success("Avanço removido");
    } catch (error: any) {
      console.error("Error deleting advance:", error);
      toast.error("Erro ao remover avanço");
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdvances();
    }
  }, [user]);

  return {
    advances,
    loading,
    addAdvance,
    updateAdvance,
    completeAdvance,
    deleteAdvance,
    refetch: fetchAdvances,
  };
}
