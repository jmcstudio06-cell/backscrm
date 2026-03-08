import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map payment amounts (in BRL) to plan names and durations (days)
const PLAN_MAP: Record<number, { plan: string; days: number }> = {
  100:   { plan: "mensal_starter",       days: 30 },  // Teste R$1,00
  1990:  { plan: "mensal_starter",       days: 30 },
  2490:  { plan: "mensal_profissional",   days: 30 },
  3990:  { plan: "mensal_completo",       days: 30 },
  14990: { plan: "anual_starter",        days: 365 },
  19990: { plan: "anual_profissional",   days: 365 },
  29880: { plan: "anual_completo",       days: 365 },
};

// Try to find plan by amount in cents or reais
function resolvePlan(rawAmount: number | string): { plan: string; days: number } | null {
  const num = typeof rawAmount === "string" ? parseFloat(rawAmount) : rawAmount;
  if (isNaN(num)) return null;

  // Try as cents first (e.g. 1990 = R$19,90)
  const asCents = Math.round(num);
  if (PLAN_MAP[asCents]) return PLAN_MAP[asCents];

  // Try as reais (e.g. 19.90 → 1990 cents)
  const convertedCents = Math.round(num * 100);
  if (PLAN_MAP[convertedCents]) return PLAN_MAP[convertedCents];

  return null;
}

// Deep-search for email in nested objects
function findEmail(obj: unknown, depth = 0): string | null {
  if (depth > 5 || !obj) return null;
  if (typeof obj === "string" && obj.includes("@") && obj.includes(".")) return obj;
  if (typeof obj === "object" && obj !== null) {
    // Prioritize known email keys
    const emailKeys = ["email", "buyer_email", "payer_email", "customer_email", "client_email"];
    for (const key of emailKeys) {
      if ((obj as Record<string, unknown>)[key]) {
        const val = (obj as Record<string, unknown>)[key];
        if (typeof val === "string" && val.includes("@")) return val;
      }
    }
    for (const val of Object.values(obj as Record<string, unknown>)) {
      const found = findEmail(val, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// Deep-search for amount in nested objects
function findAmount(obj: unknown, depth = 0): number | null {
  if (depth > 5 || !obj) return null;
  if (typeof obj === "object" && obj !== null) {
    const amountKeys = ["amount", "total", "value", "total_amount", "price", "payment_amount"];
    for (const key of amountKeys) {
      const val = (obj as Record<string, unknown>)[key];
      if (val !== undefined && val !== null) {
        const num = typeof val === "string" ? parseFloat(val) : Number(val);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    for (const val of Object.values(obj as Record<string, unknown>)) {
      const found = findAmount(val, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const body = await req.json();
    console.log("📩 InfinitePay webhook received:", JSON.stringify(body));

    // Extract email and amount from payload (flexible deep search)
    const email = findEmail(body);
    const amount = findAmount(body);

    if (!email) {
      console.error("❌ Could not find email in webhook payload");
      return new Response(JSON.stringify({ error: "email not found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!amount) {
      console.error("❌ Could not find amount in webhook payload");
      return new Response(JSON.stringify({ error: "amount not found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resolved = resolvePlan(amount);
    if (!resolved) {
      console.error(`❌ Unknown amount: ${amount} — could not resolve plan`);
      return new Response(JSON.stringify({ error: `unknown amount: ${amount}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Resolved: email=${email}, amount=${amount}, plan=${resolved.plan}, days=${resolved.days}`);

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Find user profile by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, user_id, plan, trial_start, trial_days")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (profileError || !profile) {
      console.error("❌ Profile not found for email:", email, profileError);
      return new Response(JSON.stringify({ error: "user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update plan
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: resolved.plan,
        trial_start: new Date().toISOString(),
        trial_days: resolved.days,
      })
      .eq("user_id", profile.user_id);

    if (updateError) {
      console.error("❌ Error updating profile:", updateError);
      return new Response(JSON.stringify({ error: "failed to update plan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`🎉 Plan activated: ${resolved.plan} for user ${profile.user_id} (${email})`);

    return new Response(JSON.stringify({ success: true, plan: resolved.plan }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in infinitepay-webhook:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
