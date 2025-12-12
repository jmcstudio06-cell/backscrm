import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  event_type: string | null;
  event_date: string | null;
  estimated_value: number | null;
  status: string;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const addLead = async (leadData: Partial<Lead>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("leads")
        .insert([{
          name: leadData.name || "",
          phone: leadData.phone,
          email: leadData.email,
          company: leadData.company,
          event_type: leadData.event_type,
          event_date: leadData.event_date,
          estimated_value: leadData.estimated_value,
          status: leadData.status || "new",
          source: leadData.source,
          notes: leadData.notes,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setLeads([data, ...leads]);
      toast.success("Lead adicionado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Erro ao adicionar lead");
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setLeads(leads.map(l => l.id === id ? data : l));
      toast.success("Lead atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Erro ao atualizar lead");
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setLeads(leads.filter(l => l.id !== id));
      toast.success("Lead excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Erro ao excluir lead");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  return { leads, loading, addLead, updateLead, deleteLead, refetch: fetchLeads };
}
