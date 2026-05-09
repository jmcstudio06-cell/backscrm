import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PLAN_DAYS, buildFeatureBlocks } from "../_shared/plan-features.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

function normalizeStatus(status: string | null): string | null {
  if (!status) return null;
  return status.toLowerCase().trim().replace(/\s+/g, "_");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();

    const status = normalizeStatus(
      body?.status || body?.payment_status || body?.data?.status || body?.transaction?.status || null,
    );

    // Suporte a múltiplos formatos de metadata da InfinitePay
    const metadata =
      body?.metadata ||
      body?.data?.metadata ||
      body?.transaction?.metadata ||
      {};

    // external_reference / order_nsu podem vir no formato "userId:planKey"
    const externalRef: string | null =
      body?.external_reference ||
      body?.order_nsu ||
      body?.data?.external_reference ||
      body?.transaction?.external_reference ||
      null;

    let userId: string | null = metadata?.user_id || metadata?.userId || null;
    let planName: string | null = metadata?.plan || metadata?.plan_key || null;

    if ((!userId || !planName) && externalRef && externalRef.includes(":")) {
      const [extUser, extPlan] = externalRef.split(":");
      if (!userId) userId = extUser || null;
      if (!planName) planName = extPlan || null;
    }

    const gatewayEventId =
      body?.id || body?.event_id || body?.data?.id || body?.transaction?.id || null;

    const payerEmail = body?.customer?.email || body?.payer?.email || body?.email || null;

    console.log("Webhook recebido:", {
      status,
      userId,
      planName,
      gatewayEventId,
      payerEmail,
      externalRef,
    });

    // Tenta localizar pending_payment correspondente (por gateway_event_id ou por user+plan mais recente)
    let pendingPaymentId: string | null = null;
    if (gatewayEventId) {
      const { data: byEvent } = await supabase
        .from("pending_payments")
        .select("id, user_id, plan_key")
        .eq("gateway_event_id", gatewayEventId)
        .maybeSingle();
      if (byEvent) {
        pendingPaymentId = byEvent.id;
        if (!userId) userId = byEvent.user_id;
        if (!planName) planName = byEvent.plan_key;
      }
    }
    // Fallback by payer email -> most recent pending payment
    if (!userId && payerEmail) {
      const { data: byEmail } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", payerEmail)
        .maybeSingle();
      if (byEmail?.user_id) userId = byEmail.user_id;
    }
    if (!pendingPaymentId && userId) {
      const query = supabase
        .from("pending_payments")
        .select("id, plan_key")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);
      const { data: byUser } = await query.maybeSingle();
      if (byUser) {
        pendingPaymentId = byUser.id;
        if (!planName) planName = byUser.plan_key;
      }
    }

    if (!status || !SUCCESSFUL_STATUSES.has(status)) {
      // Salva status no pending_payment se encontrado, para auditoria
      if (pendingPaymentId && status) {
        await supabase
          .from("pending_payments")
          .update({ gateway_status: status, gateway_event_id: gatewayEventId, provider_payload: body })
          .eq("id", pendingPaymentId);
      }
      return new Response(
        JSON.stringify({ success: true, ignored: true, reason: "status_not_paid", status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!userId || !planName) {
      console.error("Webhook sem user_id/plan identificáveis", body);
      return new Response(
        JSON.stringify({ success: false, error: "metadata missing user_id or plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const planDays = PLAN_DAYS[planName] || 30;
    const featureBlocks = buildFeatureBlocks(planName);

    const { error } = await supabase
      .from("profiles")
      .update({
        plan: planName,
        trial_start: new Date().toISOString(),
        trial_days: planDays,
        feature_blocks: featureBlocks,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao atualizar plano:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Marca pending_payment como ativado
    if (pendingPaymentId) {
      await supabase
        .from("pending_payments")
        .update({
          status: "approved",
          gateway_status: status,
          gateway_event_id: gatewayEventId,
          activated_at: new Date().toISOString(),
          provider_payload: body,
          payer_email: payerEmail,
        })
        .eq("id", pendingPaymentId);
    }

    console.log("Plano ativado com sucesso", { userId, planName, pendingPaymentId });

    return new Response(
      JSON.stringify({ success: true, activated: true, plan: planName }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Erro no webhook:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
