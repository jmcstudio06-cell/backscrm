import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ContractClause {
  id?: string;
  title: string;
  content: string;
  sort_order: number;
  is_default?: boolean;
}

export interface Contract {
  id: string;
  user_id: string;
  client_id: string | null;
  show_id: string | null;
  contract_number: string;
  title: string;
  artist_name: string | null;
  artist_document: string | null;
  artist_address: string | null;
  artist_phone: string | null;
  artist_email: string | null;
  client_name: string;
  client_document: string | null;
  client_address: string | null;
  client_phone: string | null;
  client_email: string | null;
  event_date: string | null;
  event_time: string | null;
  event_duration: string | null;
  event_location: string | null;
  event_type: string | null;
  total_value: number;
  discount: number;
  payment_terms: string | null;
  clauses: ContractClause[];
  status: string;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedClause {
  id: string;
  user_id: string;
  title: string;
  content: string;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

export function useContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [savedClauses, setSavedClauses] = useState<SavedClause[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse clauses JSON
      const parsedData = (data || []).map(contract => ({
        ...contract,
        clauses: typeof contract.clauses === 'string' 
          ? JSON.parse(contract.clauses) 
          : contract.clauses || []
      }));
      
      setContracts(parsedData);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Erro ao carregar contratos");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedClauses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contract_clauses")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setSavedClauses(data || []);
    } catch (error) {
      console.error("Error fetching clauses:", error);
    }
  };

  const addSavedClause = async (clauseData: Partial<SavedClause>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contract_clauses")
        .insert([{
          title: clauseData.title || "",
          content: clauseData.content || "",
          sort_order: clauseData.sort_order || 0,
          is_default: clauseData.is_default || false,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setSavedClauses([...savedClauses, data]);
      toast.success("Cláusula salva com sucesso!");
      return data;
    } catch (error) {
      console.error("Error adding clause:", error);
      toast.error("Erro ao salvar cláusula");
    }
  };

  const updateSavedClause = async (id: string, updates: Partial<SavedClause>) => {
    try {
      const { data, error } = await supabase
        .from("contract_clauses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setSavedClauses(savedClauses.map(c => c.id === id ? data : c));
      toast.success("Cláusula atualizada!");
      return data;
    } catch (error) {
      console.error("Error updating clause:", error);
      toast.error("Erro ao atualizar cláusula");
    }
  };

  const deleteSavedClause = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contract_clauses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setSavedClauses(savedClauses.filter(c => c.id !== id));
      toast.success("Cláusula excluída!");
    } catch (error) {
      console.error("Error deleting clause:", error);
      toast.error("Erro ao excluir cláusula");
    }
  };

  const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `CTR-${year}${month}-${random}`;
  };

  const addContract = async (contractData: Partial<Contract>) => {
    if (!user) return;

    try {
      const contractNumber = generateContractNumber();

      const { data, error } = await supabase
        .from("contracts")
        .insert([{
          contract_number: contractNumber,
          title: contractData.title || "",
          client_id: contractData.client_id,
          show_id: contractData.show_id,
          artist_name: contractData.artist_name,
          artist_document: contractData.artist_document,
          artist_address: contractData.artist_address,
          artist_phone: contractData.artist_phone,
          artist_email: contractData.artist_email,
          client_name: contractData.client_name || "",
          client_document: contractData.client_document,
          client_address: contractData.client_address,
          client_phone: contractData.client_phone,
          client_email: contractData.client_email,
          event_date: contractData.event_date,
          event_time: contractData.event_time,
          event_duration: contractData.event_duration,
          event_location: contractData.event_location,
          event_type: contractData.event_type,
          total_value: contractData.total_value || 0,
          discount: contractData.discount || 0,
          payment_terms: contractData.payment_terms,
          clauses: JSON.stringify(contractData.clauses || []),
          status: contractData.status || "draft",
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      const parsedContract = {
        ...data,
        clauses: typeof data.clauses === 'string' 
          ? JSON.parse(data.clauses) 
          : data.clauses || []
      };
      
      setContracts([parsedContract, ...contracts]);
      toast.success("Contrato criado com sucesso!");
      return parsedContract;
    } catch (error) {
      console.error("Error adding contract:", error);
      toast.error("Erro ao criar contrato");
    }
  };

  const updateContract = async (id: string, contractData: Partial<Contract>) => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (contractData.title !== undefined) updateData.title = contractData.title;
      if (contractData.client_id !== undefined) updateData.client_id = contractData.client_id;
      if (contractData.show_id !== undefined) updateData.show_id = contractData.show_id;
      if (contractData.artist_name !== undefined) updateData.artist_name = contractData.artist_name;
      if (contractData.artist_document !== undefined) updateData.artist_document = contractData.artist_document;
      if (contractData.artist_address !== undefined) updateData.artist_address = contractData.artist_address;
      if (contractData.artist_phone !== undefined) updateData.artist_phone = contractData.artist_phone;
      if (contractData.artist_email !== undefined) updateData.artist_email = contractData.artist_email;
      if (contractData.client_name !== undefined) updateData.client_name = contractData.client_name;
      if (contractData.client_document !== undefined) updateData.client_document = contractData.client_document;
      if (contractData.client_address !== undefined) updateData.client_address = contractData.client_address;
      if (contractData.client_phone !== undefined) updateData.client_phone = contractData.client_phone;
      if (contractData.client_email !== undefined) updateData.client_email = contractData.client_email;
      if (contractData.event_date !== undefined) updateData.event_date = contractData.event_date;
      if (contractData.event_time !== undefined) updateData.event_time = contractData.event_time;
      if (contractData.event_duration !== undefined) updateData.event_duration = contractData.event_duration;
      if (contractData.event_location !== undefined) updateData.event_location = contractData.event_location;
      if (contractData.event_type !== undefined) updateData.event_type = contractData.event_type;
      if (contractData.total_value !== undefined) updateData.total_value = contractData.total_value;
      if (contractData.discount !== undefined) updateData.discount = contractData.discount;
      if (contractData.payment_terms !== undefined) updateData.payment_terms = contractData.payment_terms;
      if (contractData.clauses !== undefined) updateData.clauses = JSON.stringify(contractData.clauses);
      if (contractData.status !== undefined) updateData.status = contractData.status;
      if (contractData.signed_at !== undefined) updateData.signed_at = contractData.signed_at;

      const { data, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      const parsedContract = {
        ...data,
        clauses: typeof data.clauses === 'string' 
          ? JSON.parse(data.clauses) 
          : data.clauses || []
      };
      
      setContracts(contracts.map(c => c.id === id ? parsedContract : c));
      toast.success("Contrato atualizado!");
      return parsedContract;
    } catch (error) {
      console.error("Error updating contract:", error);
      toast.error("Erro ao atualizar contrato");
    }
  };

  const deleteContract = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setContracts(contracts.filter(c => c.id !== id));
      toast.success("Contrato excluído!");
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast.error("Erro ao excluir contrato");
    }
  };

  const getDefaultClauses = (): ContractClause[] => [
    {
      title: "OBJETO",
      content: "O presente contrato tem por objeto a prestação de serviços artísticos consistentes em apresentação musical do artista vinculado à CONTRATADA, a realizar-se conforme as condições abaixo.",
      sort_order: 1,
    },
    {
      title: "VALOR E FORMA DE PAGAMENTO",
      content: "O valor total acordado para o show é de R$ [VALOR], a ser pago da seguinte forma:\n\n• 50% no ato da assinatura deste contrato;\n• 50% restantes até o dia do evento, antes do início da apresentação.",
      sort_order: 2,
    },
    {
      title: "OBRIGAÇÕES DAS PARTES",
      content: "A CONTRATADA compromete-se a:\na) Fornecer sonorização completa para a performance e transporte necessários para o show;\nb) Realizar a apresentação musical conforme acordado, no horário e local estipulados.\n\nO CONTRATANTE compromete-se a:\na) Disponibilizar alimentação adequada à equipe e artista no local do evento;\nb) Efetuar os pagamentos conforme os prazos estabelecidos neste contrato.",
      sort_order: 3,
    },
    {
      title: "CANCELAMENTO E MULTA",
      content: "Em caso de cancelamento injustificado por qualquer das partes, a parte responsável arcará com multa equivalente a 50% (cinquenta por cento) do valor total do contrato.\nEm caso de força maior (doença, acidentes, eventos climáticos extremos ou decretos públicos), as partes buscarão remarcar a apresentação sem ônus.",
      sort_order: 4,
    },
    {
      title: "DIREITO DE IMAGEM",
      content: "Fica autorizado o uso de imagem, voz, vídeos e áudios do artista para fins de divulgação do evento, nas redes sociais e mídias da contratante, sem custo adicional.",
      sort_order: 5,
    },
    {
      title: "DISPOSIÇÕES GERAIS",
      content: "a) Este contrato não cria vínculo empregatício entre as partes;\nb) Eventuais impostos e encargos são de responsabilidade de quem os incorrer;\nc) Casos omissos serão resolvidos de comum acordo entre as partes.",
      sort_order: 6,
    },
    {
      title: "FORO",
      content: "Para dirimir quaisquer dúvidas oriundas deste contrato, as partes elegem o foro da Comarca de [CIDADE]/[ESTADO].\nE, por estarem justos e contratados, firmam o presente contrato em duas vias de igual teor e forma, assinadas por ambas as partes.",
      sort_order: 7,
    },
  ];

  useEffect(() => {
    if (user) {
      fetchContracts();
      fetchSavedClauses();
    }
  }, [user]);

  return {
    contracts,
    savedClauses,
    loading,
    addContract,
    updateContract,
    deleteContract,
    addSavedClause,
    updateSavedClause,
    deleteSavedClause,
    getDefaultClauses,
    refetch: fetchContracts,
    refetchClauses: fetchSavedClauses,
  };
}
