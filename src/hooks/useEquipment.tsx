import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOwnerId } from "@/hooks/useWorkspace";
import { toast } from "sonner";

export interface Equipment {
  id: string;
  user_id: string;
  name: string;
  category: string;
  purchase_value: number;
  purchase_date: string | null;
  lifespan_shows: number;
  lifespan_months: number;
  depreciation_method: "shows" | "months";
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useEquipment() {
  const { user } = useAuth();
  const ownerId = useOwnerId();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipment = async () => {
    if (!user) {
      setEquipment([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("artist_equipment")
        .select("*")
        .eq("user_id", user.id)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setEquipment((data as Equipment[]) || []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast.error("Erro ao carregar equipamentos");
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = async (
    equipmentData: Omit<Equipment, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("artist_equipment")
        .insert({
          ...equipmentData,
          user_id: ownerId ?? user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setEquipment((prev) => [...prev, data as Equipment]);
      toast.success("Equipamento adicionado!");
      return data as Equipment;
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast.error("Erro ao adicionar equipamento");
      return null;
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("artist_equipment")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEquipment((prev) =>
        prev.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq))
      );
      toast.success("Equipamento atualizado!");
      return true;
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast.error("Erro ao atualizar equipamento");
      return false;
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("artist_equipment")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEquipment((prev) => prev.filter((eq) => eq.id !== id));
      toast.success("Equipamento removido!");
      return true;
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Erro ao remover equipamento");
      return false;
    }
  };

  // Calcula o custo de depreciação por show
  const calculateDepreciationPerShow = (eq: Equipment): number => {
    if (eq.depreciation_method === "shows") {
      return eq.purchase_value / eq.lifespan_shows;
    } else {
      // Converte meses para shows estimados (assumindo 4 shows por mês em média)
      const estimatedShows = eq.lifespan_months * 4;
      return eq.purchase_value / estimatedShows;
    }
  };

  // Calcula o custo total de depreciação de todos os equipamentos ativos
  const getTotalDepreciationPerShow = (): number => {
    return equipment
      .filter((eq) => eq.is_active)
      .reduce((total, eq) => total + calculateDepreciationPerShow(eq), 0);
  };

  // Agrupa equipamentos por categoria
  const getEquipmentByCategory = () => {
    const grouped: Record<string, Equipment[]> = {};
    equipment.forEach((eq) => {
      if (!grouped[eq.category]) {
        grouped[eq.category] = [];
      }
      grouped[eq.category].push(eq);
    });
    return grouped;
  };

  useEffect(() => {
    fetchEquipment();
  }, [user]);

  return {
    equipment,
    loading,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    calculateDepreciationPerShow,
    getTotalDepreciationPerShow,
    getEquipmentByCategory,
    refetch: fetchEquipment,
  };
}
