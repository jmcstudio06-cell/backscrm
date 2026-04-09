import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUCCESSFUL_STATUSES = new Set(["approved", "authorized"]);

function buildFeatureBlocks(plan: string): Record<string, boolean> {
  const allFeatures = [
    "dashboard", "agenda", "crm", "clientes", "orcamentos", "servicos",
    "contratos", "financeiro", "historico", "precificacao", "checklist",
    "mapeamento-palco", "equipe", "metas", "repertorio", "aulas",
    "avancos", "tutoriais", "configuracoes", "link-agenda",
  ];

  const planFeatures: Record<string, string[]> = {
    mensal_starter: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "servicos", "tutoriais", "configuracoes"],
    anual_starter: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "servicos", "tutoriais", "configuracoes"],
    mensal_profissional: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "tutoriais", "configuracoes"],
    anual_profissional: ["dashboard", "agenda", "financeiro", "precificacao", "avancos", "clientes", "repertorio", "crm", "orcamentos", "servicos", "checklist", "equipe", "tutoriais", "configuracoes"],
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

    if (!supabaseUrl || !supabaseServiceRoleKey || !mpAccessToken) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Mercado Pago sends notifications as query params or body
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const rawBody = await req.text();
    let body: Record<string, unknown> = {};
    
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      // Query param based notification
    }

    const dataId = url.searchParams.get("id") || String(body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>).id : body.id || "");
    const notificationType = String(body.type || topic || "");

    console.log("📩 Mercado Pago webhook received", { topic: notificationType, dataId });

    // We only care about payment notifications
    if (notificationType !== "payment" && notificationType !== "merchant_order") {
      console.log(`ℹ️ Ignoring notification type: ${notificationType}`);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!dataId) {
      console.warn("⚠️ No data ID in webhook");
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch payment details from Mercado Pago API
    let paymentData: Record<string, unknown> | null = null;

    if (notificationType === "payment") {
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: { Authorization: `Bearer ${mpAccessToken}` },
      });
      if (!paymentRes.ok) {
        console.error(`Failed to fetch payment ${dataId}: ${paymentRes.status}`);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      paymentData = await paymentRes.json();
    } else if (notificationType === "merchant_order") {
      // Fetch merchant order, then get the payment
      const orderRes = await fetch(`https://api.mercadopago.com/merchant_orders/${dataId}`, {
        headers: { Authorization: `Bearer ${mpAccessToken}` },
      });
      if (!orderRes.ok) {
        console.error(`Failed to fetch merchant_order ${dataId}: ${orderRes.status}`);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const orderData = await orderRes.json();
      const payments = orderData.payments as Array<Record<string, unknown>> || [];
      const approvedPayment = payments.find((p: Record<string, unknown>) => p.status === "approved");
      if (!approvedPayment) {
        console.log("ℹ️ Merchant order has no approved payment yet");
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Fetch full payment details
      const pRes = await fetch(`https://api.mercadopago.com/v1/payments/${approvedPayment.id}`, {
        headers: { Authorization: `Bearer ${mpAccessToken}` },
      });
      if (!pRes.ok) {
        console.error(`Failed to fetch payment from order: ${pRes.status}`);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      paymentData = await pRes.json();
    }

    if (!paymentData) {
      console.warn("⚠️ Could not resolve payment data");
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const paymentStatus = String(paymentData.status || "").toLowerCase();
    console.log(`📋 Payment status: ${paymentStatus}, amount: ${paymentData.transaction_amount}, external_ref: ${paymentData.external_reference}`);

    if (!SUCCESSFUL_STATUSES.has(paymentStatus)) {
      console.log(`ℹ️ Ignoring non-approved payment status: ${paymentStatus}`);
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse external_reference: "user_id|plan_key"
    const externalRef = String(paymentData.external_reference || "");
    const [userId, planKey] = externalRef.split("|");

    if (!userId || !planKey) {
      console.warn("⚠️ Invalid external_reference:", externalRef);
      return new Response(JSON.stringify({ ok: true, error: "invalid external_reference" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine plan days
    const planDays = planKey.startsWith("anual_") ? 365 : 30;
    const featureBlocks = buildFeatureBlocks(planKey);

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: planKey,
        trial_start: new Date().toISOString(),
        trial_days: planDays,
        feature_blocks: featureBlocks,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("❌ Error updating profile:", updateError);
      return new Response(JSON.stringify({ error: "failed to update plan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark pending payment as activated
    const { error: activateError } = await supabase
      .from("pending_payments")
      .update({ status: "activated", activated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "pending")
      .eq("plan_key", planKey);

    if (activateError) {
      console.error("❌ Error activating pending payment:", activateError);
    }

    console.log(`🎉 Plan activated via Mercado Pago: ${planKey} for user ${userId}`);

    return new Response(JSON.stringify({ success: true, plan: planKey }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in mercadopago-webhook:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
