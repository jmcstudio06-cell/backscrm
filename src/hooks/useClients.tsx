import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  cpf: string | null;
  rg: string | null;
  address: string | null;
  notes: string | null;
  shows_count: number | null;
  total_spent: number | null;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });

      if (error) throw error;

      // Single query to get all shows with client_id (instead of N queries)
      const clientIds = (data || []).map(c => c.id);
      let showsMap: Record<string, { count: number; total: number }> = {};

      if (clientIds.length > 0) {
        const { data: allShows } = await supabase
          .from("shows")
          .select("client_id, cachet")
          .in("client_id", clientIds);

        if (allShows) {
          for (const show of allShows) {
            if (!show.client_id) continue;
            if (!showsMap[show.client_id]) showsMap[show.client_id] = { count: 0, total: 0 };
            showsMap[show.client_id].count++;
            showsMap[show.client_id].total += show.cachet || 0;
          }
        }
      }

      const clientsWithTotals = (data || []).map(client => ({
        ...client,
        total_spent: showsMap[client.id]?.total || 0,
        shows_count: showsMap[client.id]?.count || 0,
      }));

      // Sort alphabetically by name
      clientsWithTotals.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      setClients(clientsWithTotals);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Partial<Client>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([
          {
            name: clientData.name || "",
            email: clientData.email,
            phone: clientData.phone,
            company: clientData.company,
            notes: clientData.notes,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const { data: showsData, error: showsError } = await supabase
        .from("shows")
        .select("cachet")
        .eq("client_id", data.id);

      const totalSpent = showsData?.reduce((sum, s) => sum + (s.cachet || 0), 0) || 0;
      const showsCount = showsData?.length || 0;

      setClients([{ ...data, total_spent: totalSpent, shows_count: showsCount }, ...clients]);
      toast.success("Cliente adicionado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Erro ao adicionar cliente");
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase.from("clients").update(updates).eq("id", id).select().single();

      if (error) throw error;

      const { data: showsData, error: showsError } = await supabase.from("shows").select("cachet").eq("client_id", id);

      const totalSpent = showsData?.reduce((sum, s) => sum + (s.cachet || 0), 0) || 0;
      const showsCount = showsData?.length || 0;

      setClients(clients.map((c) => (c.id === id ? { ...data, total_spent: totalSpent, shows_count: showsCount } : c)));
      toast.success("Cliente atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);

      if (error) throw error;
      setClients(clients.filter((c) => c.id !== id));
      toast.success("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return { clients, loading, addClient, updateClient, deleteClient, refetch: fetchClients };
}
