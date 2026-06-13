import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importJWK } from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const encoder = new TextEncoder();

// ---- Base64url helpers ----
function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function createVapidAuth(
  endpoint: string, subject: string, publicKeyB64: string, privateKeyB64: string,
): Promise<string> {
  const url = new URL(endpoint);
  const aud = url.origin;
  let sub = subject.replace(/[<>]/g, "").trim().replace(/\s+/g, "");
  if (!sub.startsWith("mailto:") && !sub.startsWith("http")) sub = `mailto:${sub}`;
  const pubRaw = b64urlDecode(publicKeyB64);
  const privRaw = b64urlDecode(privateKeyB64);
  const jwk = { kty: "EC" as const, crv: "P-256" as const, x: b64url(pubRaw.slice(1, 33)), y: b64url(pubRaw.slice(33, 65)), d: b64url(privRaw) };
  const key = await importJWK(jwk, "ES256");
  const jwt = await new SignJWT({}).setProtectedHeader({ alg: "ES256", typ: "JWT" }).setAudience(aud).setSubject(sub).setIssuedAt().setExpirationTime("1h").sign(key);
  return `vapid t=${jwt}, k=${publicKeyB64}`;
}

async function encryptPayload(payload: string, p256dhB64: string, authB64: string): Promise<Uint8Array> {
  const plaintext = encoder.encode(payload);
  const clientPubRaw = b64urlDecode(p256dhB64);
  const authSecret = b64urlDecode(authB64);
  const clientPubKey = await crypto.subtle.importKey("raw", clientPubRaw, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const localKeys = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const localPubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", localKeys.publicKey));
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: clientPubKey }, localKeys.privateKey, 256));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const ikm = await hkdf(authSecret, sharedSecret, concat(encoder.encode("WebPush: info\0"), clientPubRaw, localPubRaw), 32);
  const cek = await hkdf(salt, ikm, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, encoder.encode("Content-Encoding: nonce\0"), 12);
  const padded = new Uint8Array([...plaintext, 2]);
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM", length: 128 }, false, ["encrypt"]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded));
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  const idlen = new Uint8Array([localPubRaw.length]);
  return concat(salt, rs, idlen, localPubRaw, ciphertext);
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const prkKey = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, ikm));
  const expandKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expanded = new Uint8Array(await crypto.subtle.sign("HMAC", expandKey, new Uint8Array([...info, 1])));
  return expanded.slice(0, length);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { result.set(a, offset); offset += a.length; }
  return result;
}

async function sendPush(
  endpoint: string, p256dh: string, auth: string, payload: string,
  vapidPublicKey: string, vapidPrivateKey: string, vapidSubject: string,
): Promise<{ status: number; body: string }> {
  const authorization = await createVapidAuth(endpoint, vapidSubject, vapidPublicKey, vapidPrivateKey);
  const body = await encryptPayload(payload, p256dh, auth);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Crypto-Key": `p256ecdsa=${vapidPublicKey}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "3600",
    },
    body,
  });
  const resBody = await res.text();
  return { status: res.status, body: resBody };
}

// ---- Send to specific user IDs ----
async function sendToUsers(
  supabase: any, userIds: string[], title: string, body: string, url: string,
  vapidPub: string, vapidPriv: string, vapidSub: string, notificationType: string,
): Promise<number> {
  if (userIds.length === 0) return 0;

  const { data: allSubs } = await supabase
    .from("user_push_subscriptions")
    .select("id,user_id,endpoint,p256dh,auth,created_at")
    .eq("is_active", true)
    .in("user_id", userIds)
    .order("created_at", { ascending: false });

  if (!allSubs || allSubs.length === 0) return 0;

  const seenEndpoints = new Set<string>();
  const subs = allSubs.filter((s: any) => {
    if (seenEndpoints.has(s.endpoint)) return false;
    seenEndpoints.add(s.endpoint);
    return true;
  });

  const payload = JSON.stringify({
    title, body,
    icon: "/icons/icon-192.png",
    badge: "/icons/mono-192.png",
    url: url || "/dashboard",
  });

  const results = await Promise.allSettled(
    subs.map(async (s: any) => {
      if (!s.endpoint.startsWith("http")) {
        await supabase.from("user_push_subscriptions").update({ is_active: false }).eq("id", s.id);
        return false;
      }
      try {
        const result = await sendPush(s.endpoint, s.p256dh, s.auth, payload, vapidPub, vapidPriv, vapidSub);
        if (result.status === 404 || result.status === 410) {
          await supabase.from("user_push_subscriptions").update({ is_active: false }).eq("id", s.id);
          return false;
        }
        return result.status >= 200 && result.status < 300;
      } catch (err) {
        console.error(`Push error ${s.id}:`, err);
        return false;
      }
    }),
  );

  const sent = results.reduce((acc, r) => acc + (r.status === "fulfilled" && r.value ? 1 : 0), 0);

  if (sent > 0 || subs.length > 0) {
    await supabase.from("notification_history").insert({
      title, message: body, action_url: url,
      notification_type: notificationType, target_audience: "automated", users_reached: sent,
    });
  }

  return sent;
}

