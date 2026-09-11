import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOwnerId } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const ownerId = useOwnerId();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading: loading } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      const PAGE = 1000;

      const fetchAllClients = async () => {
        const all: any[] = [];
        for (let from = 0; ; from += PAGE) {
          const { data, error } = await supabase
            .from("clients")
            .select("*")
            .order("created_at", { ascending: false })
            .range(from, from + PAGE - 1);
          if (error) throw error;
          all.push(...(data || []));
          if (!data || data.length < PAGE) break;
        }
        return all;
      };

      const fetchAllShows = async () => {
        const all: any[] = [];
        for (let from = 0; ; from += PAGE) {
          const { data, error } = await supabase
            .from("shows")
            .select("client_id, cachet, status")
            .not("client_id", "is", null)
            // Alinha com o Dashboard: conta só shows efetivamente realizados
            .in("status", ["completed", "partial"])
            .order("id", { ascending: true })
            .range(from, from + PAGE - 1);
          if (error) throw error;
          all.push(...(data || []));
          if (!data || data.length < PAGE) break;
        }
        return all;
      };

      const [clientsData, showsData] = await Promise.all([fetchAllClients(), fetchAllShows()]);
      const clientsResult = { data: clientsData };
      const showsResult = { data: showsData };


      const showsMap: Record<string, { count: number; total: number }> = {};
      (showsResult.data || []).forEach((show: any) => {
        if (!show.client_id) return;
        if (!showsMap[show.client_id]) showsMap[show.client_id] = { count: 0, total: 0 };
        showsMap[show.client_id].count++;
        showsMap[show.client_id].total += show.cachet || 0;
      });

      const clientsWithTotals = (clientsResult.data || []).map(client => ({
        ...client,
        total_spent: showsMap[client.id]?.total || 0,
        shows_count: showsMap[client.id]?.count || 0,
      }));

      clientsWithTotals.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      return clientsWithTotals as Client[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const normalizeName = (value: string) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const addClient = async (clientData: Partial<Client>) => {
    if (!user) return;
    try {
      const cleanName = (clientData.name || "").replace(/\s+/g, " ").trim();

      // Se já existe cliente com o mesmo nome, unifica (atualiza) em vez de duplicar.
      const existing = clients.find(
        (c) => normalizeName(c.name) === normalizeName(cleanName)
      );
      if (existing) {
        const merged: Record<string, any> = {};
        (["email", "phone", "company", "cpf", "rg", "address", "notes"] as const).forEach((f) => {
          const incoming = (clientData as any)[f];
          if (incoming) merged[f] = incoming;
        });
        const { data, error } = await supabase
          .from("clients")
          .update(merged)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["clients", user.id] });
        toast.success("Cliente já existia — dados unificados!");
        return data;
      }

      const { data, error } = await supabase
        .from("clients")
        .insert([{
          name: cleanName, email: clientData.email,
          phone: clientData.phone, company: clientData.company,
          cpf: clientData.cpf, rg: clientData.rg, address: clientData.address,
          notes: clientData.notes, user_id: ownerId ?? user.id,
        }])
        .select().single();

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["clients", user.id] });
      toast.success("Cliente adicionado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Erro ao adicionar cliente");
    }
  };


  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from("clients").update(updates).eq("id", id).select().single();
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
      toast.success("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
    }
  };

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });

  return { clients, loading, addClient, updateClient, deleteClient, refetch };
}
