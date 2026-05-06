import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { PLAN_DAYS, buildFeatureBlocks } from "../_shared/plan-features.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// price_id -> planKey
const PRICE_TO_PLAN: Record<string, string> = {
  price_1TTt9yRrEj00ctsSg5AEk1hg: "mensal_starter",
  price_1TTtAFRrEj00ctsSIrqcEujm: "mensal_profissional",
  price_1TTtAbRrEj00ctsSsiyrelmc: "mensal_empresarial",
  price_1TTtAsRrEj00ctsSiL88sr6C: "anual_starter",
  price_1TTtBARrEj00ctsSoql8QAii: "anual_profissional",
  price_1TTtBVRrEj00ctsSwaml715T: "anual_empresarial",
};

const ALL_BLOCKED: Record<string, boolean> = {
  dashboard: true, agenda: true, crm: true, clientes: true, orcamentos: true,
  servicos: true, contratos: true, financeiro: true, historico: true,
  precificacao: true, checklist: true, "mapeamento-palco": true, equipe: true,
  metas: true, repertorio: true, aulas: true, avancos: true, tutoriais: true,
  configuracoes: true, "link-agenda": true, bonus: true, "ideias-post": true,
  "metas-anuais": true, "link-instagram": true,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY missing" }), { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    if (webhookSecret && sig) {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
    } else {
      // Fallback (no signature verification) — ONLY used until webhook secret is configured.
      event = JSON.parse(rawBody);
      console.warn("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set — signature NOT verified");
    }
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: corsHeaders });
  }

  console.log("[stripe-webhook] event:", event.type);

  try {
    async function findUserId(customerId: string, fallbackEmail?: string | null): Promise<string | null> {
      const { data: byCust } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (byCust?.user_id) return byCust.user_id;

      if (fallbackEmail) {
        const { data: byEmail } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email", fallbackEmail)
          .maybeSingle();
        if (byEmail?.user_id) {
          await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("user_id", byEmail.user_id);
          return byEmail.user_id;
        }
      }
      return null;
    }

    async function activatePlan(opts: {
      userId: string;
      planKey: string;
      subscriptionId: string;
      customerId: string;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
    }) {
      const planDays = PLAN_DAYS[opts.planKey] || 30;
      const featureBlocks = buildFeatureBlocks(opts.planKey);
      await supabase
        .from("profiles")
        .update({
          plan: opts.planKey,
          trial_start: new Date().toISOString(),
          trial_days: planDays,
          feature_blocks: featureBlocks,
          stripe_customer_id: opts.customerId,
          stripe_subscription_id: opts.subscriptionId,
          subscription_status: "active",
          current_period_end: opts.currentPeriodEnd
            ? new Date(opts.currentPeriodEnd * 1000).toISOString()
            : null,
          cancel_at_period_end: opts.cancelAtPeriodEnd,
        })
        .eq("user_id", opts.userId);
      console.log("[stripe-webhook] activated", opts.userId, opts.planKey);
    }

    async function expirePlan(userId: string, status: string) {
      await supabase
        .from("profiles")
        .update({
          plan: "comprou_expirado",
          feature_blocks: ALL_BLOCKED,
          subscription_status: status,
          cancel_at_period_end: false,
        })
        .eq("user_id", userId);
      console.log("[stripe-webhook] expired", userId, status);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.mode !== "subscription" || !s.subscription) break;
        const subscription = await stripe.subscriptions.retrieve(s.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        const planKey =
          (s.metadata?.plan_key as string) ||
          (subscription.metadata?.plan_key as string) ||
          (priceId ? PRICE_TO_PLAN[priceId] : null) ||
          null;
        const customerId = subscription.customer as string;
        const userId =
          (s.metadata?.user_id as string) ||
          (subscription.metadata?.user_id as string) ||
          (await findUserId(customerId, s.customer_details?.email));
        if (!userId || !planKey) {
          console.error("[stripe-webhook] missing userId/planKey", { userId, planKey });
          break;
        }
        await activatePlan({
          userId,
          planKey,
          subscriptionId: subscription.id,
          customerId,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id;
        const planKey =
          (sub.metadata?.plan_key as string) ||
          (priceId ? PRICE_TO_PLAN[priceId] : null);
        const customerId = sub.customer as string;
        const userId =
          (sub.metadata?.user_id as string) ||
          (await findUserId(customerId));
        if (!userId || !planKey) break;

        if (sub.status === "active" || sub.status === "trialing") {
          await activatePlan({
            userId,
            planKey,
            subscriptionId: sub.id,
            customerId,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          });
        } else if (sub.status === "past_due" || sub.status === "unpaid") {
          await supabase
            .from("profiles")
            .update({
              subscription_status: sub.status,
              cancel_at_period_end: sub.cancel_at_period_end,
            })
            .eq("user_id", userId);
        } else if (sub.status === "canceled" || sub.status === "incomplete_expired") {
          await expirePlan(userId, sub.status);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          (sub.metadata?.user_id as string) ||
          (await findUserId(sub.customer as string));
        if (userId) await expirePlan(userId, "canceled");
        break;
      }

      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        if (!inv.subscription) break;
        const sub = await stripe.subscriptions.retrieve(inv.subscription as string);
        const priceId = sub.items.data[0]?.price.id;
        const planKey =
          (sub.metadata?.plan_key as string) ||
          (priceId ? PRICE_TO_PLAN[priceId] : null);
        const customerId = sub.customer as string;
        const userId =
          (sub.metadata?.user_id as string) ||
          (await findUserId(customerId, inv.customer_email));
        if (!userId || !planKey) break;
        await activatePlan({
          userId,
          planKey,
          subscriptionId: sub.id,
          customerId,
          currentPeriodEnd: sub.current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = inv.customer as string;
        const userId = await findUserId(customerId, inv.customer_email);
        if (userId) {
          await supabase
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("user_id", userId);
        }
        break;
      }

      default:
        console.log("[stripe-webhook] unhandled:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-webhook] handler error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
