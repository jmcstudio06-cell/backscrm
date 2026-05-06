import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Map planKey -> Stripe price_id
const PRICE_MAP: Record<string, string> = {
  mensal_starter: "price_1TTt9yRrEj00ctsSg5AEk1hg",
  mensal_profissional: "price_1TTtAFRrEj00ctsSIrqcEujm",
  mensal_empresarial: "price_1TTtAbRrEj00ctsSsiyrelmc",
  anual_starter: "price_1TTtAsRrEj00ctsSiL88sr6C",
  anual_profissional: "price_1TTtBARrEj00ctsSoql8QAii",
  anual_empresarial: "price_1TTtBVRrEj00ctsSwaml715T",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseClient.auth.getUser(token);
    if (userErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const { planKey } = await req.json();
    const priceId = PRICE_MAP[planKey];
    if (!priceId) throw new Error(`Unknown planKey: ${planKey}`);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find existing Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const c = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = c.id;
    }

    const origin = req.headers.get("origin") || "https://backstagepro.online";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/planos?checkout=cancelled`,
      metadata: { user_id: user.id, plan_key: planKey },
      subscription_data: {
        metadata: { user_id: user.id, plan_key: planKey },
      },
      allow_promotion_codes: true,
    });

    // Persist customer id early
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    await adminClient
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-create-checkout]", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
