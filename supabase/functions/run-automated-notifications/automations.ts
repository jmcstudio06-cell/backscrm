// Automated notification rules and delivery. Pure of HTTP concerns so it can be verified with fake data.
import {
  addDays,
  brDateOf,
  brl,
  BrNow,
  capitalize,
  CHARGEABLE_STATUSES,
  chunk,
  contradicts,
  DAY_MS,
  dayIndex,
  displayName,
  EXPIRED_PLANS,
  fetchAll,
  fetchProfiles,
  fmtBRL,
  fmtDayMonth,
  fmtFullDate,
  fmtTime,
  fmtWeekdayDate,
  greet,
  isIsoDate,
  MONTHS,
  normalizeShowStatus,
  pickBody,
  plural,
  ProfileLite,
  relDay,
  REMINDER_STATUSES,
  renderTemplate,
  SHOW_STATUS_ALIASES,
  showStartMs,
  TZ,
  Vars,
  WEEKDAYS,
  withName,
} from "./rules.ts";



// ---- Delivery ----
export interface Candidate {
  userId: string;
  eventKey: string; // unique per real event (show, day, period...)
  title: string;
  body: string;
  url: string;
}

export interface Ctx {
  supabase: any;
  br: BrNow;
  dryRun: boolean;
  sendPush: (endpoint: string, p256dh: string, auth: string, payload: string) => Promise<{ status: number; body: string }>;
}

export interface AutomationResult {
  key: string;
  eligible: number; // users matching the rule with an active device
  alreadySent: number; // skipped because this exact event was already notified
  sent: number; // users who got the push on at least one device
  previews: { user: string; title: string; body: string }[];
}

export const dedupeType = (key: string, eventKey: string) => `auto:${key}:${eventKey}`.slice(0, 200);

export async function deliver(ctx: Ctx, key: string, raw: Candidate[]): Promise<AutomationResult> {
  const { supabase } = ctx;
  const result: AutomationResult = { key, eligible: 0, alreadySent: 0, sent: 0, previews: [] };

  // One candidate per (user, event).
  const unique = new Map<string, Candidate>();
  for (const c of raw) unique.set(`${c.userId}|${c.eventKey}`, c);
  let candidates = [...unique.values()];
  if (candidates.length === 0) return result;

  // Only users with an active device can receive a push.
  const subsByUser = new Map<string, any[]>();
  for (const ids of chunk([...new Set(candidates.map((c) => c.userId))], 200)) {
    const { data, error } = await supabase
      .from("user_push_subscriptions")
      .select("id,user_id,endpoint,p256dh,auth,created_at")
      .eq("is_active", true)
      .in("user_id", ids);
    if (error) throw error;
    for (const s of data ?? []) {
      if (!subsByUser.has(s.user_id)) subsByUser.set(s.user_id, []);
      subsByUser.get(s.user_id)!.push(s);
    }
  }
  candidates = candidates.filter((c) => subsByUser.has(c.userId));
  if (candidates.length === 0) return result;

  // Never repeat the same event for the same user.
  const sentBefore = new Set<string>();
  for (const part of chunk(candidates, 150)) {
    const { data, error } = await supabase
      .from("user_notifications")
      .select("user_id,notification_type")
      .in("user_id", [...new Set(part.map((c) => c.userId))])
      .in("notification_type", [...new Set(part.map((c) => dedupeType(key, c.eventKey)))]);
    if (error) throw error;
    for (const row of data ?? []) sentBefore.add(`${row.user_id}|${row.notification_type}`);
  }
  const fresh = candidates.filter((c) => !sentBefore.has(`${c.userId}|${dedupeType(key, c.eventKey)}`));
  result.alreadySent = candidates.length - fresh.length;
  result.eligible = fresh.length;

  if (ctx.dryRun) {
    const profiles = await fetchProfiles(supabase, fresh.slice(0, 15).map((c) => c.userId));
    result.previews = fresh.slice(0, 15).map((c) => ({
      user: displayName(profiles.get(c.userId)) ?? c.userId.slice(0, 8),
      title: c.title,
      body: c.body,
    }));
    return result;
  }

  const sendOne = async (c: Candidate): Promise<boolean> => {
    // Claim the event first: if the log row can't be written, don't send (avoids duplicates).
    const { error: logError } = await supabase.from("user_notifications").insert({
      user_id: c.userId,
      title: c.title,
      message: c.body,
      notification_type: dedupeType(key, c.eventKey),
      action_url: c.url,
    });
    if (logError) {
      console.error(`[${key}] log failed for ${c.userId}:`, logError.message);
      return false;
    }

    const payload = JSON.stringify({ title: c.title, body: c.body, icon: "/icons/icon-192.png", badge: "/icons/mono-192.png", url: c.url });
    const seen = new Set<string>();
    let delivered = false;
    for (const s of subsByUser.get(c.userId) ?? []) {
      if (seen.has(s.endpoint)) continue;
      seen.add(s.endpoint);
      if (!String(s.endpoint).startsWith("http")) {
        await supabase.from("user_push_subscriptions").update({ is_active: false }).eq("id", s.id);
        continue;
      }
      try {
        const res = await ctx.sendPush(s.endpoint, s.p256dh, s.auth, payload);
        if (res.status === 404 || res.status === 410) {
          await supabase.from("user_push_subscriptions").update({ is_active: false }).eq("id", s.id);
        } else if (res.status >= 200 && res.status < 300) {
          delivered = true;
        } else {
          console.warn(`[${key}] push ${s.id} status=${res.status} ${res.body.slice(0, 160)}`);
        }
      } catch (err) {
        console.error(`[${key}] push error ${s.id}:`, err);
      }
    }
    return delivered;
  };

  // Small concurrency pool keeps the run fast without hammering push services.
  let index = 0;
  const workers = Array.from({ length: Math.min(8, fresh.length) }, async () => {
    while (index < fresh.length) {
      const c = fresh[index++];
      if (await sendOne(c)) result.sent += 1;
    }
  });
  await Promise.all(workers);

  if (fresh.length > 0) {
    await supabase.from("notification_history").insert({
      title: fresh[0].title,
      message: fresh.length === 1 ? fresh[0].body : `${fresh.length} mensagens personalizadas`,
      action_url: fresh[0].url,
      notification_type: key,
      target_audience: "automated",
      users_reached: result.sent,
    });
  }
  return result;
}

