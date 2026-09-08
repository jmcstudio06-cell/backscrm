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
  "backs-radar": true,
  bonus: true,
  "ideias-post": true,
  "metas-anuais": true,
  usuarios: true,
};

// Plan → released features (single source of truth for the app UI).
// Starter is legacy: no longer sold, but kept working for existing subscribers.
const STARTER = ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "servicos", "tutoriais", "configuracoes"];
const PROFISSIONAL = [
  "dashboard", "agenda", "clientes", "repertorio", "financeiro", "precificacao",
  "orcamentos", "servicos", "checklist", "crm", "link-instagram", "ideias-post",
  "avancos", "tutoriais", "configuracoes",
];
const EMPRESARIAL = [
  ...PROFISSIONAL,
  "equipe", "contratos", "assinatura-digital", "historico", "mapeamento-palco",
  "metas", "metas-anuais", "aulas", "link-agenda", "link-orcamento", "bonus",
];
const EXECUTIVO = [...EMPRESARIAL, "backs-radar", "usuarios"];
const TRIAL = ["dashboard", "agenda", "crm", "clientes", "financeiro", "historico", "precificacao", "checklist", "equipe", "metas", "repertorio", "aulas", "avancos", "tutoriais", "configuracoes", "servicos"];

const PLAN_RELEASED: Record<string, string[]> = {
  trial: TRIAL,
  mensal_starter: STARTER,
  anual_starter: STARTER,
  parceiros: STARTER,
  mensal_profissional: PROFISSIONAL,
  anual_profissional: PROFISSIONAL,
  mensal_empresarial: EMPRESARIAL,
  anual_empresarial: EMPRESARIAL,
  mensal_completo: EMPRESARIAL,
  anual_completo: EMPRESARIAL,
  mensal_executivo: EXECUTIVO,
  anual_executivo: EXECUTIVO,
};

function blocksForPlan(plan: string | null, stored: FeatureBlocks): FeatureBlocks {
  const released = PLAN_RELEASED[plan ?? ""];
  if (!released) return Object.keys(stored).length ? { ...DEFAULT_FEATURE_BLOCKS, ...stored } : DEFAULT_FEATURE_BLOCKS;
  const out: FeatureBlocks = {};
  const keys = new Set([...Object.keys(DEFAULT_FEATURE_BLOCKS), ...Object.keys(stored)]);
  for (const key of keys) {
    // Plan defines the base; an explicit release saved by the admin can only unlock.
    out[key] = released.includes(key) ? false : stored[key] === false ? false : true;
  }
  return out;
}


export const PLAN_MODULES = {
  // Legacy plan, not sold anymore — kept for existing subscribers.
  starter: {
    name: "Starter (legado)",
    features: STARTER,
    price: "",
  },
  parceiros: {
    name: "Parceiros",
    features: STARTER,
    price: "",
  },
  profissional: {
    name: "Profissional",
    features: PROFISSIONAL,
    price: "R$ 24,90/mês",
  },
  empresarial: {
    name: "Empresarial",
    features: EMPRESARIAL,
    price: "R$ 39,90/mês",
  },
  executivo: {
    name: "Executivo",
    features: EXECUTIVO,
    price: "R$ 79,90/mês",
  },
  // Legacy alias
  completo: {
    name: "Empresarial",
    features: EMPRESARIAL,
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

    const stored =
      profile.feature_blocks && typeof profile.feature_blocks === "object" && !Array.isArray(profile.feature_blocks)
        ? (profile.feature_blocks as FeatureBlocks)
        : {};

    setFeatureBlocks(blocksForPlan(profile.plan, stored));
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
