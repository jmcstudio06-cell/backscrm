import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Interface para os bloqueios de features (novo formato JSON)
interface FeatureBlocks {
  [key: string]: boolean;
}

// Default feature blocks para novos usuários (tudo bloqueado exceto básico)
const DEFAULT_FEATURE_BLOCKS: FeatureBlocks = {
  dashboard: true,
  agenda: true,
  crm: true,
  clientes: true,
  orcamentos: true,
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
};

// Módulos e quais features eles desbloqueiam
export const PLAN_MODULES = {
  starter: {
    name: "Starter",
    features: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "tutoriais", "configuracoes"],
    price: "R$ 19,90/mês",
  },
  profissional: {
    name: "Profissional",
    features: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "checklist", "equipe", "tutoriais", "configuracoes"],
    price: "R$ 24,90/mês",
  },
  completo: {
    name: "Completo",
    features: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "checklist", "equipe", "contratos", "historico", "mapeamento-palco", "metas", "aulas", "tutoriais", "configuracoes"],
    price: "R$ 39,90/mês",
  },
};

export function useFeatureBlocks() {
  const { user } = useAuth();
  const [featureBlocks, setFeatureBlocks] = useState<FeatureBlocks>(DEFAULT_FEATURE_BLOCKS);
  const [loading, setLoading] = useState(true);
  const [planExpired, setPlanExpired] = useState(false);

  useEffect(() => {
    async function fetchBlocks() {
      if (!user) {
        setFeatureBlocks(DEFAULT_FEATURE_BLOCKS);
        setPlanExpired(false);
        setLoading(false);
        return;
      }

      try {
        // Buscar perfil com feature_blocks (novo formato JSON)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("plan, feature_blocks")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setFeatureBlocks(DEFAULT_FEATURE_BLOCKS);
          setLoading(false);
          return;
        }

        // Verificar se o plano expirou
        if (profile?.plan === "expirado") {
          setPlanExpired(true);
          // Quando expirado, carregar feature_blocks do perfil para respeitar desbloqueios específicos
          if (profile?.feature_blocks && typeof profile.feature_blocks === 'object') {
            setFeatureBlocks(profile.feature_blocks as FeatureBlocks);
          } else {
            setFeatureBlocks({});
          }
          setLoading(false);
          return;
        }

        setPlanExpired(false);

        // Trial plan: liberar apenas features específicas
        if (profile?.plan === "trial") {
          const trialAllowed = ["dashboard", "agenda", "clientes", "crm", "tutoriais", "precificacao", "repertorio", "configuracoes"];
          const trialBlocks: FeatureBlocks = {};
          for (const key of Object.keys(DEFAULT_FEATURE_BLOCKS)) {
            trialBlocks[key] = !trialAllowed.includes(key);
          }
          setFeatureBlocks(trialBlocks);
          setLoading(false);
          return;
        }

        // Usar feature_blocks do perfil (novo formato JSON)
        if (profile?.feature_blocks && typeof profile.feature_blocks === 'object') {
          setFeatureBlocks(profile.feature_blocks as FeatureBlocks);
        } else {
          // Fallback para default se não existir
          setFeatureBlocks(DEFAULT_FEATURE_BLOCKS);
        }
      } catch (err) {
        console.error("Error fetching feature blocks:", err);
        setFeatureBlocks(DEFAULT_FEATURE_BLOCKS);
      } finally {
        setLoading(false);
      }
    }

    fetchBlocks();
  }, [user]);

  const isBlocked = (featureKey: string): boolean => {
    // Se o plano expirou, verificar se a feature está explicitamente desbloqueada (false)
    if (planExpired && featureKey !== "admin") {
      // Se a feature está explicitamente desbloqueada (false), respeitar isso
      if (featureBlocks[featureKey] === false) {
        return false;
      }
      // Caso contrário, bloquear
      return true;
    }
    
    return featureBlocks[featureKey] === true;
  };

  // Converter para formato antigo (array) para compatibilidade
  const blocks = Object.entries(featureBlocks).map(([feature_key, blocked]) => ({
    feature_key,
    blocked,
  }));

  return { blocks, loading, isBlocked, planExpired, featureBlocks };
}
