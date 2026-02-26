import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface BookingRequest {
  id: string;
  artist_id: string;
  product_id: string | null;
  product_name: string | null;
  event_date: string;
  client_name: string;
  client_phone: string;
  event_city: string | null;
  event_location: string | null;
  observations: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useBookingRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("booking_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast.success(status === "aprovado" ? "Solicitação aprovada!" : "Solicitação recusada.");
      fetchRequests();
      return true;
    } catch (error) {
      console.error("Error updating booking request:", error);
      toast.error("Erro ao atualizar solicitação");
      return false;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from("booking_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Solicitação removida.");
      fetchRequests();
    } catch (error) {
      console.error("Error deleting booking request:", error);
      toast.error("Erro ao remover solicitação");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  return { requests, loading, fetchRequests, updateRequestStatus, deleteRequest };
}
