import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Map Stripe product IDs to plan keys (same as check-subscription)
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_UIKykSBOc4zLS4": "mensal_starter",
  "prod_UIKyyCWePFFbv2": "anual_starter",
  "prod_UIKybvA16WdTBg": "mensal_profissional",
  "prod_UIKzaOra1dvZVt": "anual_profissional",
  "prod_UIKznTT7EQaZYz": "mensal_completo",
  "prod_UIL0G1SmpP97WA": "anual_completo",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    console.error("[STRIPE-WEBHOOK] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] Signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  console.log(`[STRIPE-WEBHOOK] Received event: ${event.type}`);

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const customerEmail = session.customer_details?.email || session.customer_email;
        if (!customerEmail) {
          console.error("[STRIPE-WEBHOOK] No customer email in session");
          break;
        }

        // Get subscription details to find the product/plan
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const productId = subscription.items.data[0]?.price?.product as string;
        const planKey = PRODUCT_TO_PLAN[productId];

        if (!planKey) {
          console.error(`[STRIPE-WEBHOOK] Unknown product: ${productId}`);
          break;
        }

        const trialDays = planKey.startsWith("anual") ? 365 : 30;

        // Find user by email and update plan
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("email", customerEmail)
          .maybeSingle();

        if (profileError || !profile) {
          console.error(`[STRIPE-WEBHOOK] Profile not found for ${customerEmail}`, profileError);
          break;
        }

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            plan: planKey,
            trial_start: new Date().toISOString(),
            trial_days: trialDays,
          })
          .eq("user_id", profile.user_id);

        if (updateError) {
          console.error("[STRIPE-WEBHOOK] Failed to update profile:", updateError);
        } else {
          console.log(`[STRIPE-WEBHOOK] Plan updated to ${planKey} for user ${profile.user_id}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        
        if (!customer || customer.deleted) break;
        const email = (customer as Stripe.Customer).email;
        if (!email) break;

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("email", email)
          .maybeSingle();

        if (!profile) break;

        if (subscription.status === "active") {
          const productId = subscription.items.data[0]?.price?.product as string;
          const planKey = PRODUCT_TO_PLAN[productId];
          if (planKey) {
            const trialDays = planKey.startsWith("anual") ? 365 : 30;
            await supabaseAdmin
              .from("profiles")
              .update({ plan: planKey, trial_start: new Date().toISOString(), trial_days: trialDays })
              .eq("user_id", profile.user_id);
            console.log(`[STRIPE-WEBHOOK] Subscription updated: ${planKey} for ${profile.user_id}`);
          }
        } else if (["canceled", "unpaid", "past_due"].includes(subscription.status)) {
          await supabaseAdmin
            .from("profiles")
            .update({ plan: "comprou_expirado" })
            .eq("user_id", profile.user_id);
          console.log(`[STRIPE-WEBHOOK] Subscription ${subscription.status}: set comprou_expirado for ${profile.user_id}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        
        if (!customer || customer.deleted) break;
        const email = (customer as Stripe.Customer).email;
        if (!email) break;

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("email", email)
          .maybeSingle();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({ plan: "comprou_expirado" })
            .eq("user_id", profile.user_id);
          console.log(`[STRIPE-WEBHOOK] Subscription deleted: set comprou_expirado for ${profile.user_id}`);
        }
        break;
      }

      default:
        console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] Processing error:", err);
  }

  // Always return 200 to Stripe to acknowledge receipt
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});