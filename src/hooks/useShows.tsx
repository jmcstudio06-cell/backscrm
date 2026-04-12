import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Show {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  cachet: number;
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

export function useShowsData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoCompleteRan, setAutoCompleteRan] = useState(false);

  const invalidateTransactions = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeShowRow = (row: any): Show | null => {
    if (!row || typeof row !== "object") return null;

    const date = typeof row.date === "string" ? row.date.trim() : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const cachetValue =
      typeof row.cachet === "number"
        ? row.cachet
        : typeof row.cachet === "string"
          ? Number(row.cachet)
          : 0;

    return {
      id: typeof row.id === "string" && row.id.trim() ? row.id : `fallback-${Date.now()}-${Math.random()}`,
      title: typeof row.title === "string" && row.title.trim() ? row.title : "Show sem título",
      date,
      start_time: typeof row.start_time === "string" ? row.start_time : null,
      end_time: typeof row.end_time === "string" ? row.end_time : null,
      venue: typeof row.venue === "string" ? row.venue : null,
      address: typeof row.address === "string" ? row.address : null,
      cachet: Number.isFinite(cachetValue) ? cachetValue : 0,
      status: typeof row.status === "string" && row.status.trim() ? row.status : "scheduled",
      client_id: typeof row.client_id === "string" ? row.client_id : null,
      lead_id: typeof row.lead_id === "string" ? row.lead_id : null,
      event_type: typeof row.event_type === "string" ? row.event_type : null,
      notes: typeof row.notes === "string" ? row.notes : null,
      created_at: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
      updated_at: typeof row.updated_at === "string" ? row.updated_at : new Date().toISOString(),
    };
  };

  const fetchShows = async () => {
    if (!user) return;
    
    try {
      // First, find past shows that need auto-completion (only once per session)
      if (!autoCompleteRan) {
        setAutoCompleteRan(true);
        const today = formatDateString(new Date());
        
        const { data: showsToComplete } = await supabase
          .from("shows")
          .select("*")
          .lt("date", today)
          .eq("status", "confirmed");

        if (showsToComplete && showsToComplete.length > 0) {
          // Auto-complete them
          await supabase
            .from("shows")
            .update({ status: "completed", updated_at: new Date().toISOString() })
            .lt("date", today)
            .eq("status", "confirmed");

        // Batch fetch all musicians and expenses for all shows at once (instead of N+1)
        const showIds = showsToComplete.map(s => s.id);

        const [musiciansResult, expensesResult] = await Promise.all([
          supabase
            .from("show_musicians")
            .select("show_id, musician_id, fee, musicians(name)")
            .in("show_id", showIds),
          supabase
            .from("show_expenses")
            .select("*")
            .in("show_id", showIds),
        ]);

        // Group by show_id
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

        // Create transactions for each show using pre-fetched data
        for (const show of showsToComplete) {
          const completedShow = { ...show, status: "completed" } as Show;
          await createShowTransactions(
            completedShow,
            musiciansByShow[show.id] || [],
            expensesByShow[show.id] || []
          );
        }
        }
      }

      // Then fetch all shows
      const { data, error } = await supabase
        .from("shows")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      const normalizedShows = (data || [])
        .map(normalizeShowRow)
        .filter((s): s is Show => s !== null);

      setShows(normalizedShows);
    } catch (error) {
      console.error("Error fetching shows:", error);
      toast.error("Erro ao carregar shows");
    } finally {
      setLoading(false);
    }
  };

  // Create financial transactions when show is marked as completed
  const createShowTransactions = async (show: Show, musicians: ShowMusician[], expenses: ShowExpense[], isAdvancePayment = false) => {
    if (!user) return;

    try {
      // Idempotência: garante que não haverá duplicação para o mesmo show
      await supabase.from("transactions").delete().eq("show_id", show.id);

      const transactionsToInsert = [];

      // Add income from cachet
      if (show.cachet > 0) {
        transactionsToInsert.push({
          user_id: user.id,
          type: "income",
          category: "Show",
          amount: show.cachet,
          description: `Cachê: ${show.title}`,
          date: show.date,
          show_id: show.id,
          is_advance_payment: isAdvancePayment,
        });
      }

      // Add expenses from musicians
      for (const musician of musicians) {
        if (musician.fee > 0) {
          transactionsToInsert.push({
            user_id: user.id,
            type: "expense",
            category: "Músicos",
            amount: musician.fee,
            description: `${musician.name} - ${show.title}`,
            date: show.date,
            show_id: show.id,
          });
        }
      }

      // Add other expenses
      for (const expense of expenses) {
        if (expense.value > 0) {
          transactionsToInsert.push({
            user_id: user.id,
            type: "expense",
            category: expense.category,
            amount: expense.value,
            description: `${expense.description} - ${show.title}`,
            date: show.date,
            show_id: show.id,
          });
        }
      }

      if (transactionsToInsert.length > 0) {
        const { error } = await supabase
          .from("transactions")
          .insert(transactionsToInsert);

        if (error) throw error;
        console.log("Transactions created for show:", show.title);
        invalidateTransactions();
      }
    } catch (error) {
      console.error("Error creating transactions:", error);
      toast.error("Erro ao criar transações financeiras");
    }
  };

  // Save musicians to show
  const saveShowMusicians = async (showId: string, musicians: ShowMusician[]) => {
    if (musicians.length === 0) return;

    try {
      // Delete existing musicians for this show
      await supabase.from("show_musicians").delete().eq("show_id", showId);

      // Insert new musicians
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

  // Save expenses to show
  const saveShowExpenses = async (showId: string, expenses: ShowExpense[]) => {
    if (expenses.length === 0) return;

    try {
      // Delete existing expenses for this show
      await supabase.from("show_expenses").delete().eq("show_id", showId);

      // Insert new expenses
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

  // Apply checklist template to a show
  const applyChecklistTemplateToShow = async (showId: string, templateId: string) => {
    try {
      // Fetch the template
      const { data: template, error: templateError } = await supabase
        .from("checklist_templates")
        .select("tasks")
        .eq("id", templateId)
        .single();

      if (templateError || !template) {
        console.error("Error fetching template:", templateError);
        return;
      }

      const tasks = Array.isArray(template.tasks) ? template.tasks : [];
      if (tasks.length === 0) return;

      // Create checklist items for the show
      const checklistItems = tasks.map((task: string) => ({
        show_id: showId,
        item: task,
        completed: false,
      }));

      const { error } = await supabase
        .from("show_checklist")
        .insert(checklistItems);

      if (error) throw error;
      console.log(`Applied ${tasks.length} checklist items to show ${showId}`);
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
    isAdvancePayment = false
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("shows")
        .insert([{
          title: showData.title || "",
          date: showData.date || formatDateString(new Date()),
          start_time: showData.start_time || null,
          end_time: showData.end_time || null,
          venue: showData.venue,
          address: showData.address,
          cachet: showData.cachet || 0,
          status: showData.status || "scheduled",
          client_id: showData.client_id,
          lead_id: showData.lead_id,
          event_type: showData.event_type,
          notes: showData.notes,
          user_id: user.id,
          checklist_template_id: checklistTemplateId || null,
        }])
        .select()
        .single();

      if (error) throw error;

      // Save musicians and expenses
      await saveShowMusicians(data.id, musicians);
      await saveShowExpenses(data.id, expenses);

      // Apply checklist template if provided
      if (checklistTemplateId) {
        await applyChecklistTemplateToShow(data.id, checklistTemplateId);
      }

      // If status is completed, create transactions
      if (data.status === "completed") {
        await createShowTransactions(data, musicians, expenses);
      }

      setShows([...shows, data]);
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
    musicians: ShowMusician[] = [],
    expenses: ShowExpense[] = []
  ) => {
    if (!user) return;

    try {
      // Get current show to check status change
      const currentShow = shows.find((s) => s.id === id);

      // Sanitize updates: convert empty strings to null for time fields
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.start_time === "") sanitizedUpdates.start_time = null;
      if (sanitizedUpdates.end_time === "") sanitizedUpdates.end_time = null;

      const { data, error } = await supabase
        .from("shows")
        .update(sanitizedUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Save musicians and expenses
      if (musicians.length > 0) {
        await saveShowMusicians(id, musicians);
      }
      if (expenses.length > 0) {
        await saveShowExpenses(id, expenses);
      }

      // Fetch saved musicians and expenses if not provided
      let musiciansToUse = musicians;
      let expensesToUse = expenses;

      if (musicians.length === 0) {
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

      if (expenses.length === 0) {
        const { data: savedExpenses } = await supabase
          .from("show_expenses")
          .select("*")
          .eq("show_id", id);

        if (savedExpenses) {
          expensesToUse = savedExpenses.map((e: any) => ({
            id: e.id,
            description: e.description || "",
            category: e.category,
            value: e.amount,
          }));
        }
      }

      // Always sync transactions when show is updated (delete old, recreate if completed)
      await updateShowTransactions(data, musiciansToUse, expensesToUse);

      setShows(shows.map((s) => (s.id === id ? data : s)));
      toast.success("Show atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating show:", error);
      toast.error("Erro ao atualizar show");
    }
  };

  // Delete all transactions linked to a show
  const deleteShowTransactions = async (showId: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("show_id", showId);

      if (error) throw error;
      console.log("Transactions deleted for show:", showId);
      invalidateTransactions();
    } catch (error) {
      console.error("Error deleting show transactions:", error);
    }
  };

  // Update transactions when show is edited
  const updateShowTransactions = async (show: Show, musicians: ShowMusician[], expenses: ShowExpense[]) => {
    if (!user) return;

    // Delete existing transactions for this show
    await deleteShowTransactions(show.id);

    // If show is completed, recreate transactions
    if (show.status === "completed") {
      await createShowTransactions(show, musicians, expenses);
    }
  };

  const deleteShow = async (id: string) => {
    try {
      // First delete related transactions
      await deleteShowTransactions(id);

      // Delete related musicians and expenses
      await supabase.from("show_musicians").delete().eq("show_id", id);
      await supabase.from("show_expenses").delete().eq("show_id", id);

      // Delete the show
      const { error } = await supabase
        .from("shows")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setShows(shows.filter(s => s.id !== id));
      toast.success("Show e transações excluídos com sucesso!");
    } catch (error) {
      console.error("Error deleting show:", error);
      toast.error("Erro ao excluir show");
    }
  };

  const cancelShow = async (id: string) => {
    await updateShow(id, { status: "cancelled" });
  };

  const getConfirmedShows = () => shows.filter(s => s.status === "confirmed");
  const getCompletedShows = () => shows.filter(s => s.status === "completed");

  useEffect(() => {
    fetchShows();
  }, [user]);

  return {
    shows,
    loading,
    addShow,
    updateShow,
    deleteShow,
    cancelShow,
    getConfirmedShows,
    getCompletedShows,
    refetch: fetchShows,
  };
}
