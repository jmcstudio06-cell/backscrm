import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface BudgetItem {
  id: string;
  budget_id: string;
  description: string;
  details: string | null;
  unit_price: number;
  quantity: number;
  total: number;
  sort_order: number;
}

export interface Budget {
  id: string;
  user_id: string;
  client_id: string | null;
  budget_number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_company: string | null;
  client_address: string | null;
  logo_url: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_conditions: string | null;
  notes: string | null;
  terms_conditions: string | null;
  status: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  items?: BudgetItem[];
}

export interface PerformanceType {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  created_at: string;
}

export function useBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [performanceTypes, setPerformanceTypes] = useState<PerformanceType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const allBudgets = data || [];

      // Auto-delete budgets beyond the 5 most recent
      if (allBudgets.length > 5) {
        const toDelete = allBudgets.slice(5);
        for (const b of toDelete) {
          await supabase.from("budget_items").delete().eq("budget_id", b.id);
          await supabase.from("budgets").delete().eq("id", b.id);
        }
      }

      setBudgets(allBudgets.slice(0, 5));
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceTypes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("performance_types")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setPerformanceTypes(data || []);
    } catch (error) {
      console.error("Error fetching performance types:", error);
    }
  };

  const addPerformanceType = async (typeData: Partial<PerformanceType>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("performance_types")
        .insert([{
          name: typeData.name || "",
          description: typeData.description,
          price: typeData.price || 0,
          icon: (typeData as any).icon || "music",
          musician_ids: (typeData as any).musician_ids || [],
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setPerformanceTypes([...performanceTypes, data]);
      toast.success("Tipo de performance adicionado!");
      return data;
    } catch (error) {
      console.error("Error adding performance type:", error);
      toast.error("Erro ao adicionar tipo de performance");
    }
  };

  const updatePerformanceType = async (id: string, updates: Partial<PerformanceType>) => {
    try {
      const updatePayload: any = { ...updates };
      const { data, error } = await supabase
        .from("performance_types")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setPerformanceTypes(performanceTypes.map(p => p.id === id ? data : p));
      toast.success("Tipo de performance atualizado!");
      return data;
    } catch (error) {
      console.error("Error updating performance type:", error);
      toast.error("Erro ao atualizar");
    }
  };

  const deletePerformanceType = async (id: string) => {
    try {
      const { error } = await supabase
        .from("performance_types")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setPerformanceTypes(performanceTypes.filter(p => p.id !== id));
      toast.success("Tipo de performance excluído!");
    } catch (error) {
      console.error("Error deleting performance type:", error);
      toast.error("Erro ao excluir");
    }
  };

  const generateBudgetNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `ORC-${year}${month}-${random}`;
  };

  const addBudget = async (budgetData: Partial<Budget>, items: Partial<BudgetItem>[]) => {
    if (!user) return;

    try {
      const budgetNumber = generateBudgetNumber();
      
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .insert([{
          budget_number: budgetNumber,
          client_name: budgetData.client_name || "",
          client_email: budgetData.client_email,
          client_phone: budgetData.client_phone,
          client_company: budgetData.client_company,
          client_address: budgetData.client_address,
          client_id: budgetData.client_id,
          logo_url: budgetData.logo_url,
          subtotal: budgetData.subtotal || 0,
          discount: budgetData.discount || 0,
          tax: budgetData.tax || 0,
          total: budgetData.total || 0,
          payment_conditions: budgetData.payment_conditions,
          notes: budgetData.notes,
          terms_conditions: budgetData.terms_conditions,
          status: budgetData.status || "draft",
          valid_until: budgetData.valid_until,
          user_id: user.id,
        }])
        .select()
        .single();

      if (budgetError) throw budgetError;

      // Add items
      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          budget_id: budget.id,
          description: item.description || "",
          details: item.details,
          unit_price: item.unit_price || 0,
          quantity: item.quantity || 1,
          total: (item.unit_price || 0) * (item.quantity || 1),
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from("budget_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      setBudgets([budget, ...budgets]);
      toast.success("Orçamento criado com sucesso!");
      return budget;
    } catch (error) {
      console.error("Error adding budget:", error);
      toast.error("Erro ao criar orçamento");
    }
  };

  const updateBudget = async (id: string, budgetData: Partial<Budget>, items?: Partial<BudgetItem>[]) => {
    try {
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .update({
          client_name: budgetData.client_name,
          client_email: budgetData.client_email,
          client_phone: budgetData.client_phone,
          client_company: budgetData.client_company,
          client_address: budgetData.client_address,
          client_id: budgetData.client_id,
          logo_url: budgetData.logo_url,
          subtotal: budgetData.subtotal,
          discount: budgetData.discount,
          tax: budgetData.tax,
          total: budgetData.total,
          payment_conditions: budgetData.payment_conditions,
          notes: budgetData.notes,
          terms_conditions: budgetData.terms_conditions,
          status: budgetData.status,
          valid_until: budgetData.valid_until,
        })
        .eq("id", id)
        .select()
        .single();

      if (budgetError) throw budgetError;

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase.from("budget_items").delete().eq("budget_id", id);

        // Insert new items
        if (items.length > 0) {
          const itemsToInsert = items.map((item, index) => ({
            budget_id: id,
            description: item.description || "",
            details: item.details,
            unit_price: item.unit_price || 0,
            quantity: item.quantity || 1,
            total: (item.unit_price || 0) * (item.quantity || 1),
            sort_order: index,
          }));

          const { error: itemsError } = await supabase
            .from("budget_items")
            .insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }
      }

      setBudgets(budgets.map(b => b.id === id ? budget : b));
      toast.success("Orçamento atualizado!");
      return budget;
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Erro ao atualizar orçamento");
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setBudgets(budgets.filter(b => b.id !== id));
      toast.success("Orçamento excluído!");
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Erro ao excluir orçamento");
    }
  };

  const getBudgetWithItems = async (id: string) => {
    try {
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .select("*")
        .eq("id", id)
        .single();

      if (budgetError) throw budgetError;

      const { data: items, error: itemsError } = await supabase
        .from("budget_items")
        .select("*")
        .eq("budget_id", id)
        .order("sort_order", { ascending: true });

      if (itemsError) throw itemsError;

      return { ...budget, items: items || [] };
    } catch (error) {
      console.error("Error fetching budget:", error);
      toast.error("Erro ao carregar orçamento");
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchBudgets();
      fetchPerformanceTypes();
    }
  }, [user]);

  return {
    budgets,
    performanceTypes,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetWithItems,
    addPerformanceType,
    updatePerformanceType,
    deletePerformanceType,
    refetch: fetchBudgets,
    refetchPerformanceTypes: fetchPerformanceTypes,
  };
}
