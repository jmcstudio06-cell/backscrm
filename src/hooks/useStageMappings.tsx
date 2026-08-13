import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOwnerId } from "@/hooks/useWorkspace";
import { toast } from "sonner";

export interface StageElement {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  flipped?: boolean;
}

export interface InputChannel {
  id: string;
  channel: number;
  instrument: string;
  micType: string;
  di: boolean;
  observations: string;
}

export interface MaterialsChecklist {
  microfones: boolean;
  pedestais: boolean;
  di_box: boolean;
  cabos: boolean;
  retornos_palco: boolean;
  monitores: boolean;
  mesa_som: boolean;
  energia_eletrica: boolean;
  iluminacao_basica: boolean;
}

export interface StageMapping {
  id: string;
  user_id: string;
  show_id: string | null;
  name: string;
  artist_name: string | null;
  event_name: string | null;
  event_date: string | null;
  event_location: string | null;
  technical_contact: string | null;
  technical_phone: string | null;
  stage_layout: StageElement[];
  input_list: InputChannel[];
  materials_checklist: MaterialsChecklist;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

const defaultMaterialsChecklist: MaterialsChecklist = {
  microfones: false,
  pedestais: false,
  di_box: false,
  cabos: false,
  retornos_palco: false,
  monitores: false,
  mesa_som: false,
  energia_eletrica: false,
  iluminacao_basica: false,
};

export function useStageMappings() {
  const { user } = useAuth();
  const ownerId = useOwnerId();
  const [mappings, setMappings] = useState<StageMapping[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMappings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("stage_mappings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedData = (data || []).map((item: any) => ({
        ...item,
        stage_layout: item.stage_layout || [],
        input_list: item.input_list || [],
        materials_checklist: item.materials_checklist || defaultMaterialsChecklist,
      }));
      
      setMappings(formattedData);
    } catch (error) {
      console.error("Error fetching stage mappings:", error);
      toast.error("Erro ao carregar mapeamentos de palco");
    } finally {
      setLoading(false);
    }
  };

  const addMapping = async (mappingData: Partial<StageMapping>) => {
    if (!user) return;

    if (mappings.length >= 10) {
      toast.error("Limite de 10 mapeamentos atingido. Exclua um existente para criar outro.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("stage_mappings")
        .insert([{
          name: mappingData.name || "Novo Mapeamento",
          artist_name: mappingData.artist_name || null,
          event_name: mappingData.event_name || null,
          event_date: mappingData.event_date || null,
          event_location: mappingData.event_location || null,
          technical_contact: mappingData.technical_contact || null,
          technical_phone: mappingData.technical_phone || null,
          stage_layout: JSON.parse(JSON.stringify(mappingData.stage_layout || [])),
          input_list: JSON.parse(JSON.stringify(mappingData.input_list || [])),
          materials_checklist: JSON.parse(JSON.stringify(mappingData.materials_checklist || defaultMaterialsChecklist)),
          observations: mappingData.observations || null,
          show_id: mappingData.show_id || null,
          user_id: ownerId ?? user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      const formattedData: StageMapping = {
        ...data,
        stage_layout: (data.stage_layout as unknown as StageElement[]) || [],
        input_list: (data.input_list as unknown as InputChannel[]) || [],
        materials_checklist: (data.materials_checklist as unknown as MaterialsChecklist) || defaultMaterialsChecklist,
      };
      
      setMappings([formattedData, ...mappings]);
      toast.success("Mapeamento de palco criado!");
      return formattedData;
    } catch (error) {
      console.error("Error adding stage mapping:", error);
      toast.error("Erro ao criar mapeamento de palco");
    }
  };

  const updateMapping = async (id: string, updates: Partial<StageMapping>) => {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.stage_layout) dbUpdates.stage_layout = JSON.parse(JSON.stringify(updates.stage_layout));
      if (updates.input_list) dbUpdates.input_list = JSON.parse(JSON.stringify(updates.input_list));
      if (updates.materials_checklist) dbUpdates.materials_checklist = JSON.parse(JSON.stringify(updates.materials_checklist));

      const { data, error } = await supabase
        .from("stage_mappings")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      const formattedData: StageMapping = {
        ...data,
        stage_layout: (data.stage_layout as unknown as StageElement[]) || [],
        input_list: (data.input_list as unknown as InputChannel[]) || [],
        materials_checklist: (data.materials_checklist as unknown as MaterialsChecklist) || defaultMaterialsChecklist,
      };
      
      setMappings(mappings.map(m => m.id === id ? formattedData : m));
      toast.success("Mapeamento de palco atualizado!");
      return formattedData;
    } catch (error) {
      console.error("Error updating stage mapping:", error);
      toast.error("Erro ao atualizar mapeamento de palco");
    }
  };

  const deleteMapping = async (id: string) => {
    try {
      const { error } = await supabase
        .from("stage_mappings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setMappings(mappings.filter(m => m.id !== id));
      toast.success("Mapeamento de palco excluído!");
    } catch (error) {
      console.error("Error deleting stage mapping:", error);
      toast.error("Erro ao excluir mapeamento de palco");
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [user]);

  return { mappings, loading, addMapping, updateMapping, deleteMapping, refetch: fetchMappings };
}
