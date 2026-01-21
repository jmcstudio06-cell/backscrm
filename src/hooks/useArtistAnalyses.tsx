import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ArtistAnalysis {
  id: string;
  artist_name: string;
  whatsapp: string;
  shows_per_month: string;
  who_manages: string;
  difficulties: string[];
  lost_opportunities: string;
  history_reflection: string | null;
  availability: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type AnalysisStatus = 'new' | 'analyzing' | 'approved' | 'rejected' | 'scheduled' | 'completed';

export const analysisStatusConfig: Record<AnalysisStatus, { label: string; color: string }> = {
  new: { label: 'Novo', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  analyzing: { label: 'Em análise', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Recusado', color: 'bg-red-100 text-red-700 border-red-200' },
  scheduled: { label: 'Agendado', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed: { label: 'Finalizado', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export function useArtistAnalyses() {
  const [analyses, setAnalyses] = useState<ArtistAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("artist_analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error("Error fetching artist analyses:", error);
      toast.error("Erro ao carregar análises");
    } finally {
      setLoading(false);
    }
  };

  const submitAnalysis = async (analysisData: Omit<ArtistAnalysis, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from("artist_analyses")
        .insert([{
          ...analysisData,
          status: 'new',
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error submitting analysis:", error);
      return { success: false, error };
    }
  };

  const updateAnalysisStatus = async (id: string, status: AnalysisStatus) => {
    try {
      const { error } = await supabase
        .from("artist_analyses")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      setAnalyses(prev => prev.map(a => 
        a.id === id ? { ...a, status } : a
      ));
      toast.success(`Status atualizado para: ${analysisStatusConfig[status].label}`);
    } catch (error) {
      console.error("Error updating analysis status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from("artist_analyses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setAnalyses(prev => prev.filter(a => a.id !== id));
      toast.success("Análise excluída com sucesso");
    } catch (error) {
      console.error("Error deleting analysis:", error);
      toast.error("Erro ao excluir análise");
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  return {
    analyses,
    loading,
    submitAnalysis,
    updateAnalysisStatus,
    deleteAnalysis,
    refetch: fetchAnalyses,
  };
}