// ---- Automation handlers ----

async function handleInactivity(supabase: any, config: any, text: string, vapidPub: string, vapidPriv: string, vapidSub: string) {
  const daysInactive = config?.days_inactive || 7;
  const cutoff = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000).toISOString();
  const { data: inactiveUsers } = await supabase.from("profiles").select("user_id, name, artist_name").or(`last_seen.is.null,last_seen.lt.${cutoff}`);
  if (!inactiveUsers || inactiveUsers.length === 0) return 0;
  const userIds = inactiveUsers.map((u: any) => u.user_id);
  const message = text || "👋 Sentimos sua falta! Volte e continue evoluindo sua carreira musical.";
  console.log(`[Inactivity] Found ${userIds.length} inactive users (>${daysInactive} days)`);
  return sendToUsers(supabase, userIds, "⏰ Você sumiu!", message, "/dashboard", vapidPub, vapidPriv, vapidSub, "inactivity");
}

async function handleShowReminder(supabase: any, config: any, text: string, vapidPub: string, vapidPriv: string, vapidSub: string) {
  const hoursBefore = config?.hours_before || 24;
  const now = new Date();
  const target = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);
  const todayStr = now.toISOString().split("T")[0];
  const targetStr = target.toISOString().split("T")[0];
  const { data: upcomingShows } = await supabase.from("shows").select("id, title, user_id, date").in("status", ["confirmed", "scheduled"]).gte("date", todayStr).lte("date", targetStr);
  if (!upcomingShows || upcomingShows.length === 0) return 0;
  let totalSent = 0;
  const byUser = new Map<string, any[]>();
  for (const show of upcomingShows) {
    if (!byUser.has(show.user_id)) byUser.set(show.user_id, []);
    byUser.get(show.user_id)!.push(show);
  }
  for (const [userId, shows] of byUser) {
    const showTitle = shows[0].title;
    const message = text ? text.replace(/{show_title}/g, showTitle) : `🎤 Seu show "${showTitle}" é em breve! Confira os detalhes.`;
    const sent = await sendToUsers(supabase, [userId], "🎤 Show chegando!", message.trim(), "/agenda", vapidPub, vapidPriv, vapidSub, "show_reminder");
    totalSent += sent;
  }
  console.log(`[ShowReminder] Notified about ${upcomingShows.length} shows, sent ${totalSent}`);
  return totalSent;
}

async function handleGoalReminder(supabase: any, _config: any, text: string, vapidPub: string, vapidPriv: string, vapidSub: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const { data: usersWithGoals } = await supabase.from("goals").select("user_id").eq("month", month).eq("year", year);
  if (!usersWithGoals || usersWithGoals.length === 0) return 0;
  const userIds = [...new Set(usersWithGoals.map((g: any) => g.user_id))];
  const message = text || "🎯 Como estão suas metas? Bora manter o foco!";
  console.log(`[GoalReminder] Sending to ${userIds.length} users with goals`);
  return sendToUsers(supabase, userIds as string[], "🎯 Lembrete de Metas", message.trim(), "/metas", vapidPub, vapidPriv, vapidSub, "goal_reminder");
}