// ---- Automations ----

/** Shows of the next hours, for reminders (show_reminder / checklist_reminder). */
export async function upcomingShows(ctx: Ctx, hoursAhead: number) {
  const { br } = ctx;
  const lastDay = addDays(br.date, Math.ceil(hoursAhead / 24) + 1);
  const rows = await fetchAll((from, to) =>
    ctx.supabase.from("shows").select("id,user_id,title,date,start_time,venue,status")
      .gte("date", br.date).lte("date", lastDay).order("id").range(from, to));

  const out: { show: any; dayDiff: number; time: string | null }[] = [];
  for (const show of rows) {
    if (!isIsoDate(show.date) || !show.title?.trim()) continue;
    if (!REMINDER_STATUSES.has(normalizeShowStatus(show.status))) continue;
    const dayDiff = dayIndex(show.date) - dayIndex(br.date);
    const time = fmtTime(show.start_time);
    if (time) {
      const start = showStartMs(show.date, time, br);
      if (start === null) continue;
      const hoursUntil = (start - br.nowMs) / 3_600_000;
      if (hoursUntil <= 0 || hoursUntil > hoursAhead) continue;
    } else {
      const windowDays = Math.max(1, Math.round(hoursAhead / 24));
      if (dayDiff < 0 || dayDiff > windowDays) continue;
    }
    out.push({ show, dayDiff, time });
  }
  return out;
}

export function showVars(name: string | null, show: any, dayDiff: number, time: string | null): Vars {
  return {
    user_name: name,
    show_title: show.title.trim(),
    show_date: fmtWeekdayDate(show.date),
    show_time: time,
    venue: show.venue?.trim() || null,
    when: relDay(dayDiff),
  };
}

export function showSentence(show: any, dayDiff: number, time: string | null) {
  const venue = show.venue?.trim();
  return `"${show.title.trim()}" é ${relDay(dayDiff)} (${fmtWeekdayDate(show.date)})${time ? ` às ${time}` : ""}${venue ? ` em ${venue}` : ""}.`;
}

