import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useQueryClient } from "@tanstack/react-query";

interface FeatureBlocks {
  [key: string]: boolean;
}

const DEFAULT_FEATURE_BLOCKS: FeatureBlocks = {
  dashboard: true,
  agenda: true,
  crm: true,
  clientes: true,
  orcamentos: true,
  servicos: true,
  contratos: true,
  financeiro: true,
  historico: true,
  precificacao: true,
  checklist: true,
  "mapeamento-palco": true,
  equipe: true,
  metas: true,
  repertorio: true,
  aulas: true,
  avancos: true,
  tutoriais: true,
  configuracoes: true,
  "link-agenda": true,
  "link-instagram": true,
  "link-orcamento": true,
  "assinatura-digital": true,
};

export const PLAN_MODULES = {
  starter: {
    name: "Starter",
    features: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "servicos", "tutoriais", "configuracoes"],
    price: "R$ 19,90/mês",
  },
  parceiros: {
    name: "Parceiros",
    features: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "servicos", "tutoriais", "configuracoes"],
    price: "",
  },
  profissional: {
    name: "Profissional",
    features: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "link-instagram", "link-orcamento", "ideias-post", "tutoriais", "configuracoes"],
    price: "R$ 24,90/mês",
  },
  empresarial: {
    name: "Empresarial",
    features: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "contratos", "assinatura-digital", "historico", "mapeamento-palco", "metas", "metas-anuais", "aulas", "link-agenda", "link-instagram", "link-orcamento", "bonus", "ideias-post", "tutoriais", "configuracoes"],
    price: "R$ 39,90/mês",
  },
  // Legacy alias
  completo: {
    name: "Empresarial",
    features: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "contratos", "assinatura-digital", "historico", "mapeamento-palco", "metas", "metas-anuais", "aulas", "link-agenda", "link-instagram", "link-orcamento", "bonus", "ideias-post", "tutoriais", "configuracoes"],
    price: "R$ 39,90/mês",
  },
};

export function useFeatureBlocks() {
  const { user } = useAuth();
  const { ownerId, isMember, allowedFeatures, loading: workspaceLoading } = useWorkspace();
  const [featureBlocks, setFeatureBlocks] = useState<FeatureBlocks>(DEFAULT_FEATURE_BLOCKS);
  const [loading, setLoading] = useState(true);
  const [planExpired, setPlanExpired] = useState(false);

  const processProfile = useCallback((profile: { plan: string | null; feature_blocks: unknown } | null) => {
    if (!profile) {
      setFeatureBlocks(DEFAULT_FEATURE_BLOCKS);
      setPlanExpired(false);
      setLoading(false);
      return;
    }

    if (profile.plan === "expirado" || profile.plan === "comprou_expirado") {
      setPlanExpired(true);
      if (profile.feature_blocks && typeof profile.feature_blocks === 'object' && !Array.isArray(profile.feature_blocks)) {
        setFeatureBlocks(profile.feature_blocks as FeatureBlocks);
      } else {
        setFeatureBlocks({});
      }
      setLoading(false);
      return;
    }

    setPlanExpired(false);

    if (profile.plan === "trial") {
      const trialBlocked = ["mapeamento-palco", "contratos", "orcamentos", "link-agenda", "link-instagram", "link-orcamento"];
      const trialBlocks: FeatureBlocks = {};
      for (const key of Object.keys(DEFAULT_FEATURE_BLOCKS)) {
        trialBlocks[key] = trialBlocked.includes(key);
      }
      setFeatureBlocks(trialBlocks);
      setLoading(false);
      return;
    }

    if (profile.feature_blocks && typeof profile.feature_blocks === 'object' && !Array.isArray(profile.feature_blocks)) {
      setFeatureBlocks(profile.feature_blocks as FeatureBlocks);
    } else {
      setFeatureBlocks(DEFAULT_FEATURE_BLOCKS);
    }
    setLoading(false);
  }, []);

  const queryClient = useQueryClient();

  // Reuse cached profile from useProfile instead of separate DB query
  useEffect(() => {
    if (!user) {
      setFeatureBlocks(DEFAULT_FEATURE_BLOCKS);
      setPlanExpired(false);
      setLoading(false);
      return;
    }

    if (workspaceLoading || !ownerId) return;

    // Try to get profile from React Query cache first
    const cachedProfile = queryClient.getQueryData<any>(["profile", ownerId]);
    if (cachedProfile) {
      processProfile(cachedProfile);
      return;
    }

    // Fallback: fetch from DB only if not cached
    async function fetchBlocks() {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("plan, feature_blocks")
          .eq("user_id", ownerId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setFeatureBlocks(DEFAULT_FEATURE_BLOCKS);
          setLoading(false);
          return;
        }

        processProfile(profile);
      } catch (err) {
        console.error("Error fetching feature blocks:", err);
        setFeatureBlocks(DEFAULT_FEATURE_BLOCKS);
        setLoading(false);
      }
    }

    fetchBlocks();
  }, [user, ownerId, workspaceLoading, processProfile, queryClient]);

  // Realtime subscription — updates sidebar instantly when admin changes blocks
  useEffect(() => {
    if (!user || !ownerId) return;

    const channel = supabase
      .channel(`profile-blocks:${ownerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${ownerId}`,
        },
        (payload) => {
          const updated = payload.new as { plan: string | null; feature_blocks: unknown };
          processProfile(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, ownerId, processProfile]);

  // Team members only see the tabs the owner released for them (intersection
  // with the owner plan — never more than the owner has).
  const effectiveBlocks = useMemo(() => {
    if (!isMember) return featureBlocks;
    const allowed = new Set(allowedFeatures ?? []);
    const out: FeatureBlocks = { ...featureBlocks };
    const keys = new Set([...Object.keys(DEFAULT_FEATURE_BLOCKS), ...Object.keys(featureBlocks), "usuarios", "ideias-post", "metas-anuais", "bonus", "ranking"]);
    for (const key of keys) {
      if (!allowed.has(key)) out[key] = true;
    }
    return out;
  }, [featureBlocks, isMember, allowedFeatures]);

  const isBlocked = (featureKey: string): boolean => {
    if (isMember) {
      if (featureKey === "usuarios") return true;
      return effectiveBlocks[featureKey] === true;
    }
    if (planExpired && featureKey !== "admin") {
      if (featureBlocks[featureKey] === false) return false;
      return true;
    }
    // Ranking & Selos is available to every active plan (including trial)
    if (featureKey === "ranking") return false;
    return featureBlocks[featureKey] === true;
  };

  const blocks = Object.entries(effectiveBlocks).map(([feature_key, blocked]) => ({
    feature_key,
    blocked,
  }));

  return { blocks, loading: loading || workspaceLoading, isBlocked, planExpired, featureBlocks: effectiveBlocks, planFeatureBlocks: featureBlocks };
}
