import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  show_id: string | null;
  created_at: string;
}

export function useTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: loading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      // Only fetch last 6 months instead of all history
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const cutoff = sixMonthsAgo.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", cutoff)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []) as Transaction[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const addTransaction = async (transactionData: Partial<Transaction>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([{
          type: transactionData.type || "expense",
          amount: transactionData.amount || 0,
          category: transactionData.category || "Outros",
          description: transactionData.description,
          date: transactionData.date,
          show_id: transactionData.show_id,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });
      toast.success("Transação adicionada com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Erro ao adicionar transação");
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast.success("Transação excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao excluir transação");
    }
  };

  const getTotalIncome = () => transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const getTotalExpense = () => transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });

  return { transactions, loading, addTransaction, deleteTransaction, getTotalIncome, getTotalExpense, refetch };
}