async function handleLowPerformance(supabase: any, _config: any, text: string, vapidPub: string, vapidPriv: string, vapidSub: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  const { data: allProfiles } = await supabase.from("profiles").select("user_id").not("plan", "eq", "free");
  if (!allProfiles || allProfiles.length === 0) return 0;
  const { data: activeShowUsers } = await supabase.from("shows").select("user_id").gte("date", thirtyDaysAgo).lte("date", today);
  const activeUserIds = new Set((activeShowUsers || []).map((s: any) => s.user_id));
  const lowPerfUsers = allProfiles.filter((p: any) => !activeUserIds.has(p.user_id)).map((p: any) => p.user_id);
  if (lowPerfUsers.length === 0) return 0;
  const message = text || "📉 Seu desempenho está abaixo do esperado. Que tal agendar mais shows?";
  console.log(`[LowPerformance] Found ${lowPerfUsers.length} users with 0 shows in 30 days`);
  return sendToUsers(supabase, lowPerfUsers, "📉 Desempenho Baixo", message.trim(), "/agenda", vapidPub, vapidPriv, vapidSub, "low_performance");
}

async function handlePendingPayment(supabase: any, _config: any, text: string, vapidPub: string, vapidPriv: string, vapidSub: string) {
  const { data: completedShows } = await supabase.from("shows").select("id, user_id, title, cachet").eq("status", "completed").gt("cachet", 0);
  if (!completedShows || completedShows.length === 0) return 0;
  const showIds = completedShows.map((s: any) => s.id);
  const { data: paidShows } = await supabase.from("transactions").select("show_id").in("show_id", showIds);
  const paidShowIds = new Set((paidShows || []).map((t: any) => t.show_id));
  const unpaidShows = completedShows.filter((s: any) => !paidShowIds.has(s.id));
  if (unpaidShows.length === 0) return 0;
  const userIds = [...new Set(unpaidShows.map((s: any) => s.user_id))];
  const message = text || "💰 Você tem cachês pendentes! Confira no financeiro.";
  console.log(`[PendingPayment] Found ${unpaidShows.length} unpaid shows for ${userIds.length} users`);
  return sendToUsers(supabase, userIds as string[], "💰 Cachê Pendente", message.trim(), "/financeiro", vapidPub, vapidPriv, vapidSub, "pending_payment");
}

async function handleChecklistReminder(supabase: any, _config: any, text: string, vapidPub: string, vapidPriv: string, vapidSub: string) {
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const todayStr = now.toISOString().split("T")[0];
  const targetStr = in48h.toISOString().split("T")[0];
  const { data: upcomingShows } = await supabase.from("shows").select("id, title, user_id, date").in("status", ["confirmed", "scheduled"]).gte("date", todayStr).lte("date", targetStr);
  if (!upcomingShows || upcomingShows.length === 0) return 0;
  // Checklist agora é 100% local — notificamos todos os usuários com shows próximos.
  const usersToNotify = new Map<string, string>();
  for (const show of upcomingShows) {
    if (!usersToNotify.has(show.user_id)) {
      usersToNotify.set(show.user_id, show.title);
    }
  }
  if (usersToNotify.size === 0) return 0;
  let totalSent = 0;
  for (const [userId, showTitle] of usersToNotify) {
    const message = text ? text.replace(/{show_title}/g, showTitle) : `📋 Seu checklist para "${showTitle}" tem itens pendentes! Confira antes do show.`;
    const sent = await sendToUsers(supabase, [userId], "📋 Checklist Pendente!", message.trim(), "/checklist", vapidPub, vapidPriv, vapidSub, "checklist_reminder");
    totalSent += sent;
  }
  console.log(`[ChecklistReminder] Notified ${usersToNotify.size} users, sent ${totalSent}`);
  return totalSent;
}

async function handleWeeklyMotivation(supabase: any, _config: any, text: string, vapidPub: string, vapidPriv: string, vapidSub: string) {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: activeUsers } = await supabase.from("profiles").select("user_id").gte("last_seen", cutoff);
  if (!activeUsers || activeUsers.length === 0) return 0;
  const userIds = activeUsers.map((u: any) => u.user_id);
  const messages = [
    "🚀 Continue evoluindo! Cada show é um passo a mais na sua carreira.",
    "💪 Você está no caminho certo! Mantenha o foco e os resultados virão.",
    "🎵 A consistência é a chave do sucesso. Bora manter o ritmo!",
    "⭐ Artistas de sucesso não param. Continue organizando sua carreira!",
    "🔥 Sua dedicação faz a diferença. Continue usando o Backstage Pro!",
  ];
  const message = text || messages[Math.floor(Math.random() * messages.length)];
  console.log(`[WeeklyMotivation] Sending to ${userIds.length} active users`);
  return sendToUsers(supabase, userIds, "💡 Dica da Semana", message.trim(), "/dashboard", vapidPub, vapidPriv, vapidSub, "weekly_motivation");
}

