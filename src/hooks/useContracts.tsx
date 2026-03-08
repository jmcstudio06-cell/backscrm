import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { compactClauses } from "@/lib/textUtils";

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
      
      const allContracts = (data || []).map(contract => ({
        ...contract,
        clauses: typeof contract.clauses === 'string' 
          ? JSON.parse(contract.clauses) 
          : contract.clauses || []
      }));

      // Auto-delete contracts beyond the 5 most recent
      if (allContracts.length > 5) {
        const toDelete = allContracts.slice(5);
        for (const c of toDelete) {
          await supabase.from("contracts").delete().eq("id", c.id);
        }
      }
      
      setContracts(allContracts.slice(0, 5));
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
          clauses: JSON.stringify(compactClauses(contractData.clauses || [])),
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
      if (contractData.clauses !== undefined) updateData.clauses = JSON.stringify(compactClauses(contractData.clauses));
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
      title: "PARTES",
      content: "1.1. Pelo presente instrumento, o CONTRATANTE declara contratar os serviços artísticos do CONTRATADO, para realização de apresentação musical ao vivo.\n1.2. Ambas as partes concordam com as condições estabelecidas neste documento.",
      sort_order: 1,
    },
    {
      title: "OBJETO",
      content: "2.1. O presente contrato tem como objeto a prestação de serviços de show ao vivo executado pelo CONTRATADO.\n2.2. A apresentação será realizada conforme repertório e estrutura previamente acordados entre as partes.",
      sort_order: 2,
    },
    {
      title: "PAGAMENTO",
      content: "3.1. O valor do show e a forma de pagamento serão definidos na página inicial do documento, preenchidos pelo CONTRATANTE antes da assinatura.\n3.2. Após confirmado o pagamento acordado, considera-se a data devidamente reservada ao CONTRATANTE.\n3.3. O não pagamento do valor combinado poderá resultar no cancelamento automático da reserva.",
      sort_order: 3,
    },
    {
      title: "OBRIGAÇÕES DO CONTRATADO",
      content: "4.1. Executar o show com profissionalismo, pontualidade e qualidade técnica.\n4.2. Disponibilizar os músicos e/ou equipe conforme acordado previamente.\n4.3. Zelar pelos equipamentos próprios utilizados durante a apresentação.",
      sort_order: 4,
    },
    {
      title: "OBRIGAÇÕES DO CONTRATANTE",
      content: "5.1. Disponibilizar estrutura mínima adequada, incluindo palco, energia, som e iluminação (caso não sejam fornecidos pelo artista).\n5.2. Garantir condições seguras para o CONTRATADO e sua equipe durante todo o período no local.\n5.3. Fornecer um espaço protegido para armazenamento de instrumentos e equipamentos.\n5.4. Responder por danos causados aos equipamentos do CONTRATADO por parte do público ou organização.",
      sort_order: 5,
    },
    {
      title: "CANCELAMENTO",
      content: "6.1. Cancelamento pelo CONTRATANTE:\n• Com menos de 7 dias de antecedência: pagamento de 50% do valor total.\n• Com menos de 48 horas de antecedência: pagamento de 100% do valor total.\n\n6.2. Cancelamento pelo CONTRATADO:\n• Deve haver comunicação prévia sempre que possível.\n• Qualquer valor recebido deve ser devolvido integralmente ao CONTRATANTE.",
      sort_order: 6,
    },
    {
      title: "IMAGEM E DIVULGAÇÃO",
      content: "7.1. O CONTRATANTE pode usar o nome e imagem do CONTRATADO exclusivamente para divulgação do evento específico.\n7.2. O CONTRATADO pode divulgar o evento em suas redes sociais, exceto se houver pedido formal contrário do CONTRATANTE.",
      sort_order: 7,
    },
    {
      title: "DIREITOS AUTORAIS / ECAD",
      content: "8.1. A responsabilidade pelo pagamento das taxas de execução pública (ECAD) é integralmente do CONTRATANTE.\n8.2. O CONTRATADO não responde por autorizações relacionadas a direitos autorais das músicas executadas.",
      sort_order: 8,
    },
    {
      title: "SEGURANÇA",
      content: "9.1. Caso haja risco à integridade física do CONTRATADO ou do público, a apresentação poderá ser interrompida sem prejuízo de pagamento.\n9.2. Situações como tumultos, mau funcionamento de estrutura, condições climáticas ou falta de segurança são de responsabilidade do CONTRATANTE.",
      sort_order: 9,
    },
  ];

  const getSuggestedClauses = (): ContractClause[] => [
    {
      title: "FORO",
      content: "10.1. Para dirimir questões decorrentes deste contrato, fica eleito o foro da comarca do CONTRATANTE, com renúncia a qualquer outro, por mais privilegiado que seja.",
      sort_order: 10,
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
    getSuggestedClauses,
    addSavedClause,
    updateSavedClause,
    deleteSavedClause,
    getDefaultClauses,
    refetch: fetchContracts,
    refetchClauses: fetchSavedClauses,
  };
}
