import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_DETAILS: Record<string, { title: string; price: number; days: number }> = {
  mensal_starter: { title: "Backstage Starter - Mensal", price: 19.90, days: 30 },
  mensal_profissional: { title: "Backstage Profissional - Mensal", price: 24.90, days: 30 },
  mensal_completo: { title: "Backstage Empresarial - Mensal", price: 39.90, days: 30 },
  mensal_executivo: { title: "Backstage Executivo - Mensal", price: 79.90, days: 30 },
  anual_starter: { title: "Backstage Starter - Anual", price: 149.90, days: 365 },
  anual_profissional: { title: "Backstage Profissional - Anual", price: 199.90, days: 365 },
  anual_completo: { title: "Backstage Empresarial - Anual", price: 298.80, days: 365 },
  anual_executivo: { title: "Backstage Executivo - Anual", price: 499.90, days: 365 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    // Get auth token from request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { plan_key } = await req.json();
    const planInfo = PLAN_DETAILS[plan_key];
    if (!planInfo) {
      return new Response(JSON.stringify({ error: "Plano inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cancel previous pending payments
    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    await adminSupabase
      .from("pending_payments")
      .update({ status: "cancelled" })
      .eq("user_id", user.id)
      .eq("status", "pending");

    // Create pending payment
    const amountCents = Math.round(planInfo.price * 100);
    const { error: insertError } = await adminSupabase
      .from("pending_payments")
      .insert({
        user_id: user.id,
        plan_key: plan_key,
        amount_cents: amountCents,
      });

    if (insertError) {
      console.error("Error creating pending payment:", insertError);
      throw new Error("Erro ao criar pagamento pendente");
    }

    // Get base URL for callbacks
    const origin = req.headers.get("origin") || "https://backstagepro.lovable.app";

    // Create Mercado Pago preference
    const preferenceBody = {
      items: [
        {
          title: planInfo.title,
          quantity: 1,
          unit_price: planInfo.price,
          currency_id: "BRL",
        },
      ],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${origin}/planos?status=success`,
        failure: `${origin}/planos?status=failure`,
        pending: `${origin}/planos?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
      external_reference: `${user.id}|${plan_key}`,
      statement_descriptor: "BACKSTAGE PRO",
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify(preferenceBody),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.text();
      console.error("Mercado Pago API error:", mpError);
      throw new Error(`Erro ao criar preferência: ${mpResponse.status}`);
    }

    const mpData = await mpResponse.json();

    console.log(`✅ Preference created for user ${user.id}, plan ${plan_key}, preference_id: ${mpData.id}`);

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        preference_id: mpData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Error in mercadopago-create-preference:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
