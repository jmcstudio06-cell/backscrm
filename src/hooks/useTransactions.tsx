import { useEffect } from "react";
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
  is_advance_payment: boolean;
  created_at: string;
}

interface UseTransactionsOptions {
  fullHistory?: boolean;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { fullHistory = false } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: loading } = useQuery({
    queryKey: ["transactions", user?.id, fullHistory ? "all" : "recent"],

    queryFn: async () => {
      if (!user?.id) return [];

      const pageSize = 1000;
      const allTransactions: Transaction[] = [];

      // =============================
      // ÚLTIMOS 6 MESES
      // =============================
      if (!fullHistory) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const cutoff = sixMonthsAgo.toISOString().split("T")[0];

        let from = 0;

        while (true) {
          const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .gte("date", cutoff)
            .order("date", { ascending: false })
            .order("created_at", { ascending: false })
            .range(from, from + pageSize - 1);

          if (error) throw error;
          if (!data || data.length === 0) break;

          allTransactions.push(...(data as Transaction[]));

          if (data.length < pageSize) break;

          from += pageSize;
        }

        return allTransactions;
      }

      // =============================
      // HISTÓRICO COMPLETO
      // =============================
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allTransactions.push(...(data as Transaction[]));

        if (data.length < pageSize) break;

        from += pageSize;
      }

      return allTransactions;
    },

    enabled: !!user?.id,
    staleTime: 30000,
    refetchOnMount: "always",
  });

  // =============================
  // ADICIONAR TRANSAÇÃO
  // =============================
  const addTransaction = async (transactionData: Partial<Transaction>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            type: transactionData.type || "expense",
            amount: transactionData.amount || 0,
            category: transactionData.category || "Outros",
            description: transactionData.description,
            date: transactionData.date,
            show_id: transactionData.show_id,
            is_advance_payment: transactionData.is_advance_payment || false,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      toast.success("Transação adicionada com sucesso!");

      return data;
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Erro ao adicionar transação");
    }
  };

  // =============================
  // EXCLUIR TRANSAÇÃO
  // =============================
  const deleteTransaction = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      toast.success("Transação excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao excluir transação");
    }
  };

  // =============================
  // REALTIME
  // =============================
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`transactions:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["transactions"],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // =============================
  // TOTAIS
  // =============================
  const getTotalIncome = () => transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

  const getTotalExpense = () => transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const refetch = () =>
    queryClient.invalidateQueries({
      queryKey: ["transactions"],
    });

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpense,
    refetch,
  };
}