async function handleMonthlyGoal(supabase: any, _config: any, text: string, vapidPub: string, vapidPriv: string, vapidSub: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const { data: goals } = await supabase.from("goals").select("user_id, target_value, type").eq("month", month).eq("year", year);
  if (!goals || goals.length === 0) return 0;
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const userIds = [...new Set(goals.map((g: any) => g.user_id))];
  const { data: monthShows } = await supabase.from("shows").select("user_id").gte("date", firstDay).lt("date", lastDay).in("user_id", userIds);
  const showCountByUser = new Map<string, number>();
  for (const s of (monthShows || [])) {
    showCountByUser.set(s.user_id, (showCountByUser.get(s.user_id) || 0) + 1);
  }
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(year, month, 0).getDate();
  const expectedProgress = dayOfMonth / daysInMonth;
  const behindUsers: string[] = [];
  for (const goal of goals) {
    if (goal.type === "shows") {
      const actual = showCountByUser.get(goal.user_id) || 0;
      const expected = Math.floor(goal.target_value * expectedProgress);
      if (actual < expected) behindUsers.push(goal.user_id);
    }
  }
  if (behindUsers.length === 0) return 0;
  const uniqueUsers = [...new Set(behindUsers)];
  const message = text || "📊 Sua meta mensal precisa de atenção! Confira seu progresso.";
  console.log(`[MonthlyGoal] Found ${uniqueUsers.length} users behind on goals`);
  return sendToUsers(supabase, uniqueUsers, "📊 Meta Mensal", message.trim(), "/metas", vapidPub, vapidPriv, vapidSub, "monthly_goal");
}

