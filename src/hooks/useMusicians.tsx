import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Musician {
  id: string;
  name: string;
  instrument: string | null;
  email: string | null;
  phone: string | null;
  rate: number | null;
  notes: string | null;
  member_type: string;
  rating: number | null;
  payment_request_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useMusicians() {
  const { user } = useAuth();
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMusicians = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("musicians")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMusicians(data || []);
    } catch (error) {
      console.error("Error fetching musicians:", error);
      toast.error("Erro ao carregar músicos");
    } finally {
      setLoading(false);
    }
  };

  const addMusician = async (musicianData: Partial<Musician> & { member_type?: string; rating?: number; payment_request_date?: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("musicians")
        .insert([{
          name: musicianData.name || "",
          instrument: musicianData.instrument,
          email: musicianData.email,
          phone: musicianData.phone,
          rate: musicianData.rate,
          notes: musicianData.notes,
          member_type: musicianData.member_type || "freelancer",
          rating: musicianData.rating,
          payment_request_date: musicianData.payment_request_date,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setMusicians([data, ...musicians]);
      toast.success("Membro adicionado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding musician:", error);
      toast.error("Erro ao adicionar membro");
    }
  };

  const updateMusician = async (id: string, updates: Partial<Musician> & { member_type?: string; rating?: number; payment_request_date?: string }) => {
    try {
      const { data, error } = await supabase
        .from("musicians")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setMusicians(musicians.map(m => m.id === id ? data : m));
      toast.success("Membro atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating musician:", error);
      toast.error("Erro ao atualizar membro");
    }
  };

  const deleteMusician = async (id: string) => {
    try {
      const { error } = await supabase
        .from("musicians")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setMusicians(musicians.filter(m => m.id !== id));
      toast.success("Músico excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting musician:", error);
      toast.error("Erro ao excluir músico");
    }
  };

  useEffect(() => {
    fetchMusicians();
  }, [user]);

  return { musicians, loading, addMusician, updateMusician, deleteMusician, refetch: fetchMusicians };
}
