import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
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
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShows = async () => {
    if (!user) return;
    
    try {
      // First, find past shows that need auto-completion
      const today = new Date().toISOString().split("T")[0];
      
      const { data: showsToComplete } = await supabase
        .from("shows")
        .select("*")
        .lt("date", today)
        .in("status", ["scheduled", "confirmed", "pending", "negotiation"]);

      if (showsToComplete && showsToComplete.length > 0) {
        // Auto-complete them
        await supabase
          .from("shows")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .lt("date", today)
          .in("status", ["scheduled", "confirmed", "pending", "negotiation"]);

        // Create financial transactions for each auto-completed show
        for (const show of showsToComplete) {
          const completedShow = { ...show, status: "completed" } as Show;
          
          // Fetch musicians
          const { data: savedMusicians } = await supabase
            .from("show_musicians")
            .select("musician_id, fee, musicians(name)")
            .eq("show_id", show.id);

          const musicians: ShowMusician[] = (savedMusicians || []).map((m: any) => ({
            musicianId: m.musician_id,
            name: m.musicians?.name || "Músico",
            fee: m.fee,
          }));

          // Fetch expenses
          const { data: savedExpenses } = await supabase
            .from("show_expenses")
            .select("*")
            .eq("show_id", show.id);

          const expenses: ShowExpense[] = (savedExpenses || []).map((e: any) => ({
            id: e.id,
            description: e.description || "",
            category: e.category,
            value: e.amount,
          }));

          await createShowTransactions(completedShow, musicians, expenses);
        }
      }
      
      // Then fetch all shows
      const { data, error } = await supabase
        .from("shows")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setShows(data || []);
    } catch (error) {
      console.error("Error fetching shows:", error);
      toast.error("Erro ao carregar shows");
    } finally {
      setLoading(false);
    }
  };

  // Create financial transactions when show is marked as completed
  const createShowTransactions = async (show: Show, musicians: ShowMusician[], expenses: ShowExpense[]) => {
    if (!user) return;

    try {
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
    checklistTemplateId?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("shows")
        .insert([{
          title: showData.title || "",
          date: showData.date || new Date().toISOString().split("T")[0],
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
