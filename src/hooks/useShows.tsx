import { useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isCompletedShowStatus, isFinancialShowStatus, normalizeShowStatus } from "@/lib/showStatus";

export interface Show {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  cachet: number;
  advance_amount: number;
  status: string;
  client_id: string | null;
  lead_id: string | null;
  event_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ShowMusician {
  musicianId: string;
  name: string;
  fee: number;
}

interface ShowExpense {
  id: string;
  description: string;
  category: string;
  value: number;
}

interface ShowTransactionInput {
  user_id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  show_id: string;
  is_advance_payment?: boolean;
}

interface ExistingShowTransaction {
  show_id: string | null;
  type: string;
  category: string;
  amount: number;
  description: string | null;
  is_advance_payment: boolean;
}

const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const chunkArray = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const buildShowTransactions = (
  userId: string,
  show: Show,
  musicians: ShowMusician[],
  expenses: ShowExpense[],
  advanceAmountOverride?: number,
) => {
  const transactionsToInsert: ShowTransactionInput[] = [];
  const advance = advanceAmountOverride ?? show.advance_amount ?? 0;
  const hasAdvance = advance > 0 && advance < show.cachet;

  if (show.cachet > 0) {
    if (hasAdvance) {
      transactionsToInsert.push({
        user_id: userId,
        type: "income",
        category: "Show",
        amount: advance,
        description: `Cachê antecipado: ${show.title}`,
        date: show.date,
        show_id: show.id,
        is_advance_payment: true,
      });
      transactionsToInsert.push({
        user_id: userId,
        type: "income",
        category: "Show",
        amount: show.cachet - advance,
        description: `Cachê pendente: ${show.title}`,
        date: show.date,
        show_id: show.id,
        is_advance_payment: false,
      });
    } else {
      transactionsToInsert.push({
        user_id: userId,
        type: "income",
        category: "Show",
        amount: show.cachet,
        description: `Cachê: ${show.title}`,
        date: show.date,
        show_id: show.id,
        is_advance_payment: advance >= show.cachet,
      });
    }
  }

  for (const musician of musicians) {
    if (musician.fee > 0) {
      transactionsToInsert.push({
        user_id: userId,
        type: "expense",
        category: "Músicos",
        amount: musician.fee,
        description: `${musician.name} - ${show.title}`,
        date: show.date,
        show_id: show.id,
        is_advance_payment: false,
      });
    }
  }

  for (const expense of expenses) {
    if (expense.value > 0) {
      transactionsToInsert.push({
        user_id: userId,
        type: "expense",
        category: expense.category,
        amount: expense.value,
        description: `${expense.description} - ${show.title}`,
        date: show.date,
        show_id: show.id,
        is_advance_payment: false,
      });
    }
  }

  return transactionsToInsert;
};

const buildTransactionSignature = (transaction: {
  type: string;
  category: string;
  amount: number;
  description?: string | null;
  is_advance_payment?: boolean;
}) => {
  return [
    transaction.type,
    transaction.category,
    Number(transaction.amount).toFixed(2),
    transaction.description ?? "",
    transaction.is_advance_payment ? "1" : "0",
  ].join("|");
};

const hasMatchingTransactions = (expected: ShowTransactionInput[], existing: ExistingShowTransaction[]) => {
  if (expected.length !== existing.length) return false;

  const expectedSignatures = expected.map((transaction) => buildTransactionSignature(transaction)).sort();
  const existingSignatures = existing.map((transaction) => buildTransactionSignature(transaction)).sort();

  return expectedSignatures.every((signature, index) => signature === existingSignatures[index]);
};

const normalizeShowRow = (row: any): Show | null => {
  if (!row || typeof row !== "object") return null;

  const date = typeof row.date === "string" ? row.date.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const cachetValue =
    typeof row.cachet === "number" ? row.cachet : typeof row.cachet === "string" ? Number(row.cachet) : 0;

  return {
    id: typeof row.id === "string" && row.id.trim() ? row.id : `fallback-${Date.now()}-${Math.random()}`,
    title: typeof row.title === "string" && row.title.trim() ? row.title : "Show sem título",
    date,
    start_time: typeof row.start_time === "string" ? row.start_time : null,
    end_time: typeof row.end_time === "string" ? row.end_time : null,
    venue: typeof row.venue === "string" ? row.venue : null,
    address: typeof row.address === "string" ? row.address : null,
    cachet: Number.isFinite(cachetValue) ? cachetValue : 0,
    advance_amount: typeof row.advance_amount === "number" ? row.advance_amount : 0,
    status: normalizeShowStatus(typeof row.status === "string" && row.status.trim() ? row.status : "scheduled"),
    client_id: typeof row.client_id === "string" ? row.client_id : null,
    lead_id: typeof row.lead_id === "string" ? row.lead_id : null,
    event_type: typeof row.event_type === "string" ? row.event_type : null,
    notes: typeof row.notes === "string" ? row.notes : null,
    created_at: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    updated_at: typeof row.updated_at === "string" ? row.updated_at : new Date().toISOString(),
  };
};

export function useShowsData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const autoCompleteRanRef = useRef(false);
  const repairRanRef = useRef(false);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["shows"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  // Auto-complete past confirmed shows (once per session)
  const autoCompletePastShows = async () => {
    if (autoCompleteRanRef.current || !user) return;
    autoCompleteRanRef.current = true;

    const today = formatDateString(new Date());

    const mode = localStorage.getItem(`financial_mode_${user.id}`) || "automatic";
    if (mode === "manual") return;

    const { data: showsToComplete } = await supabase
      .from("shows")
      .select("*")
      .lt("date", today)
      .eq("status", "confirmed");

    if (!showsToComplete || showsToComplete.length === 0) return;

    await supabase
      .from("shows")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .lt("date", today)
      .eq("status", "confirmed");

    const showIds = showsToComplete.map((s) => s.id);

    const [musiciansResult, expensesResult] = await Promise.all([
      supabase.from("show_musicians").select("show_id, musician_id, fee, musicians(name)").in("show_id", showIds),
      supabase.from("show_expenses").select("*").in("show_id", showIds),
    ]);

    const musiciansByShow: Record<string, ShowMusician[]> = {};
    const expensesByShow: Record<string, ShowExpense[]> = {};

    (musiciansResult.data || []).forEach((m: any) => {
      if (!musiciansByShow[m.show_id]) musiciansByShow[m.show_id] = [];
      musiciansByShow[m.show_id].push({
        musicianId: m.musician_id,
        name: m.musicians?.name || "Músico",
        fee: m.fee,
      });
    });

    (expensesResult.data || []).forEach((e: any) => {
      if (!expensesByShow[e.show_id]) expensesByShow[e.show_id] = [];
      expensesByShow[e.show_id].push({
        id: e.id,
        description: e.description || "",
        category: e.category,
        value: e.amount,
      });
    });

    for (const show of showsToComplete) {
      const completedShow = { ...show, status: "completed" } as Show;
      await createShowTransactions(completedShow, musiciansByShow[show.id] || [], expensesByShow[show.id] || []);
    }
  };

  // React Query for shows - shared cache across all components
  const { data: shows = [], isLoading: loading } = useQuery({
    queryKey: ["shows", user?.id],
    queryFn: async () => {
      await autoCompletePastShows();

      const pageSize = 1000;
      const allShows: Show[] = [];
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from("shows")
          .select("*")
          .order("date", { ascending: true })
          .range(from, from + pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allShows.push(...(data as Show[]));

        if (data.length < pageSize) break;
        from += pageSize;
      }

      return allShows.map(normalizeShowRow).filter((s): s is Show => s !== null);
    },
    enabled: !!user,
    staleTime: 30_000, // 30s - keeps data fresh across pages
    refetchOnMount: "always",
  });

  // Create financial transactions when show is marked as completed
  const createShowTransactions = async (
    show: Show,
    musicians: ShowMusician[],
    expenses: ShowExpense[],
    advanceAmountOverride?: number,
  ) => {
    if (!user) return;

    try {
      await supabase.from("transactions").delete().eq("show_id", show.id);

      const transactionsToInsert = buildShowTransactions(user.id, show, musicians, expenses, advanceAmountOverride);

      if (transactionsToInsert.length > 0) {
        const { error } = await supabase.from("transactions").insert(transactionsToInsert);

        if (error) throw error;
        console.log("Transactions created for show:", show.title);
      }
    } catch (error) {
      console.error("Error creating transactions:", error);
      toast.error("Erro ao criar transações financeiras");
    }
  };

  const saveShowMusicians = async (showId: string, musicians: ShowMusician[]) => {
    try {
      await supabase.from("show_musicians").delete().eq("show_id", showId);

      if (musicians.length === 0) return;

      const musiciansToInsert = musicians.map((m) => ({
        show_id: showId,
        musician_id: m.musicianId,
        fee: m.fee,
        confirmed: true,
      }));

      const { error } = await supabase.from("show_musicians").insert(musiciansToInsert);
      if (error) throw error;
    } catch (error) {
      console.error("Error saving show musicians:", error);
    }
  };

  const saveShowExpenses = async (showId: string, expenses: ShowExpense[]) => {
    try {
      await supabase.from("show_expenses").delete().eq("show_id", showId);

      if (expenses.length === 0) return;

      const expensesToInsert = expenses.map((e) => ({
        show_id: showId,
        category: e.category,
        amount: e.value,
        description: e.description,
      }));

      const { error } = await supabase.from("show_expenses").insert(expensesToInsert);
      if (error) throw error;
    } catch (error) {
      console.error("Error saving show expenses:", error);
    }
  };

  const applyChecklistTemplateToShow = async (showId: string, templateId: string) => {
    try {
      // Checklist é apenas local — não persistimos itens no banco.
      // Mantemos somente a referência ao template no próprio show (checklist_template_id).
      return;
    } catch (error) {
      console.error("Error applying checklist template:", error);
    }
  };

  const addShow = async (
    showData: Partial<Show>,
    musicians: ShowMusician[] = [],
    expenses: ShowExpense[] = [],
    checklistTemplateId?: string,
    userPlan?: string | null,
    advanceAmount = 0,
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("shows")
        .insert([
          {
            title: showData.title || "",
            date: showData.date || formatDateString(new Date()),
            start_time: showData.start_time || null,
            end_time: showData.end_time || null,
            venue: showData.venue,
            address: showData.address,
            cachet: showData.cachet || 0,
            advance_amount: showData.advance_amount || advanceAmount || 0,
            status: showData.status || "scheduled",
            client_id: showData.client_id,
            lead_id: showData.lead_id,
            event_type: showData.event_type,
            notes: showData.notes,
            user_id: user.id,
            checklist_template_id: checklistTemplateId || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await saveShowMusicians(data.id, musicians);
      await saveShowExpenses(data.id, expenses);

      if (checklistTemplateId) {
        await applyChecklistTemplateToShow(data.id, checklistTemplateId);
      }

      if (isFinancialShowStatus(data.status)) {
        await createShowTransactions(data, musicians, expenses, advanceAmount);
      }

      invalidateAll();
      toast.success("Show adicionado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding show:", error);
      toast.error("Erro ao adicionar show");
    }
  };

  const updateShow = async (
    id: string,
    updates: Partial<Show>,
    musicians?: ShowMusician[],
    expenses?: ShowExpense[],
  ) => {
    if (!user) return;

    try {
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.start_time === "") sanitizedUpdates.start_time = null;
      if (sanitizedUpdates.end_time === "") sanitizedUpdates.end_time = null;

      const { data, error } = await supabase.from("shows").update(sanitizedUpdates).eq("id", id).select().single();

      if (error) throw error;

      if (musicians !== undefined) {
        await saveShowMusicians(id, musicians);
      }
      if (expenses !== undefined) {
        await saveShowExpenses(id, expenses);
      }

      let musiciansToUse = musicians;
      let expensesToUse = expenses;

      if (musicians === undefined) {
        const { data: savedMusicians } = await supabase
          .from("show_musicians")
          .select("musician_id, fee, musicians(name)")
          .eq("show_id", id);

        if (savedMusicians) {
          musiciansToUse = savedMusicians.map((m: any) => ({
            musicianId: m.musician_id,
            name: m.musicians?.name || "Músico",
            fee: m.fee,
          }));
        }
      }

      if (expenses === undefined) {
        const { data: savedExpenses } = await supabase.from("show_expenses").select("*").eq("show_id", id);

        if (savedExpenses) {
          expensesToUse = savedExpenses.map((e: any) => ({
            id: e.id,
            description: e.description || "",
            category: e.category,
            value: e.amount,
          }));
        }
      }

      await updateShowTransactions(data, musiciansToUse, expensesToUse);

      invalidateAll();
      toast.success("Show atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating show:", error);
      toast.error("Erro ao atualizar show");
    }
  };

  const deleteShowTransactions = async (showId: string) => {
    try {
      const { error } = await supabase.from("transactions").delete().eq("show_id", showId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting show transactions:", error);
    }
  };

  const updateShowTransactions = async (show: Show, musicians: ShowMusician[], expenses: ShowExpense[]) => {
    if (!user) return;

    await deleteShowTransactions(show.id);

    if (isFinancialShowStatus(show.status)) {
      await createShowTransactions(show, musicians, expenses);
    }
  };

  const deleteShow = async (id: string) => {
    try {
      await deleteShowTransactions(id);
      await supabase.from("show_musicians").delete().eq("show_id", id);
      await supabase.from("show_expenses").delete().eq("show_id", id);

      const { error } = await supabase.from("shows").delete().eq("id", id);

      if (error) throw error;

      // Limpa marcações locais do checklist deste show (se houver)
      try {
        localStorage.removeItem(`checklist_local_${id}`);
      } catch {
        /* noop */
      }

      invalidateAll();
      toast.success("Show e transações excluídos com sucesso!");
    } catch (error) {
      console.error("Error deleting show:", error);
      toast.error("Erro ao excluir show");
    }
  };

  const cancelShow = async (id: string) => {
    await updateShow(id, { status: "cancelled" });
  };

  const getConfirmedShows = () => shows.filter((s) => s.status === "confirmed");
  const getCompletedShows = () => shows.filter((s) => isCompletedShowStatus(s.status));

  // Background repair: create missing transactions for completed shows (non-blocking)
  useEffect(() => {
    if (repairRanRef.current || !user || loading || shows.length === 0) return;
    repairRanRef.current = true;

    (async () => {
      try {
        const completedShows = shows.filter((show) => isFinancialShowStatus(show.status));
        const nonFinancialShows = shows.filter((show) => !isFinancialShowStatus(show.status));

        // Cleanup orphaned transactions from shows that are no longer "financial" (e.g. pending/confirmed)
        if (nonFinancialShows.length > 0) {
          const nonFinancialShowIds = nonFinancialShows.map((s) => s.id);
          for (const batch of chunkArray(nonFinancialShowIds, 100)) {
            await supabase.from("transactions").delete().in("show_id", batch);
          }
        }

        if (completedShows.length === 0) return;

        const showIds = completedShows.map((s) => s.id);
        const batches = chunkArray(showIds, 50);
        const existingTransactionsByShow: Record<string, ExistingShowTransaction[]> = {};
        const musiciansByShow: Record<string, ShowMusician[]> = {};
        const expensesByShow: Record<string, ShowExpense[]> = {};

        for (const batch of batches) {
          const [existingTransactionsResult, musiciansResult, expensesResult] = await Promise.all([
            supabase
              .from("transactions")
              .select("show_id, type, category, amount, description, is_advance_payment")
              .in("show_id", batch),
            supabase.from("show_musicians").select("show_id, musician_id, fee, musicians(name)").in("show_id", batch),
            supabase.from("show_expenses").select("*").in("show_id", batch),
          ]);

          (existingTransactionsResult.data || []).forEach((transaction) => {
            if (!transaction.show_id) return;
            if (!existingTransactionsByShow[transaction.show_id]) {
              existingTransactionsByShow[transaction.show_id] = [];
            }

            existingTransactionsByShow[transaction.show_id].push(transaction as ExistingShowTransaction);
          });

          (musiciansResult.data || []).forEach((musician: any) => {
            if (!musiciansByShow[musician.show_id]) {
              musiciansByShow[musician.show_id] = [];
            }

            musiciansByShow[musician.show_id].push({
              musicianId: musician.musician_id,
              name: musician.musicians?.name || "Músico",
              fee: musician.fee,
            });
          });

          (expensesResult.data || []).forEach((expense: any) => {
            if (!expensesByShow[expense.show_id]) {
              expensesByShow[expense.show_id] = [];
            }

            expensesByShow[expense.show_id].push({
              id: expense.id,
              description: expense.description || "",
              category: expense.category,
              value: expense.amount,
            });
          });
        }

        const showsToRepair = completedShows.filter((show) => {
          const expectedTransactions = buildShowTransactions(
            user.id,
            show,
            musiciansByShow[show.id] || [],
            expensesByShow[show.id] || [],
          );
          const existingTransactions = existingTransactionsByShow[show.id] || [];

          return !hasMatchingTransactions(expectedTransactions, existingTransactions);
        });

        if (showsToRepair.length === 0) return;

        console.log(`Repairing ${showsToRepair.length} completed shows with inconsistent financial transactions`);

        for (const batch of chunkArray(
          showsToRepair.map((show) => show.id),
          50,
        )) {
          const { error } = await supabase.from("transactions").delete().in("show_id", batch);

          if (error) {
            console.error("Repair delete error:", error);
            return;
          }
        }

        const rebuiltTransactions = showsToRepair.flatMap((show) =>
          buildShowTransactions(user.id, show, musiciansByShow[show.id] || [], expensesByShow[show.id] || []),
        );

        for (const batch of chunkArray(rebuiltTransactions, 200)) {
          if (batch.length === 0) continue;

          const { error } = await supabase.from("transactions").insert(batch);
          if (error) {
            console.error("Repair insert error:", error);
            return;
          }
        }

        console.log(`Repaired financial transactions for ${showsToRepair.length} completed shows successfully`);
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      } catch (error) {
        console.error("Error repairing missing transactions:", error);
      }
    })();
  }, [user, loading, shows]);

  return {
    shows,
    loading,
    addShow,
    updateShow,
    deleteShow,
    cancelShow,
    getConfirmedShows,
    getCompletedShows,
    refetch: () => invalidateAll(),
  };
}