export async function showReminder(ctx: Ctx, config: any, text: string): Promise<Candidate[]> {
  const hoursBefore = Math.min(Math.max(Number(config?.hours_before) || 24, 1), 168);
  const items = await upcomingShows(ctx, hoursBefore);
  const profiles = await fetchProfiles(ctx.supabase, items.map((i) => i.show.user_id));
  return items.map(({ show, dayDiff, time }) => {
    const name = displayName(profiles.get(show.user_id));
    const fallback = withName(name, `seu show ${showSentence(show, dayDiff, time)}`);
    return {
      userId: show.user_id,
      eventKey: `${show.id}:${show.date}:${time ?? ""}`,
      title: dayDiff === 0 ? "🎤 Show hoje" : dayDiff === 1 ? "🎤 Show amanhã" : `🎤 Show em ${dayDiff} dias`,
      body: pickBody(text, showVars(name, show, dayDiff, time), fallback, { dayDiff }),
      url: "/agenda",
    };
  });
}

export async function checklistReminder(ctx: Ctx, _config: any, text: string): Promise<Candidate[]> {
  const items = await upcomingShows(ctx, 48);
  const profiles = await fetchProfiles(ctx.supabase, items.map((i) => i.show.user_id));
  return items.map(({ show, dayDiff, time }) => {
    const name = displayName(profiles.get(show.user_id));
    // The checklist lives on the device, so we never claim it has pending items.
    const fallback = withName(name, `${showSentence(show, dayDiff, time)} Revise o checklist do show.`);
    return {
      userId: show.user_id,
      eventKey: `${show.id}:${show.date}`,
      title: "📋 Checklist do show",
      body: pickBody(text, showVars(name, show, dayDiff, time), fallback, { dayDiff, forbid: /pendent/i }),
      url: "/checklist",
    };
  });
}

/** Mirrors src/pages/Cobrancas.tsx exactly, so the push matches the Cobranças screen. */
export async function pendingPayment(ctx: Ctx, _config: any, text: string): Promise<Candidate[]> {
  const { br } = ctx;
  const rows = await fetchAll((from, to) =>
    ctx.supabase.from("shows").select("id,user_id,title,date,status,cachet,advance_amount,balance_due_date")
      .lt("date", br.date).order("id").range(from, to));

  const byUser = new Map<string, { title: string; date: string; amount: number }[]>();
  for (const show of rows) {
    if (!isIsoDate(show.date)) continue;
    const status = normalizeShowStatus(show.status);
    if (!CHARGEABLE_STATUSES.has(status)) continue;
    const cachet = Number(show.cachet) || 0;
    const advance = Number(show.advance_amount) || 0;
    const amount = status === "partial" ? Math.max(cachet - advance, 0) : cachet;
    if (!(amount > 0)) continue;
    const due = status === "partial" && isIsoDate(show.balance_due_date) ? show.balance_due_date : show.date;
    if (!byUser.has(show.user_id)) byUser.set(show.user_id, []);
    byUser.get(show.user_id)!.push({ title: (show.title || "").trim() || "Show sem título", date: due, amount });
  }

  const profiles = await fetchProfiles(ctx.supabase, [...byUser.keys()]);
  const out: Candidate[] = [];
  for (const [userId, charges] of byUser) {
    charges.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const total = charges.reduce((s, c) => s + c.amount, 0);
    const oldest = charges[0];
    const name = displayName(profiles.get(userId));
    const fallback = charges.length === 1
      ? withName(name, `o cachê de "${oldest.title}" (${fmtDayMonth(oldest.date)}) ainda está a receber: ${fmtBRL(oldest.amount)}.`)
      : withName(name, `você tem ${charges.length} cachês a receber, somando ${fmtBRL(total)}. O mais antigo é "${oldest.title}" (${fmtDayMonth(oldest.date)}).`);
    out.push({
      userId,
      eventKey: br.date,
      title: "💰 Cachês a receber",
      body: pickBody(text, {
        user_name: name, count: charges.length, amount: fmtBRL(total),
        show_title: oldest.title, show_date: fmtDayMonth(oldest.date),
      }, fallback),
      url: "/cobrancas",
    });
  }
  return out;
}

export interface GoalProgress { type: string; label: string; current: number; target: number; isMoney: boolean }

