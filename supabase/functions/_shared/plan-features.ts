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
  "bonus",
  "ideias-post",
  "metas-anuais",
];

const STARTER_FEATURES = [
  "dashboard", "agenda", "financeiro", "precificacao", "avancos",
  "servicos", "tutoriais", "configuracoes",
];

const PROFISSIONAL_FEATURES = [
  ...STARTER_FEATURES,
  "clientes", "repertorio", "crm", "orcamentos", "checklist",
  "equipe", "link-instagram", "ideias-post",
];

const EMPRESARIAL_FEATURES = [
  ...PROFISSIONAL_FEATURES,
  "contratos", "historico", "mapeamento-palco", "metas", "aulas",
  "link-agenda", "bonus", "ideias-post", "metas-anuais",
];

export const PLAN_FEATURES: Record<string, string[]> = {
  // Starter
  mensal_starter: STARTER_FEATURES,
  anual_starter: STARTER_FEATURES,
  // Profissional
  mensal_profissional: PROFISSIONAL_FEATURES,
  anual_profissional: PROFISSIONAL_FEATURES,
  // Empresarial (and legacy "completo" alias)
  mensal_empresarial: EMPRESARIAL_FEATURES,
  anual_empresarial: EMPRESARIAL_FEATURES,
  mensal_completo: EMPRESARIAL_FEATURES,
  anual_completo: EMPRESARIAL_FEATURES,
};

export const PLAN_DAYS: Record<string, number> = {
  mensal_starter: 30,
  mensal_profissional: 30,
  mensal_empresarial: 30,
  mensal_completo: 30,
  anual_starter: 365,
  anual_profissional: 365,
  anual_empresarial: 365,
  anual_completo: 365,
};

export function buildFeatureBlocks(plan: string): Record<string, boolean> {
  const enabled = new Set(PLAN_FEATURES[plan] ?? []);
  const blocks: Record<string, boolean> = {};
  for (const feature of ALL_FEATURES) {
    blocks[feature] = !enabled.has(feature);
  }
  return blocks;
}
