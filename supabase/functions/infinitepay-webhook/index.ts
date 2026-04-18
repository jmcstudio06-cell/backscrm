import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_MAP: Record<number, { plan: string; days: number }> = {
  1990: { plan: "mensal_starter", days: 30 },
  2490: { plan: "mensal_profissional", days: 30 },
  3990: { plan: "mensal_completo", days: 30 },
  14990: { plan: "anual_starter", days: 365 },
  19990: { plan: "anual_profissional", days: 365 },
  29880: { plan: "anual_completo", days: 365 },
};

const SUCCESSFUL_STATUSES = new Set([
  "paid",
  "approved",
  "completed",
  "success",
  "successful",
  "succeeded",
  "confirmed",
  "authorized",
  "settled",
]);

function findAmount(obj: unknown, depth = 0): number | null {
  if (depth > 6 || !obj) return null;

  if (typeof obj === "object" && obj !== null) {
    const amountKeys = ["amount", "total", "value", "total_amount", "price", "payment_amount", "paid_amount"];

    for (const key of amountKeys) {
      const val = (obj as Record<string, unknown>)[key];
      if (val !== undefined && val !== null) {
        const num = typeof val === "string" ? parseFloat(val) : Number(val);
        if (!Number.isNaN(num) && num > 0) return num;
      }
    }

    for (const val of Object.values(obj as Record<string, unknown>)) {
      const found = findAmount(val, depth + 1);
      if (found !== null) return found;
    }
  }

  return null;
}

function findStringByKeys(obj: unknown, keys: string[], depth = 0): string | null {
  if (depth > 6 || !obj || typeof obj !== "object") return null;

  const record = obj as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (keys.includes(key.toLowerCase()) && typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  for (const value of Object.values(record)) {
    const found = findStringByKeys(value, keys, depth + 1);
    if (found) return found;
  }

  return null;
}

function normalizeEmail(email: string | null): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return normalized || null;
}

function normalizeStatus(status: string | null): string | null {
  if (!status) return null;
  return status.trim().toLowerCase().replace(/\s+/g, "_");
}

function resolvePlan(rawAmount: number | null): { plan: string; days: number } | null {
  if (rawAmount === null) return null;

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
    "link-agenda",
  ];

  const planFeatures: Record<string, string[]> = {
    mensal_starter: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "servicos", "tutoriais", "configuracoes"],
    anual_starter: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "servicos", "tutoriais", "configuracoes"],
    mensal_profissional: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "tutoriais", "configuracoes"],
    anual_profissional: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "tutoriais", "configuracoes"],
    mensal_empresarial: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "contratos", "historico", "mapeamento-palco", "metas", "aulas", "link-agenda", "tutoriais", "configuracoes"],
    anual_empresarial: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "contratos", "historico", "mapeamento-palco", "metas", "aulas", "link-agenda", "tutoriais", "configuracoes"],
    // Legacy compatibility
    mensal_completo: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "contratos", "historico", "mapeamento-palco", "metas", "aulas", "link-agenda", "tutoriais", "configuracoes"],
    anual_completo: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "contratos", "historico", "mapeamento-palco", "metas", "aulas", "link-agenda", "tutoriais", "configuracoes"],
  };

  const enabled = new Set(planFeatures[plan] ?? []);
  const blocks: Record<string, boolean> = {};

  for (const feature of allFeatures) {
    blocks[feature] = !enabled.has(feature);
  }

  return blocks;
}

