// Single source of truth for plan → feature blocks mapping.
// Mirror of src/hooks/useFeatureBlocks.tsx PLAN_MODULES.
// Update both files together.

export const ALL_FEATURES = [
  "dashboard",
  "agenda",
  "crm",
  "clientes",
  "orcamentos",
  "servicos",
  "contratos",
  "assinatura-digital",
  "financeiro",
  "historico",
  "precificacao",
  "checklist",
  "mapeamento-palco",
  "equipe",
  "metas",
  "repertorio",
  "aulas",
  "avancos",
  "tutoriais",
  "configuracoes",
  "link-agenda",
  "link-instagram",
  "link-orcamento",
  "bonus",
  "ideias-post",
  "metas-anuais",
  "backs-radar",
  "usuarios",
];

// Legacy plan (no longer sold, preserved for existing subscribers).
const STARTER_FEATURES = [
  "dashboard", "agenda", "financeiro", "precificacao", "avancos",
  "servicos", "tutoriais", "configuracoes",
];

const PROFISSIONAL_FEATURES = [
  "dashboard", "agenda", "clientes", "repertorio", "financeiro", "precificacao",
  "orcamentos", "servicos", "checklist", "crm", "link-instagram", "ideias-post",
  "avancos", "tutoriais", "configuracoes",
];

const EMPRESARIAL_FEATURES = [
  ...PROFISSIONAL_FEATURES,
  "equipe", "contratos", "assinatura-digital", "historico", "mapeamento-palco",
  "metas", "metas-anuais", "aulas", "link-agenda", "link-orcamento", "bonus",
];

const EXECUTIVO_FEATURES = [
  ...EMPRESARIAL_FEATURES,
  "backs-radar",
  "usuarios",
];


export const PLAN_FEATURES: Record<string, string[]> = {
  // Starter
  mensal_starter: STARTER_FEATURES,
  anual_starter: STARTER_FEATURES,
  // Parceiros (same features as Starter, activated by token)
  parceiros: STARTER_FEATURES,
  // Profissional
  mensal_profissional: PROFISSIONAL_FEATURES,
  anual_profissional: PROFISSIONAL_FEATURES,
  // Empresarial (and legacy "completo" alias)
  mensal_empresarial: EMPRESARIAL_FEATURES,
  anual_empresarial: EMPRESARIAL_FEATURES,
  mensal_completo: EMPRESARIAL_FEATURES,
  anual_completo: EMPRESARIAL_FEATURES,
  // Executivo (tudo do Empresarial + Backs Radar)
  mensal_executivo: EXECUTIVO_FEATURES,
  anual_executivo: EXECUTIVO_FEATURES,
};

export const PLAN_DAYS: Record<string, number> = {
  mensal_starter: 30,
  mensal_profissional: 30,
  mensal_empresarial: 30,
  mensal_completo: 30,
  mensal_executivo: 30,
  anual_starter: 365,
  anual_profissional: 365,
  anual_empresarial: 365,
  anual_completo: 365,
  anual_executivo: 365,
};

export function buildFeatureBlocks(plan: string): Record<string, boolean> {
  const enabled = new Set(PLAN_FEATURES[plan] ?? []);
  const blocks: Record<string, boolean> = {};
  for (const feature of ALL_FEATURES) {
    blocks[feature] = !enabled.has(feature);
  }
  return blocks;
}

// Normaliza chaves legadas/variantes para o nome canônico usado no app.
const PLAN_CANONICAL: Record<string, string> = {
  mensal_empresarial: "mensal_completo",
  anual_empresarial: "anual_completo",
  empresarial: "mensal_completo",
  completo: "mensal_completo",
  executivo: "mensal_executivo",
};

export function canonicalPlan(plan: string): string {
  return PLAN_CANONICAL[plan] ?? plan;
}
