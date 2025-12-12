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

export function useShowsData() {
  const { user } = useAuth();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShows = async () => {
    if (!user) return;
    
    try {
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

  const addShow = async (showData: Partial<Show>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("shows")
        .insert([{
          title: showData.title || "",
          date: showData.date || new Date().toISOString().split("T")[0],
          start_time: showData.start_time,
          end_time: showData.end_time,
          venue: showData.venue,
          address: showData.address,
          cachet: showData.cachet || 0,
          status: showData.status || "scheduled",
          client_id: showData.client_id,
          lead_id: showData.lead_id,
          event_type: showData.event_type,
          notes: showData.notes,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setShows([...shows, data]);
      toast.success("Show adicionado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding show:", error);
      toast.error("Erro ao adicionar show");
    }
  };

  const updateShow = async (id: string, updates: Partial<Show>) => {
    try {
      const { data, error } = await supabase
        .from("shows")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setShows(shows.map(s => s.id === id ? data : s));
      toast.success("Show atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating show:", error);
      toast.error("Erro ao atualizar show");
    }
  };

  const deleteShow = async (id: string) => {
    try {
      const { error } = await supabase
        .from("shows")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setShows(shows.filter(s => s.id !== id));
      toast.success("Show excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting show:", error);
      toast.error("Erro ao excluir show");
    }
  };

  const cancelShow = async (id: string) => {
    await updateShow(id, { status: "cancelled" });
  };

  const getConfirmedShows = () => shows.filter(s => s.status === "confirmed");

  useEffect(() => {
    fetchShows();
  }, [user]);

  return { shows, loading, addShow, updateShow, deleteShow, cancelShow, getConfirmedShows, refetch: fetchShows };
}
