import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  category: string;
  type: string;
  featured: boolean;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export function useTutorials() {
  const { user } = useAuth();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from("tutorials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTutorials(data || []);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      toast.error("Erro ao carregar tutoriais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTutorials();
    } else {
      setTutorials([]);
      setLoading(false);
    }
  }, [user]);

  const addTutorial = async (tutorial: Omit<Tutorial, "id" | "created_at" | "updated_at">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("tutorials")
        .insert({
          ...tutorial,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setTutorials((prev) => [data, ...prev]);
      toast.success("Tutorial adicionado!");
      return data;
    } catch (error) {
      console.error("Error adding tutorial:", error);
      toast.error("Erro ao adicionar tutorial");
    }
  };

  const updateTutorial = async (id: string, updates: Partial<Tutorial>) => {
    try {
      const { data, error } = await supabase
        .from("tutorials")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setTutorials((prev) => prev.map((t) => (t.id === id ? data : t)));
      toast.success("Tutorial atualizado!");
      return data;
    } catch (error) {
      console.error("Error updating tutorial:", error);
      toast.error("Erro ao atualizar tutorial");
    }
  };

  const deleteTutorial = async (id: string) => {
    try {
      const { error } = await supabase.from("tutorials").delete().eq("id", id);

      if (error) throw error;
      setTutorials((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tutorial removido!");
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      toast.error("Erro ao remover tutorial");
    }
  };

  return {
    tutorials,
    loading,
    addTutorial,
    updateTutorial,
    deleteTutorial,
    refetch: fetchTutorials,
  };
}
