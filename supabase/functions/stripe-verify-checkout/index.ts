import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { PLAN_DAYS, buildFeatureBlocks } from "../_shared/plan-features.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRICE_TO_PLAN: Record<string, string> = {
  price_1TTt9yRrEj00ctsSg5AEk1hg: "mensal_starter",
  price_1TTtAFRrEj00ctsSIrqcEujm: "mensal_profissional",
  price_1TTtAbRrEj00ctsSsiyrelmc: "mensal_empresarial",
  price_1TTtAsRrEj00ctsSiL88sr6C: "anual_starter",
  price_1TTtBARrEj00ctsSoql8QAii: "anual_profissional",
  price_1TTtBVRrEj00ctsSwaml715T: "anual_empresarial",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } }
    );
    const { data: u } = await userClient.auth.getUser();
    const user = u?.user;
    if (!user?.email) {
      return new Response(JSON.stringify({ activated: false, reason: "no_user" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile } = await admin
      .from("profiles")
      .select("user_id, email, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id as string | null;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = customers.data[0]?.id ?? null;
    }
    if (!customerId) {
      return new Response(JSON.stringify({ activated: false, reason: "no_customer" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5,
    });

    // Pick the most recent active/trialing subscription
    const active = subs.data
      .filter((s) => s.status === "active" || s.status === "trialing")
      .sort((a, b) => (b.current_period_end || 0) - (a.current_period_end || 0))[0];

    if (!active) {
      return new Response(JSON.stringify({ activated: false, reason: "no_active_subscription" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const priceId = active.items.data[0]?.price.id;
    const planKey =
      (active.metadata?.plan_key as string) ||
      (priceId ? PRICE_TO_PLAN[priceId] : null);
    if (!planKey) {
      return new Response(JSON.stringify({ activated: false, reason: "unknown_plan" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const planDays = PLAN_DAYS[planKey] || 30;
    const featureBlocks = buildFeatureBlocks(planKey);

    await admin
      .from("profiles")
      .update({
        plan: planKey,
        trial_start: new Date().toISOString(),
        trial_days: planDays,
        feature_blocks: featureBlocks,
        stripe_customer_id: customerId,
        stripe_subscription_id: active.id,
        subscription_status: "active",
        current_period_end: active.current_period_end
          ? new Date(active.current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: active.cancel_at_period_end,
      })
      .eq("user_id", user.id);

    // Mark a pending_payment as approved so the celebration modal fires
    await admin
      .from("pending_payments")
      .update({ status: "approved", activated_at: new Date().toISOString(), gateway_event_id: active.id })
      .eq("user_id", user.id)
      .eq("plan_key", planKey)
      .eq("status", "pending");

    return new Response(JSON.stringify({ activated: true, plan: planKey }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[stripe-verify-checkout]", err);
    return new Response(
      JSON.stringify({ activated: false, error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
