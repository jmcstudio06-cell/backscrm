import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOwnerId } from "@/hooks/useWorkspace";
import { toast } from "sonner";

export interface ContractSignatureLink {
  id: string;
  user_id: string;
  contract_id: string;
  token: string;
  status: "awaiting_artist" | "awaiting_client" | "signed" | "cancelled" | string;
  artist_signature_name: string | null;
  artist_signed_at: string | null;
  client_signature_name: string | null;
  client_signature_document: string | null;
  client_signature_email: string | null;
  client_signed_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

function makeToken() {
  // 22-char URL-safe random token
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function useContractSignatureLinks(contractId?: string) {
  const { user } = useAuth();
  const ownerId = useOwnerId();
  const [links, setLinks] = useState<ContractSignatureLink[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLinks = useCallback(async () => {
    if (!user || !contractId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contract_signature_links")
        .select("*")
        .eq("contract_id", contractId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setLinks((data as ContractSignatureLink[]) || []);
    } catch (err) {
      console.error("Error fetching signature links:", err);
    } finally {
      setLoading(false);
    }
  }, [user, contractId]);

  const createLink = async (targetContractId: string) => {
    if (!user) return null;
    const token = makeToken();
    const { data, error } = await supabase
      .from("contract_signature_links")
      .insert([
        {
          user_id: ownerId ?? user.id,
          contract_id: targetContractId,
          token,
          status: "awaiting_artist",
        },
      ])
      .select()
      .single();
    if (error) {
      console.error(error);
      toast.error("Erro ao gerar link de assinatura");
      return null;
    }
    setLinks((prev) => [data as ContractSignatureLink, ...prev]);
    toast.success("Link de assinatura gerado!");
    return data as ContractSignatureLink;
  };

  const signAsArtist = async (linkId: string, signatureName: string) => {
    if (!signatureName || signatureName.trim().length < 3) {
      toast.error("Digite seu nome completo para assinar");
      return null;
    }
    const { data, error } = await supabase
      .from("contract_signature_links")
      .update({
        artist_signature_name: signatureName.trim(),
        artist_signed_at: new Date().toISOString(),
        status: "awaiting_client",
      })
      .eq("id", linkId)
      .select()
      .single();
    if (error) {
      console.error(error);
      toast.error("Erro ao assinar contrato");
      return null;
    }
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? (data as ContractSignatureLink) : l)),
    );
    toast.success("Assinatura registrada! Envie o link para o cliente.");
    return data as ContractSignatureLink;
  };

  const cancelLink = async (linkId: string) => {
    const { error } = await supabase
      .from("contract_signature_links")
      .update({ status: "cancelled" })
      .eq("id", linkId);
    if (error) {
      toast.error("Erro ao cancelar link");
      return;
    }
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, status: "cancelled" } : l)),
    );
    toast.success("Link cancelado");
  };

  const deleteLink = async (linkId: string) => {
    const { error } = await supabase
      .from("contract_signature_links")
      .delete()
      .eq("id", linkId);
    if (error) {
      toast.error("Erro ao excluir link");
      return;
    }
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  useEffect(() => {
    if (contractId) fetchLinks();
  }, [contractId, fetchLinks]);

  return { links, loading, createLink, signAsArtist, cancelLink, deleteLink, refetch: fetchLinks };
}
