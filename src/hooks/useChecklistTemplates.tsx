import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ChecklistTemplate {
  id: string;
  name: string;
  tasks: string[];
  created_at: string;
  updated_at: string;
}

export function useChecklistTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("checklist_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Parse JSONB tasks to string array
      const parsedTemplates: ChecklistTemplate[] = (data || []).map((t: any) => ({
        ...t,
        tasks: Array.isArray(t.tasks) ? t.tasks : [],
      }));

      setTemplates(parsedTemplates);
    } catch (error) {
      console.error("Error fetching checklist templates:", error);
      toast.error("Erro ao carregar modelos de checklist");
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (name: string, tasks: string[]) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("checklist_templates")
        .insert([{
          name,
          tasks,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newTemplate: ChecklistTemplate = {
        ...data,
        tasks: Array.isArray(data.tasks) ? (data.tasks as string[]) : [],
      };

      setTemplates([newTemplate, ...templates]);
      toast.success("Modelo de checklist criado!");
      return newTemplate;
    } catch (error) {
      console.error("Error creating checklist template:", error);
      toast.error("Erro ao criar modelo de checklist");
      return null;
    }
  };

  const updateTemplate = async (id: string, name: string, tasks: string[]) => {
    try {
      const { data, error } = await supabase
        .from("checklist_templates")
        .update({ name, tasks })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedTemplate: ChecklistTemplate = {
        ...data,
        tasks: Array.isArray(data.tasks) ? (data.tasks as string[]) : [],
      };

      setTemplates(templates.map(t => t.id === id ? updatedTemplate : t));
      toast.success("Modelo atualizado!");
      return updatedTemplate;
    } catch (error) {
      console.error("Error updating checklist template:", error);
      toast.error("Erro ao atualizar modelo");
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("checklist_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== id));
      toast.success("Modelo excluído!");
    } catch (error) {
      console.error("Error deleting checklist template:", error);
      toast.error("Erro ao excluir modelo");
    }
  };

  const applyTemplateToShow = async (showId: string, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      // Insert all tasks from template to show_checklist
      const checklistItems = template.tasks.map(task => ({
        show_id: showId,
        item: task,
        completed: false,
      }));

      const { error } = await supabase
        .from("show_checklist")
        .insert(checklistItems);

      if (error) throw error;

      // Update show with template reference
      await supabase
        .from("shows")
        .update({ checklist_template_id: templateId })
        .eq("id", showId);

      return true;
    } catch (error) {
      console.error("Error applying template to show:", error);
      toast.error("Erro ao aplicar checklist ao show");
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplateToShow,
    refetch: fetchTemplates,
  };
}