/** Mirrors src/pages/Metas.tsx: shows = status 'completed', revenue = income transactions, leads = created in month. */
export async function monthGoals(ctx: Ctx): Promise<Map<string, GoalProgress[]>> {
  const { br, supabase } = ctx;
  const goals = await fetchAll((from, to) =>
    supabase.from("goals").select("user_id,type,target_value")
      .eq("month", br.month).eq("year", br.year).gt("target_value", 0).order("id").range(from, to));
  const known = goals.filter((g: any) => ["shows", "revenue", "leads"].includes(g.type));
  const userIds = [...new Set(known.map((g: any) => g.user_id))];
  const result = new Map<string, GoalProgress[]>();
  if (userIds.length === 0) return result;

  const first = `${br.year}-${String(br.month).padStart(2, "0")}-01`;
  const next = br.month === 12 ? `${br.year + 1}-01-01` : `${br.year}-${String(br.month + 1).padStart(2, "0")}-01`;
  const showCount = new Map<string, number>();
  const revenue = new Map<string, number>();
  const leadCount = new Map<string, number>();

  for (const ids of chunk(userIds, 200)) {
    const shows = await fetchAll((from, to) =>
      supabase.from("shows").select("user_id,status").in("user_id", ids).gte("date", first).lt("date", next).order("id").range(from, to));
    for (const s of shows) if (s.status === "completed") showCount.set(s.user_id, (showCount.get(s.user_id) || 0) + 1);

    const tx = await fetchAll((from, to) =>
      supabase.from("transactions").select("user_id,amount").in("user_id", ids).eq("type", "income").gte("date", first).lt("date", next).order("id").range(from, to));
    for (const t of tx) revenue.set(t.user_id, (revenue.get(t.user_id) || 0) + (Number(t.amount) || 0));

    const leads = await fetchAll((from, to) =>
      supabase.from("leads").select("user_id,created_at").in("user_id", ids).gte("created_at", first).lt("created_at", next).order("id").range(from, to));
    for (const l of leads) {
      const d = String(l.created_at).split("T")[0];
      if (d >= first && d < next) leadCount.set(l.user_id, (leadCount.get(l.user_id) || 0) + 1);
    }
  }

  // One goal per (user, type): the latest saved wins, like the Metas screen (find first match).
  const seen = new Set<string>();
  for (const g of known) {
    const k = `${g.user_id}|${g.type}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const target = Number(g.target_value) || 0;
    if (target <= 0) continue;
    const progress: GoalProgress =
      g.type === "shows" ? { type: "shows", label: "shows", current: showCount.get(g.user_id) || 0, target, isMoney: false }
      : g.type === "revenue" ? { type: "revenue", label: "faturamento", current: revenue.get(g.user_id) || 0, target, isMoney: true }
      : { type: "leads", label: "leads", current: leadCount.get(g.user_id) || 0, target, isMoney: false };
    if (!result.has(g.user_id)) result.set(g.user_id, []);
    result.get(g.user_id)!.push(progress);
  }
  return result;
}

export const fmtGoalValue = (g: GoalProgress, v: number) => (g.isMoney ? fmtBRL(v) : String(v));
export const pct = (g: GoalProgress) => Math.round((g.current / g.target) * 100);

export async function monthlyGoal(ctx: Ctx, _config: any, text: string): Promise<Candidate[]> {
  const { br } = ctx;
  const daysInMonth = new Date(Date.UTC(br.year, br.month, 0)).getUTCDate();
  const expectedRatio = br.day / daysInMonth;
  const byUser = await monthGoals(ctx);
  const profiles = await fetchProfiles(ctx.supabase, [...byUser.keys()]);
  const monthName = MONTHS[br.month - 1];
  const out: Candidate[] = [];

  for (const [userId, goals] of byUser) {
    const behind = goals.filter((g) => g.current < Math.floor(g.target * expectedRatio));
    if (behind.length === 0) continue;
    behind.sort((a, b) => pct(a) - pct(b));
    const g = behind[0];
    const remaining = Math.max(g.target - g.current, 0);
    const name = displayName(profiles.get(userId));
    const fallback = withName(name,
      `sua meta de ${g.label} de ${monthName}: ${fmtGoalValue(g, g.current)} de ${fmtGoalValue(g, g.target)} (${pct(g)}%). Faltam ${fmtGoalValue(g, remaining)}.`);
    out.push({
      userId,
      eventKey: br.date,
      title: "📊 Meta do mês",
      body: pickBody(text, {
        user_name: name, goal_name: g.label, current: fmtGoalValue(g, g.current), target: fmtGoalValue(g, g.target),
        remaining: fmtGoalValue(g, remaining), percent: `${pct(g)}%`, month: monthName,
      }, fallback),
      url: "/metas",
    });
  }
  return out;
}

export async function goalReminder(ctx: Ctx, config: any, text: string): Promise<Candidate[]> {
  const { br } = ctx;
  const interval = Math.min(Math.max(Number(config?.interval_days) || 10, 1), 60);
  const byUser = await monthGoals(ctx);
  const profiles = await fetchProfiles(ctx.supabase, [...byUser.keys()]);
  const monthName = MONTHS[br.month - 1];
  const order = ["shows", "revenue", "leads"];

  return [...byUser].map(([userId, goals]) => {
    goals.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
    const summary = goals.map((g) => `${g.label} ${fmtGoalValue(g, g.current)} de ${fmtGoalValue(g, g.target)}`).join(" · ");
    const name = displayName(profiles.get(userId));
    return {
      userId,
      eventKey: `p${Math.floor(dayIndex(br.date) / interval)}`,
      title: "🎯 Suas metas",
      body: pickBody(text, { user_name: name, goals_summary: summary, month: monthName, interval_days: interval },
        withName(name, `suas metas de ${monthName}: ${summary}.`)),
      url: "/metas",
    };
  });
}

export async function lowPerformance(ctx: Ctx, _config: any, text: string): Promise<Candidate[]> {
  const { br } = ctx;
  const rows = await fetchAll((from, to) =>
    ctx.supabase.from("shows").select("user_id,date,status").order("id").range(from, to));
  const lastShow = new Map<string, string>();
  for (const s of rows) {
    if (!isIsoDate(s.date) || normalizeShowStatus(s.status) === "cancelled") continue;
    const d = s.date.slice(0, 10);
    if (!lastShow.has(s.user_id) || d > lastShow.get(s.user_id)!) lastShow.set(s.user_id, d);
  }
  const cutoff = addDays(br.date, -30);
  const quiet = [...lastShow].filter(([, d]) => d < cutoff).map(([u]) => u);
  const profiles = await fetchProfiles(ctx.supabase, quiet);
  const week = Math.floor(dayIndex(br.date) / 7);

  return quiet
    .filter((u) => {
      const plan = profiles.get(u)?.plan;
      return !!plan && !EXPIRED_PLANS.has(plan);
    })
    .map((userId) => {
      const name = displayName(profiles.get(userId));
      const last = lastShow.get(userId)!;
      return {
        userId,
        eventKey: `w${week}`,
        title: "📅 Agenda sem shows",
        body: pickBody(text, { user_name: name, last_show_date: fmtFullDate(last) },
          withName(name, `seu último show na agenda foi em ${fmtFullDate(last)} e não há próximos shows marcados. Que tal buscar novas datas?`)),
        url: "/agenda",
      };
    });
}

export async function inactivity(ctx: Ctx, config: any, text: string): Promise<Candidate[]> {
  const { br } = ctx;
  const daysInactive = Math.min(Math.max(Number(config?.days_inactive) || 7, 1), 365);
  const cutoffIso = new Date(br.nowMs - daysInactive * DAY_MS).toISOString();
  const rows = await fetchAll((from, to) =>
    ctx.supabase.from("profiles").select("user_id,name,artist_name,plan,last_seen")
      .not("last_seen", "is", null).lt("last_seen", cutoffIso).order("user_id").range(from, to));

  const out: Candidate[] = [];
  for (const p of rows) {
    const seenMs = new Date(p.last_seen).getTime();
    if (Number.isNaN(seenMs) || seenMs > br.nowMs) continue;
    const days = dayIndex(br.date) - dayIndex(brDateOf(seenMs, br));
    if (days < daysInactive) continue;
    const name = displayName(p);
    out.push({
      userId: p.user_id,
      // Once when the user reaches N days away, again at 2N, 3N... never more than that.
      eventKey: `${String(p.last_seen).slice(0, 19)}:${Math.floor(days / daysInactive)}`,
      title: "⏰ Sentimos sua falta",
      body: pickBody(text, { user_name: name, days },
        withName(name, `faz ${days} ${plural(days, "dia", "dias")} que você não abre o Backstage Pro. Sua agenda e seus cachês continuam aqui.`)),
      url: "/dashboard",
    });
  }
  return out;
}

export async function weeklyMotivation(ctx: Ctx, _config: any, text: string): Promise<Candidate[]> {
  const { br } = ctx;
  const cutoffIso = new Date(br.nowMs - 14 * DAY_MS).toISOString();
  const rows = await fetchAll((from, to) =>
    ctx.supabase.from("profiles").select("user_id,name,artist_name,plan")
      .gte("last_seen", cutoffIso).order("user_id").range(from, to));
  const messages = [
    "cada show organizado é um passo a mais na sua carreira. 🚀",
    "consistência é o que transforma talento em carreira. Bora manter o ritmo! 🎵",
    "quem organiza a carreira colhe mais palco. Continue! 💪",
  ];
  const week = Math.floor(dayIndex(br.date) / 7);
  return rows.map((p: any, i: number) => {
    const name = displayName(p);
    return {
      userId: p.user_id,
      eventKey: `w${week}`,
      title: "💡 Dica da semana",
      body: pickBody(text, { user_name: name }, withName(name, messages[(week + i) % messages.length])),
      url: "/dashboard",
    };
  });
}

// Plan expiring (monthly plans only). Expiry date comes from real sources, in priority order:
// 1) current_period_end when still current; 2) latest confirmed payment + 30 days; 3) trial_start + 30 days.
// No reliable date → never notified.
export async function planExpiring(ctx: Ctx, _config: any, text: string): Promise<Candidate[]> {
  const { br, supabase } = ctx;
  const users = await fetchAll((from, to) =>
    supabase.from("profiles").select("user_id,name,artist_name,plan,trial_start,current_period_end")
      .like("plan", "mensal_%").order("user_id").range(from, to));
  if (users.length === 0) return [];

  const lastPaidAt = new Map<string, number>();
  for (const ids of chunk(users.map((u: any) => u.user_id), 200)) {
    const { data, error } = await supabase.from("pending_payments").select("user_id,activated_at,status")
      .in("user_id", ids).in("status", ["activated", "approved"]).not("activated_at", "is", null);
    if (error) throw error;
    for (const p of data ?? []) {
      const t = new Date(p.activated_at).getTime();
      if (Number.isNaN(t)) continue;
      if (!lastPaidAt.has(p.user_id) || t > lastPaidAt.get(p.user_id)!) lastPaidAt.set(p.user_id, t);
    }
  }

  const TRIGGER_DAYS = new Set([5, 3, 1, 0]);
  const out: Candidate[] = [];
  for (const u of users) {
    let expiryMs: number | null = null;
    if (u.current_period_end) {
      const t = new Date(u.current_period_end).getTime();
      if (!Number.isNaN(t) && t > br.nowMs - 2 * DAY_MS) expiryMs = t;
    }
    if (expiryMs === null) {
      const trial = u.trial_start ? new Date(u.trial_start).getTime() : NaN;
      const candidates = [lastPaidAt.get(u.user_id) ?? null, Number.isNaN(trial) ? null : trial].filter((v): v is number => v !== null);
      if (candidates.length === 0) continue;
      const activation = Math.max(...candidates);
      if (activation > br.nowMs) continue;
      expiryMs = activation + 30 * DAY_MS;
    }
    const expiryDate = brDateOf(expiryMs, br);
    const days = dayIndex(expiryDate) - dayIndex(br.date);
    if (!TRIGGER_DAYS.has(days)) continue;

    const name = displayName(u);
    const when = days === 0 ? "termina hoje" : days === 1 ? "termina amanhã" : `termina em ${days} dias (${fmtDayMonth(expiryDate)})`;
    const fallback = withName(name, `seu acesso mensal ${when}. Não há cobrança automática: se quiser continuar, a renovação é feita por você no app. 💙`);
    out.push({
      userId: u.user_id,
      eventKey: `${expiryDate}:${days}`,
      title: days === 0 ? "Seu acesso termina hoje" : days === 1 ? "Seu acesso termina amanhã" : `Seu acesso termina em ${days} dias`,
      body: pickBody(text, { user_name: name, days, expiry_date: fmtDayMonth(expiryDate) }, fallback, { dayDiff: days }),
      url: "/planos",
    });
  }
  return out;
}

export const AUTOMATIONS: Record<string, (ctx: Ctx, config: any, text: string) => Promise<Candidate[]>> = {
  show_reminder: showReminder,
  checklist_reminder: checklistReminder,
  pending_payment: pendingPayment,
  monthly_goal: monthlyGoal,
  goal_reminder: goalReminder,
  low_performance: lowPerformance,
  inactivity,
  weekly_motivation: weeklyMotivation,
  plan_expiring: planExpiring,
};

