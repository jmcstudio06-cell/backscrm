export interface CheckoutPlan {
  amountCents: number;
  label: string;
}

// Legacy "completo" keys identify the same tier as Empresarial.
export const PLAN_CONFIG: Record<string, CheckoutPlan> = {
  // Starter — volta a ser vendido a R$ 19,90/mês
  mensal_starter:      { amountCents: 1990,  label: "Backstage PRO - Starter Mensal" },
  mensal_profissional: { amountCents: 2490,  label: "Backstage PRO - Profissional Mensal" },
  mensal_completo:     { amountCents: 3990,  label: "Backstage PRO - Empresarial Mensal" },
  mensal_empresarial:  { amountCents: 3990,  label: "Backstage PRO - Empresarial Mensal" },
  // Executivo não é mais vendido; mantido apenas para renovações de assinantes atuais.
  mensal_executivo:    { amountCents: 7990,  label: "Backstage PRO - Executivo Mensal" },
  anual_starter:       { amountCents: 14990, label: "Backstage PRO - Starter Anual" },
  anual_profissional:  { amountCents: 19990, label: "Backstage PRO - Profissional Anual" },
  anual_completo:      { amountCents: 29880, label: "Backstage PRO - Empresarial Anual" },
  anual_empresarial:   { amountCents: 29880, label: "Backstage PRO - Empresarial Anual" },
  anual_executivo:     { amountCents: 49990, label: "Backstage PRO - Executivo Anual" },
};

export function getCheckoutPlan(planKey: string): CheckoutPlan | undefined {
  return Object.hasOwn(PLAN_CONFIG, planKey) ? PLAN_CONFIG[planKey] : undefined;
}