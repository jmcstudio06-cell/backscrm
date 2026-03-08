import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map payment amounts (in cents) to plan names and durations (days)
const PLAN_MAP: Record<number, { plan: string; days: number }> = {
  100:   { plan: "mensal_starter",       days: 30 },  // Teste R$1,00
  1990:  { plan: "mensal_starter",       days: 30 },
  2490:  { plan: "mensal_profissional",   days: 30 },
  3990:  { plan: "mensal_completo",       days: 30 },
  14990: { plan: "anual_starter",        days: 365 },
  19990: { plan: "anual_profissional",   days: 365 },
  29880: { plan: "anual_completo",       days: 365 },
};

// Deep-search for amount in nested objects
function findAmount(obj: unknown, depth = 0): number | null {
  if (depth > 5 || !obj) return null;
  if (typeof obj === "object" && obj !== null) {
    const amountKeys = ["amount", "total", "value", "total_amount", "price", "payment_amount"];
    for (const key of amountKeys) {
      const val = (obj as Record<string, unknown>)[key];
      if (val !== undefined && val !== null) {
        const num = typeof val === "string" ? parseFloat(val) : Number(val);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    for (const val of Object.values(obj as Record<string, unknown>)) {
      const found = findAmount(val, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// Try to resolve plan by amount in cents or reais
function resolvePlan(rawAmount: number): { plan: string; days: number } | null {
  const asCents = Math.round(rawAmount);
  if (PLAN_MAP[asCents]) return PLAN_MAP[asCents];
  const convertedCents = Math.round(rawAmount * 100);
  if (PLAN_MAP[convertedCents]) return PLAN_MAP[convertedCents];
  return null;
}


function buildFeatureBlocks(plan: string): Record<string, boolean> {
  const allFeatures = [
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
  ];

  const planFeatures: Record<string, string[]> = {
    mensal_starter: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "servicos", "tutoriais", "configuracoes"],
    anual_starter: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "servicos", "tutoriais", "configuracoes"],
    mensal_profissional: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "tutoriais", "configuracoes"],
    anual_profissional: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "tutoriais", "configuracoes"],
    mensal_completo: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "contratos", "historico", "mapeamento-palco", "metas", "aulas", "tutoriais", "configuracoes"],
    anual_completo: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "contratos", "historico", "mapeamento-palco", "metas", "aulas", "tutoriais", "configuracoes"],
  };

  const enabled = new Set(planFeatures[plan] ?? []);
  const blocks: Record<string, boolean> = {};

  for (const feature of allFeatures) {
    blocks[feature] = !enabled.has(feature);
  }

  return blocks;
}
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const body = await req.json();
    console.log("📩 InfinitePay webhook received:", JSON.stringify(body));

    const amount = findAmount(body);
    if (!amount) {
      console.error("❌ Could not find amount in webhook payload");
      return new Response(JSON.stringify({ error: "amount not found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountCents = Math.round(amount);
    console.log(`💰 Amount detected: ${amountCents} cents`);

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Find a pending payment matching this amount; fallback to plan key when using test checkout values
    let pendingPayment: Record<string, any> | null = null;

    const { data: paymentByAmount, error: pendingByAmountError } = await supabase
      .from("pending_payments")
      .select("*")
      .eq("amount_cents", amountCents)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (pendingByAmountError) {
      console.error("❌ Error querying pending_payments by amount:", pendingByAmountError);
    }

    pendingPayment = paymentByAmount as Record<string, any> | null;

    const resolved = resolvePlan(amountCents);

    if (!pendingPayment && resolved?.plan) {
      const { data: recentPlanMatches, error: pendingByPlanError } = await supabase
        .from("pending_payments")
        .select("*")
        .eq("plan_key", resolved.plan)
        .eq("status", "pending")
        .gte("created_at", new Date(Date.now() - 20 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(5);

      if (pendingByPlanError) {
        console.error("❌ Error querying pending_payments by plan:", pendingByPlanError);
      }

      if (recentPlanMatches && recentPlanMatches.length === 1) {
        pendingPayment = recentPlanMatches[0] as Record<string, any>;
        console.log(`ℹ️ Safe fallback match by plan_key=${resolved.plan} (single recent pending payment)`);
      } else if (recentPlanMatches && recentPlanMatches.length > 1) {
        console.warn(`⚠️ Multiple recent pending payments for plan_key=${resolved.plan}; skipping fallback to avoid wrong activation`);
      }
    }

    if (!pendingPayment) {
      console.warn(`⚠️ No pending payment found for amount: ${amountCents} cents — acknowledging to stop retries`);
      return new Response(JSON.stringify({ ok: true, message: "no pending payment found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the plan from PLAN_MAP or fallback to the pending payment's plan_key
    const planName = resolved?.plan || pendingPayment.plan_key;
    const planDays = resolved?.days || 30;

    console.log(`✅ Matched pending payment: user_id=${pendingPayment.user_id}, plan=${planName}, days=${planDays}`);

    const featureBlocks = buildFeatureBlocks(planName);

    // Update user profile with plan + feature access map
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: planName,
        trial_start: new Date().toISOString(),
        trial_days: planDays,
        feature_blocks: featureBlocks,
      })
      .eq("user_id", pendingPayment.user_id);

    if (updateError) {
      console.error("❌ Error updating profile:", updateError);
      return new Response(JSON.stringify({ error: "failed to update plan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark pending payment as activated
    await supabase
      .from("pending_payments")
      .update({ status: "activated", activated_at: new Date().toISOString() })
      .eq("id", pendingPayment.id);

    console.log(`🎉 Plan activated: ${planName} for user ${pendingPayment.user_id}`);

    return new Response(JSON.stringify({ success: true, plan: planName }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in infinitepay-webhook:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