async function matchPendingPayment(
  supabase: ReturnType<typeof createClient>,
  options: {
    payerEmail: string | null;
    amountCents: number | null;
    resolvedPlan: { plan: string; days: number } | null;
  },
): Promise<Record<string, unknown> | null> {
  const { payerEmail, amountCents, resolvedPlan } = options;

  if (payerEmail) {
    const { data: matchedProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email")
      .ilike("email", payerEmail)
      .limit(2);

    if (profileError) {
      console.error("❌ Error querying profiles by email:", profileError);
    }

    if (matchedProfiles && matchedProfiles.length === 1) {
      const userId = matchedProfiles[0].user_id;

      if (amountCents !== null) {
        const { data: byUserAndAmount, error: byUserAndAmountError } = await supabase
          .from("pending_payments")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "pending")
          .eq("amount_cents", amountCents)
          .order("created_at", { ascending: false })
          .limit(5);

        if (byUserAndAmountError) {
          console.error("❌ Error querying pending_payments by user + amount:", byUserAndAmountError);
        }

        if (byUserAndAmount && byUserAndAmount.length > 0) {
          console.log(`ℹ️ Matched pending payment by payer email + amount for ${payerEmail}`);
          return byUserAndAmount[0] as Record<string, unknown>;
        }
      }

      if (resolvedPlan?.plan) {
        const { data: byUserAndPlan, error: byUserAndPlanError } = await supabase
          .from("pending_payments")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "pending")
          .eq("plan_key", resolvedPlan.plan)
          .order("created_at", { ascending: false })
          .limit(5);

        if (byUserAndPlanError) {
          console.error("❌ Error querying pending_payments by user + plan:", byUserAndPlanError);
        }

        if (byUserAndPlan && byUserAndPlan.length > 0) {
          console.log(`ℹ️ Matched pending payment by payer email + plan for ${payerEmail}`);
          return byUserAndPlan[0] as Record<string, unknown>;
        }
      }

      const { data: recentUserPendings, error: recentUserPendingsError } = await supabase
        .from("pending_payments")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "pending")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(2);

      if (recentUserPendingsError) {
        console.error("❌ Error querying recent pending_payments by user:", recentUserPendingsError);
      }

      if (recentUserPendings && recentUserPendings.length === 1) {
        console.log(`ℹ️ Matched single recent pending payment for ${payerEmail}`);
        return recentUserPendings[0] as Record<string, unknown>;
      }

      if (recentUserPendings && recentUserPendings.length > 1) {
        console.warn(`⚠️ Multiple recent pending payments for payer email ${payerEmail}; skipping ambiguous activation`);
      }
    }
  }

  if (amountCents !== null) {
    const { data: byAmount, error: byAmountError } = await supabase
      .from("pending_payments")
      .select("*")
      .eq("amount_cents", amountCents)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(2);

    if (byAmountError) {
      console.error("❌ Error querying pending_payments by amount:", byAmountError);
    }

    if (byAmount && byAmount.length === 1) {
      console.log(`ℹ️ Matched a unique pending payment by amount=${amountCents}`);
      return byAmount[0] as Record<string, unknown>;
    }

    if (byAmount && byAmount.length > 1) {
      console.warn(`⚠️ Multiple pending payments found for amount=${amountCents}; refusing ambiguous activation`);
    }
  }

  if (resolvedPlan?.plan) {
    const { data: recentPlanMatches, error: planError } = await supabase
      .from("pending_payments")
      .select("*")
      .eq("plan_key", resolvedPlan.plan)
      .eq("status", "pending")
      .gte("created_at", new Date(Date.now() - 20 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(2);

    if (planError) {
      console.error("❌ Error querying pending_payments by plan:", planError);
    }

    if (recentPlanMatches && recentPlanMatches.length === 1) {
      console.log(`ℹ️ Matched a unique recent pending payment by plan_key=${resolvedPlan.plan}`);
      return recentPlanMatches[0] as Record<string, unknown>;
    }

    if (recentPlanMatches && recentPlanMatches.length > 1) {
      console.warn(`⚠️ Multiple recent pending payments for plan_key=${resolvedPlan.plan}; refusing ambiguous activation`);
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};
    const eventType = req.headers.get("event")?.toLowerCase() ?? null;
    const rawStatus = findStringByKeys(body, ["status", "payment_status", "paymentstatus", "current_status", "payment_state"]);
    const normalizedStatus = normalizeStatus(rawStatus);
    const rawAmount = findAmount(body);
    const amountCents = rawAmount === null ? null : Math.round(resolvePlan(rawAmount) ? Math.round(rawAmount * (rawAmount < 100 ? 100 : 1)) : Math.round(rawAmount));
    const payerEmail = normalizeEmail(findStringByKeys(body, ["email", "customer_email", "payer_email", "client_email", "buyer_email"]));
    const resolved = resolvePlan(rawAmount);

    console.log("📩 InfinitePay webhook received", {
      eventType,
      status: normalizedStatus,
      payerEmail,
      rawAmount,
      amountCents,
    });

    if (normalizedStatus && !SUCCESSFUL_STATUSES.has(normalizedStatus)) {
      console.log(`ℹ️ Ignoring webhook with non-final status: ${normalizedStatus}`);
      return new Response(JSON.stringify({ ok: true, ignored: true, reason: "non_final_status" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const pendingPayment = await matchPendingPayment(supabase, {
      payerEmail,
      amountCents,
      resolvedPlan: resolved,
    });

    if (!pendingPayment) {
      console.warn("⚠️ No unambiguous pending payment found for this webhook", {
        payerEmail,
        amountCents,
        plan: resolved?.plan ?? null,
      });
      return new Response(JSON.stringify({ ok: true, message: "no unambiguous pending payment found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planName = resolved?.plan || String(pendingPayment.plan_key ?? "mensal_starter");
    const planDays = resolved?.days || 30;
    const featureBlocks = buildFeatureBlocks(planName);

    console.log(`✅ Matched pending payment: user_id=${pendingPayment.user_id}, plan=${planName}, days=${planDays}`);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: planName,
        trial_start: new Date().toISOString(),
        trial_days: planDays,
        feature_blocks: featureBlocks,
      })
      .eq("user_id", String(pendingPayment.user_id));

    if (updateError) {
      console.error("❌ Error updating profile:", updateError);
      return new Response(JSON.stringify({ error: "failed to update plan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: activateError } = await supabase
      .from("pending_payments")
      .update({ status: "activated", activated_at: new Date().toISOString() })
      .eq("id", String(pendingPayment.id));

    if (activateError) {
      console.error("❌ Error activating pending payment:", activateError);
      return new Response(JSON.stringify({ error: "failed to activate pending payment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
