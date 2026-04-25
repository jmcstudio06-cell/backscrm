import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const PLAN_DAYS: Record<string, number> = {
  mensal_starter: 30,
  mensal_profissional: 30,
  mensal_completo: 30,
  anual_starter: 365,
  anual_profissional: 365,
  anual_completo: 365,
};

function normalizeStatus(status: string | null): string | null {
  if (!status) return null;
  return status.toLowerCase().trim().replace(/\s+/g, "_");
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
    mensal_starter: ["dashboard", "agenda", "financeiro", "precificacao", "servicos", "tutoriais", "configuracoes"],
    mensal_profissional: [
      "dashboard",
      "agenda",
      "financeiro",
      "clientes",
      "crm",
      "orcamentos",
      "repertorio",
      "checklist",
      "equipe",
      "servicos",
      "tutoriais",
      "configuracoes",
    ],
    mensal_completo: allFeatures,
    anual_starter: ["dashboard", "agenda", "financeiro", "precificacao", "servicos", "tutoriais", "configuracoes"],
    anual_profissional: [
      "dashboard",
      "agenda",
      "financeiro",
      "clientes",
      "crm",
      "orcamentos",
      "repertorio",
      "checklist",
      "equipe",
      "servicos",
      "tutoriais",
      "configuracoes",
    ],
    anual_completo: allFeatures,
  };

  const enabled = new Set(planFeatures[plan] || []);
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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();

    const status = normalizeStatus(body?.status || body?.payment_status || body?.data?.status || null);

    const metadata = body?.metadata || body?.data?.metadata || {};
    const userId = metadata?.user_id || null;
    const planName = metadata?.plan || null;

    const gatewayEventId = body?.id || body?.event_id || body?.data?.id || null;

    const payerEmail = body?.customer?.email || body?.payer?.email || body?.email || null;

    console.log("Webhook recebido:", {
      status,
      userId,
      planName,
      gatewayEventId,
      payerEmail,
    });

    if (!status || !SUCCESSFUL_STATUSES.has(status)) {
      return new Response(
        JSON.stringify({
          success: true,
          ignored: true,
          reason: "status_not_paid",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!userId || !planName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "metadata missing user_id or plan",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
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
        JSON.stringify({
          success: false,
          error: error.message,
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

    console.log("Plano ativado com sucesso");

    return new Response(
      JSON.stringify({
        success: true,
        activated: true,
        plan: planName,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
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
