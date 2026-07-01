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
      const pageSize = 1000;
      const allTransactions: Transaction[] = [];
      if (!fullHistory) {
        // Use START of month 6 months ago to ensure we always get full months,
        // never missing days due to "exact day -6 months" arithmetic.
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        const yyyy = sixMonthsAgo.getFullYear();
        const mm = String(sixMonthsAgo.getMonth() + 1).padStart(2, "0");
        const cutoff = `${yyyy}-${mm}-01`;

        let from = 0;
        while (true) {
          const { data, error } = await supabase
            .from("transactions")
            .select("*")
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

      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
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
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 min — alterações manuais/realtime invalidam o cache
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const addTransaction = async (transactionData: Partial<Transaction>) => {
    if (!user) return;

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
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação adicionada com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Erro ao adicionar transação");
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao excluir transação");
    }
  };

  // Realtime: invalida cache instantaneamente em qualquer INSERT/UPDATE/DELETE
  // (ex.: exclusão de transações criadas automaticamente por shows da Agenda).
  useEffect(() => {
    if (!user) return;
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
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const getTotalIncome = () => transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const getTotalExpense = () => transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["transactions"] });

  return { transactions, loading, addTransaction, deleteTransaction, getTotalIncome, getTotalExpense, refetch };
}
