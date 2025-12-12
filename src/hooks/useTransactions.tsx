import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

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
      setTransactions([data, ...transactions]);
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
      setTransactions(transactions.filter(t => t.id !== id));
      toast.success("Transação excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao excluir transação");
    }
  };

  const getTotalIncome = () => transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const getTotalExpense = () => transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return { transactions, loading, addTransaction, deleteTransaction, getTotalIncome, getTotalExpense, refetch: fetchTransactions };
}
