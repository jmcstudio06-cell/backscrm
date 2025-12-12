import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Content {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  category: string;
  type: string;
  featured: boolean;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export function useContents() {
  const { user } = useAuth();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("contents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContents((data as Content[]) || []);
    } catch (error) {
      console.error("Error fetching contents:", error);
      toast.error("Erro ao carregar conteúdos");
    } finally {
      setLoading(false);
    }
  };

  const addContent = async (contentData: Partial<Content>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contents")
        .insert([{
          title: contentData.title || "",
          description: contentData.description || null,
          url: contentData.url || null,
          category: contentData.category || "outra",
          type: contentData.type || "link",
          featured: contentData.featured || false,
          thumbnail: contentData.thumbnail || null,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setContents([data as Content, ...contents]);
      toast.success("Conteúdo adicionado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding content:", error);
      toast.error("Erro ao adicionar conteúdo");
    }
  };

  const updateContent = async (id: string, updates: Partial<Content>) => {
    try {
      const { data, error } = await supabase
        .from("contents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setContents(contents.map(c => c.id === id ? data as Content : c));
      toast.success("Conteúdo atualizado com sucesso!");
      return data;
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Erro ao atualizar conteúdo");
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setContents(contents.filter(c => c.id !== id));
      toast.success("Conteúdo excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Erro ao excluir conteúdo");
    }
  };

  useEffect(() => {
    fetchContents();
  }, [user]);

  return { contents, loading, addContent, updateContent, deleteContent, refetch: fetchContents };
}
