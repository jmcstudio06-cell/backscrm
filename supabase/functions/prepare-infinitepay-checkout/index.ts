import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INFINITEPAY_HANDLE = "backstageprooficial";
const APP_URL = "https://backstagepro.online";

const PLAN_CONFIG: Record<string, { checkoutUrl: string; amountCents: number; label: string }> = {
  mensal_starter: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/TBD", amountCents: 1990, label: "Backstage PRO - Plano Starter Mensal" },
  mensal_profissional: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/wKsewawhB0", amountCents: 2490, label: "Backstage PRO - Mensal Profissional" },
  mensal_completo: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/9Rl7ZYHpL5", amountCents: 3990, label: "Backstage PRO - Mensal Completo" },
  mensal_empresarial: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/yZ1C3ji4X4", amountCents: 7990, label: "Backstage PRO - Mensal Empresarial" },
  mensal_executivo: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/yZ1C3ji4X4", amountCents: 7990, label: "Backstage PRO - Mensal Empresarial" },
  anual_starter: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/TBD", amountCents: 14990, label: "Backstage PRO - Starter Anual" },
  anual_profissional: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/8EfYDXAHYO", amountCents: 19990, label: "Backstage PRO - Anual Profissional" },
  anual_completo: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/DfDpwY8AAs", amountCents: 29980, label: "Backstage PRO - Anual Completo" },
  anual_empresarial: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/xkRACK3A9V", amountCents: 49990, label: "Backstage PRO - Anual Empresarial" },
  anual_executivo: { checkoutUrl: "https://checkout.infinitepay.io/backstageprooficial/xkRACK3A9V", amountCents: 49990, label: "Backstage PRO - Anual Empresarial" },
};

function planTier(planKey: string | null | undefined): number {
  if (!planKey) return 0;
  if (planKey.includes("executivo")) return 3;
  if (planKey.includes("empresarial") || planKey.includes("completo")) return 2;
  if (planKey.includes("profissional")) return 1;
  if (planKey.includes("starter")) return 0;
  return 0;
}


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

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("plan, last_paid_plan, feature_blocks")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const renewalPlan = profile?.plan === "comprou_expirado" ? profile.last_paid_plan : profile?.plan;
    if (planTier(planKey) < planTier(renewalPlan)) {
      return new Response(
        JSON.stringify({ error: "Não é possível renovar em um plano inferior ao já adquirido." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (planKey.startsWith("mensal_")) {
      const fb = (profile?.feature_blocks ?? {}) as Record<string, boolean>;
      if (fb.block_monthly_billing === true) {
        return new Response(
          JSON.stringify({ error: "Plano mensal indisponível para sua conta. Escolha um plano anual." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { error: cancelError } = await adminClient
      .from("pending_payments")
      .update({ status: "cancelled" })
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (cancelError) {
      throw cancelError;
    }

    const { data: pending, error: insertError } = await adminClient
      .from("pending_payments")
      .insert({
        user_id: user.id,
        plan_key: planKey,
        amount_cents: plan.amountCents,
      })
      .select("id")
      .single();

    if (insertError || !pending) {
      throw insertError ?? new Error("Não foi possível registrar o pagamento");
    }

    // Gera um link de checkout dinâmico para que a InfinitePay possa notificar
    // nosso webhook (order_nsu = id do pending_payment) e liberar o plano na hora.
    let checkoutUrl = plan.checkoutUrl;
    try {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("name, email, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      const linkResponse = await fetch("https://api.checkout.infinitepay.io/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: INFINITEPAY_HANDLE,
          items: [{ quantity: 1, price: plan.amountCents, description: plan.label }],
          order_nsu: pending.id,
          webhook_url: `${supabaseUrl}/functions/v1/infinitepay-webhook`,
          redirect_url: `${APP_URL}/planos?pagamento=sucesso`,
          customer: {
            name: profile?.name || undefined,
            email: profile?.email || user.email || undefined,
            phone_number: profile?.phone || undefined,
          },
        }),
      });

      const linkJson = await linkResponse.json().catch(() => null);
      if (linkResponse.ok && typeof linkJson?.url === "string") {
        checkoutUrl = linkJson.url;
        await adminClient
          .from("pending_payments")
          .update({ provider_payload: { checkout_url: checkoutUrl, order_nsu: pending.id } })
          .eq("id", pending.id);
      } else {
        console.error("Falha ao criar link InfinitePay, usando link fixo:", linkResponse.status, linkJson);
      }
    } catch (linkError) {
      console.error("Erro ao criar link InfinitePay, usando link fixo:", linkError);
    }

    return new Response(JSON.stringify({ checkout_url: checkoutUrl, payment_id: pending.id }), {
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