// ---- Plan expiring (monthly subscriptions only) ----
async function handlePlanExpiring(supabase: any, _config: any, text: string, vapidPub: string, vapidPriv: string, vapidSub: string) {
  // Only monthly paid plans (mensal_*). Anual users are not warned.
  const { data: monthlyUsers } = await supabase
    .from("profiles")
    .select("user_id, plan, trial_start, updated_at, artist_name, name")
    .like("plan", "mensal_%");

  if (!monthlyUsers || monthlyUsers.length === 0) return 0;

  const PLAN_DURATION_DAYS = 30;
  const TRIGGER_DAYS = new Set([5, 3, 0]);
  const now = Date.now();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // Group users by daysRemaining so we send one push per bucket.
  const buckets = new Map<number, string[]>();
  for (const u of monthlyUsers) {
    const startSrc = u.trial_start || u.updated_at;
    if (!startSrc) continue;
    const start = new Date(startSrc).getTime();
    if (Number.isNaN(start)) continue;
    const diffDays = Math.floor((now - start) / MS_PER_DAY);
    const daysRemaining = PLAN_DURATION_DAYS - diffDays;
    if (!TRIGGER_DAYS.has(daysRemaining)) continue;
    if (!buckets.has(daysRemaining)) buckets.set(daysRemaining, []);
    buckets.get(daysRemaining)!.push(u.user_id);
  }

  if (buckets.size === 0) return 0;

  const messageFor = (days: number) => {
    if (text) return text.replace(/{days}/g, String(days));
    if (days === 0) {
      return "⏰ Sua assinatura mensal vence HOJE! Renove agora para continuar com o benefício mensal — depois do vencimento só o plano anual fica disponível por um tempo. 💙";
    }
    if (days === 1) {
      return "💙 Sua assinatura mensal vence amanhã. Renove hoje para manter o benefício mensal — atrasou, o próximo acesso só pelo plano anual.";
    }
    return `💙 Sua assinatura mensal vence em ${days} dias. Renove a tempo para manter o benefício mensal — se atrasar, o próximo acesso só pelo plano anual.`;
  };

  const titleFor = (days: number) => {
    if (days === 0) return "⏰ Sua assinatura vence hoje";
    if (days === 1) return "💙 Sua assinatura vence amanhã";
    return `💙 Sua assinatura vence em ${days} dias`;
  };

  let totalSent = 0;
  for (const [days, userIds] of buckets) {
    const sent = await sendToUsers(
      supabase, userIds, titleFor(days), messageFor(days), "/planos",
      vapidPub, vapidPriv, vapidSub, "plan_expiring",
    );
    totalSent += sent;
    console.log(`[PlanExpiring] D-${days}: ${userIds.length} users, ${sent} push sent`);
  }
  return totalSent;

// ---- Main handler ----
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
      throw new Error("VAPID env vars not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse optional body
    let automationKey: string | null = null;
    try {
      const body = await req.json();
      automationKey = body?.automation_key || null;
    } catch {
      // no body or invalid json - run all
    }

    // 1. Cleanup old history (48h)
    await supabase.rpc("cleanup_old_notifications");
    console.log("[Cleanup] Old notifications cleaned up");

    // 2. Fetch enabled automations
    let query = supabase
      .from("notification_settings")
      .select("*")
      .eq("is_enabled", true);

    if (automationKey) {
      query = query.eq("setting_key", automationKey);
    }

    const { data: settings } = await query;

    if (!settings || settings.length === 0) {
      console.log("[Automations] No enabled automations found");
      return new Response(JSON.stringify({ message: "No enabled automations", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Current time in Brasília (UTC-3)
    const now = new Date();
    const currentHour = now.getUTCHours();
    const brasiliaOffset = -3;
    const brasiliaHour = (currentHour + brasiliaOffset + 24) % 24;
    const brasiliaMinute = now.getUTCMinutes();
    const brasiliaTimeStr = `${String(brasiliaHour).padStart(2, "0")}:${String(brasiliaMinute).padStart(2, "0")}`;

    const filteredSettings = automationKey
      ? settings // Manual test: always run
      : settings.filter((s: any) => {
          const config = s.config && typeof s.config === "object" ? s.config : {};

          // Check scheduled_time (hour must match)
          const scheduledTime = (config as any).scheduled_time;
          if (scheduledTime) {
            const [schedH] = scheduledTime.split(":");
            if (parseInt(schedH) !== brasiliaHour) return false;
          }

          // Check repeat_every_days interval
          const repeatDays = (config as any).repeat_every_days;
          const lastSentAt = (config as any).last_sent_at;

          if (repeatDays && repeatDays > 0 && lastSentAt) {
            const lastSent = new Date(lastSentAt);
            const daysSinceLast = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLast < repeatDays) {
              console.log(`[Automations] Skipping ${s.setting_key}: last sent ${daysSinceLast.toFixed(1)} days ago, interval is ${repeatDays} days`);
              return false;
            }
          }

          return true;
        });

    if (filteredSettings.length === 0) {
      console.log(`[Automations] No automations scheduled for ${brasiliaTimeStr} (Brasília) or interval not met`);
      return new Response(JSON.stringify({ message: "No automations scheduled for this time", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Automations] Running ${filteredSettings.length} automations at ${brasiliaTimeStr} (Brasília)`);

    let totalSent = 0;

    for (const setting of filteredSettings) {
      const config = setting.config && typeof setting.config === "object" ? setting.config : {};
      const text = setting.notification_text || "";

      try {
        let sent = 0;
        switch (setting.setting_key) {
          case "inactivity":
            sent = await handleInactivity(supabase, config, text, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT);
            break;
          case "show_reminder":
            sent = await handleShowReminder(supabase, config, text, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT);
            break;
          case "goal_reminder":
            sent = await handleGoalReminder(supabase, config, text, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT);
            break;
          case "low_performance":
            sent = await handleLowPerformance(supabase, config, text, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT);
            break;
          case "pending_payment":
            sent = await handlePendingPayment(supabase, config, text, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT);
            break;
          case "monthly_goal":
            sent = await handleMonthlyGoal(supabase, config, text, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT);
            break;
          case "checklist_reminder":
            sent = await handleChecklistReminder(supabase, config, text, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT);
            break;
          case "weekly_motivation":
            sent = await handleWeeklyMotivation(supabase, config, text, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT);
            break;
          default:
            console.log(`[Automations] Unknown key: ${setting.setting_key}`);
        }
        totalSent += sent;
        console.log(`[Automations] ${setting.setting_key}: sent ${sent}`);

        // Update last_sent_at in config
        const updatedConfig = { ...(config as any), last_sent_at: now.toISOString() };
        await supabase
          .from("notification_settings")
          .update({ config: updatedConfig })
          .eq("id", setting.id);

      } catch (err) {
        console.error(`[Automations] Error in ${setting.setting_key}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ message: "Automations executed", sent: totalSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("[Automations] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
