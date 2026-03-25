import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

export interface LeadHistoryEntry {
  id: string;
  lead_id: string;
  from_status: string | null;
  to_status: string;
  changed_at: string;
}

const stageNames: Record<string, string> = {
  new: "Leads Novos",
  contact: "Em Contato",
  proposal: "Com Proposta",
  negotiation: "Negociação",
  closed: "Fechados",
  lost: "Perdidos",
};

export function useLeads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading: loading } = useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Lead[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const fetchLeadHistory = async (leadId: string): Promise<LeadHistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from("lead_history")
        .select("*")
        .eq("lead_id", leadId)
        .order("changed_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching lead history:", error);
      return [];
    }
  };

  const addLeadHistory = async (leadId: string, fromStatus: string | null, toStatus: string) => {
    try {
      await supabase
        .from("lead_history")
        .insert([{ lead_id: leadId, from_status: fromStatus, to_status: toStatus }]);
    } catch (error) {
      console.error("Error adding lead history:", error);
    }
  };

  const convertLeadToClient = async (lead: Lead) => {
    if (!user) return;
    try {
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", lead.name)
        .maybeSingle();

      if (existingClient) return;

      const { error } = await supabase
        .from("clients")
        .insert([{
          name: lead.name, email: lead.email, phone: lead.phone,
          company: lead.company, notes: lead.notes, user_id: user.id,
        }]);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["clients", user.id] });
      toast.success(`${lead.name} foi adicionado como cliente!`);
    } catch (error) {
      console.error("Error converting lead to client:", error);
    }
  };

  const addLead = async (leadData: Partial<Lead>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("leads")
        .insert([{
          name: leadData.name || "", phone: leadData.phone, email: leadData.email,
          company: leadData.company, event_type: leadData.event_type,
          event_date: leadData.event_date, estimated_value: leadData.estimated_value,
          status: leadData.status || "new", source: leadData.source,
          notes: leadData.notes, user_id: user.id,
        }])
        .select().single();

      if (error) throw error;
      await addLeadHistory(data.id, null, data.status);
      queryClient.invalidateQueries({ queryKey: ["leads", user.id] });
      toast.success("Lead adicionado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Erro ao adicionar lead");
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const currentLead = leads.find(l => l.id === id);
      const oldStatus = currentLead?.status;

      const { data, error } = await supabase
        .from("leads").update(updates).eq("id", id).select().single();

      if (error) throw error;

      if (updates.status && oldStatus !== updates.status) {
        await addLeadHistory(id, oldStatus || null, updates.status);
        if (updates.status === "closed" && currentLead) {
          await convertLeadToClient({ ...currentLead, ...updates } as Lead);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["leads", user?.id] });
      toast.success("Lead atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Erro ao atualizar lead");
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["leads", user?.id] });
      toast.success("Lead excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Erro ao excluir lead");
    }
  };

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["leads", user?.id] });

  return { leads, loading, addLead, updateLead, deleteLead, fetchLeadHistory, stageNames, refetch };
}
