import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_CONFIG: Record<string, { checkoutUrl: string; amountCents: number }> = {
  mensal_starter: { checkoutUrl: "https://checkout.infinitepay.io/backstagegroup/P0yN0olhgx", amountCents: 1990 },
  mensal_profissional: { checkoutUrl: "https://checkout.infinitepay.io/backstagegroup/EifAfu4uuy", amountCents: 2490 },
  mensal_completo: { checkoutUrl: "https://checkout.infinitepay.io/backstagegroup/J4gnp5lYZc", amountCents: 3990 },
  mensal_empresarial: { checkoutUrl: "https://checkout.infinitepay.io/backstagegroup/J4gnp5lYZc", amountCents: 3990 },
  anual_starter: { checkoutUrl: "https://checkout.infinitepay.io/backstagegroup/UYl1zv1xVG", amountCents: 14990 },
  anual_profissional: { checkoutUrl: "https://checkout.infinitepay.io/backstagegroup/ojwFGTKs27", amountCents: 19990 },
  anual_completo: { checkoutUrl: "https://checkout.infinitepay.io/backstagegroup/r675HtWY5A", amountCents: 29880 },
  anual_empresarial: { checkoutUrl: "https://checkout.infinitepay.io/backstagegroup/r675HtWY5A", amountCents: 29880 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error("Missing backend configuration");
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const planKey = typeof body?.plan_key === "string" ? body.plan_key : "";
    const plan = PLAN_CONFIG[planKey];

    if (!plan) {
      return new Response(JSON.stringify({ error: "Plano inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { error: cancelError } = await adminClient
      .from("pending_payments")
      .update({ status: "cancelled" })
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (cancelError) {
      throw cancelError;
    }

    const { error: insertError } = await adminClient.from("pending_payments").insert({
      user_id: user.id,
      plan_key: planKey,
      amount_cents: plan.amountCents,
    });

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ checkout_url: plan.checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Error in prepare-infinitepay-checkout:", error);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});