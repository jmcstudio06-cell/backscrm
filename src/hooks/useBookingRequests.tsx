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
  event_type: string | null;
  event_city: string | null;
  event_location: string | null;
  event_time: string | null;
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

  const createShowFromRequest = async (request: BookingRequest) => {
    if (!user) return false;
    try {
      const { error: showError } = await supabase
        .from("shows")
        .insert([{
          user_id: user.id,
          title: request.product_name
            ? `${request.client_name} - ${request.product_name}`
            : request.client_name,
          date: request.event_date,
          start_time: request.event_time || null,
          venue: request.event_location || null,
          address: request.event_city || null,
          event_type: request.event_type || null,
          notes: request.observations || null,
          status: "confirmed",
          cachet: 0,
        }]);

      if (showError) {
        console.error("Error creating show from booking:", showError);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error creating show from booking:", error);
      return false;
    }
  };

  const sendToAgenda = async (id: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;
    const success = await createShowFromRequest(request);
    if (success) {
      toast.success("Show adicionado à agenda!");
    } else {
      toast.error("Erro ao adicionar show à agenda.");
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("booking_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      // When approved, automatically create a show in the artist's agenda
      if (status === "aprovado" && user) {
        const request = requests.find(r => r.id === id);
        if (request) {
          const success = await createShowFromRequest(request);
          if (!success) {
            toast.error("Solicitação aprovada, mas houve erro ao criar o show na agenda.");
            fetchRequests();
            return true;
          }
          toast.success("Solicitação aprovada e show adicionado à agenda!");
          fetchRequests();
          return true;
        }
      }

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

  return { requests, loading, fetchRequests, updateRequestStatus, deleteRequest, sendToAgenda };
}
