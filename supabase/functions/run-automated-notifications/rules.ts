// Pure accuracy rules for automated notifications (dates, status, templates). No side effects.

export const TZ = "America/Sao_Paulo";
export const DAY_MS = 86_400_000;
export const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
export const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export interface BrNow {
  date: string; // YYYY-MM-DD (Brasília)
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  offsetMinutes: number; // local - UTC (e.g. -180)
  nowMs: number;
}

export function brNow(now = new Date()): BrNow {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  const year = Number(parts.year), month = Number(parts.month), day = Number(parts.day);
  const hour = Number(parts.hour), minute = Number(parts.minute);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const offsetMinutes = Math.round((localAsUtc - Math.floor(now.getTime() / 60000) * 60000) / 60000);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, year, month, day, hour, minute, offsetMinutes, nowMs: now.getTime() };
}

/** Calendar day number for a YYYY-MM-DD string (timezone-free). */
export function dayIndex(isoDate: string): number {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}
export const addDays = (isoDate: string, n: number) => new Date((dayIndex(isoDate) + n) * DAY_MS).toISOString().slice(0, 10);
export const isIsoDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v);

/** Brasília calendar date of a timestamp. */
export function brDateOf(ms: number, br: BrNow): string {
  return new Date(ms + br.offsetMinutes * 60000).toISOString().slice(0, 10);
}

/** Show start (date + "HH:MM[:SS]" in São Paulo) as epoch ms. */
export function showStartMs(date: string, time: string, br: BrNow): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m) return null;
  const [y, mo, d] = date.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, mo - 1, d, Number(m[1]), Number(m[2])) - br.offsetMinutes * 60000;
}

export const fmtDayMonth = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
export const fmtFullDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
export const fmtWeekdayDate = (iso: string) => `${WEEKDAYS[new Date(dayIndex(iso) * DAY_MS).getUTCDay()]}, ${fmtDayMonth(iso)}`;
export const fmtTime = (t: string | null | undefined) => (t && /^\d{1,2}:\d{2}/.test(t) ? t.slice(0, 5) : null);
export const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const fmtBRL = (v: number) => brl.format(v);
export const relDay = (diff: number) => (diff === 0 ? "hoje" : diff === 1 ? "amanhã" : `em ${diff} dias`);
export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

// Same aliases as src/lib/showStatus.ts (normalizeShowStatus).
export const SHOW_STATUS_ALIASES: Record<string, string> = {
  confirmado: "confirmed", confirmed: "confirmed", pendente: "pending", pending: "pending",
  agendado: "scheduled", scheduled: "scheduled", negociacao: "negotiation", "negociação": "negotiation",
  negotiation: "negotiation", realizado: "completed", finalizado: "completed", completed: "completed",
  parcial: "partial", partial: "partial", cancelado: "cancelled", cancelled: "cancelled",
};
export function normalizeShowStatus(status: string | null | undefined): string {
  if (!status) return "scheduled";
  const k = status.trim().toLowerCase();
  return SHOW_STATUS_ALIASES[k] || k;
}
// A reminder only makes sense for a show that is actually closed (not in negotiation, not cancelled).
export const REMINDER_STATUSES = new Set(["confirmed", "pending", "partial", "completed"]);
// Same as src/pages/Cobrancas.tsx (CHARGEABLE_STATUSES).
export const CHARGEABLE_STATUSES = new Set(["confirmed", "negotiation", "pending", "partial", "scheduled"]);
export const EXPIRED_PLANS = new Set(["expirado", "comprou_expirado"]);

// ---- Data helpers ----
export async function fetchAll<T = any>(build: (from: number, to: number) => any): Promise<T[]> {
  const out: T[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await build(from, from + size - 1);
    if (error) throw error;
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < size) break;
  }
  return out;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export interface ProfileLite { user_id: string; name: string | null; artist_name: string | null; plan: string | null }

export async function fetchProfiles(supabase: any, userIds: string[]): Promise<Map<string, ProfileLite>> {
  const map = new Map<string, ProfileLite>();
  for (const ids of chunk([...new Set(userIds)], 200)) {
    const { data, error } = await supabase.from("profiles").select("user_id,name,artist_name,plan").in("user_id", ids);
    if (error) throw error;
    for (const p of data ?? []) map.set(p.user_id, p);
  }
  return map;
}

export function displayName(p: ProfileLite | undefined): string | null {
  const artist = p?.artist_name?.trim();
  if (artist) return artist;
  const first = p?.name?.trim().split(/\s+/)[0];
  return first || null;
}
export const greet = (name: string | null) => (name ? `${name}, ` : "");
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** "Ana, seu show..." when there is a name, "Seu show..." when there isn't. */
export const withName = (name: string | null, sentence: string) => (name ? `${greet(name)}${sentence}` : capitalize(sentence));

// ---- Templates ----
export type Vars = Record<string, string | number | null | undefined>;

/** Fills {placeholders}. Returns null when the text is empty or any placeholder has no real value. */
export function renderTemplate(template: string, vars: Vars): string | null {
  if (!template || !template.trim()) return null;
  let missing = false;
  const out = template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key];
    if (v === undefined || v === null || String(v).trim() === "") {
      missing = true;
      return "";
    }
    return String(v);
  });
  if (missing) return null;
  return out.replace(/[ \t]+/g, " ").trim();
}

/** Rejects custom texts whose fixed wording contradicts the real data. */
export function contradicts(text: string, opts: { dayDiff?: number; forbid?: RegExp }): boolean {
  const t = text.toLowerCase();
  if (opts.dayDiff !== undefined) {
    // Unicode-aware word edges: "\b" does not treat "ã" as a letter.
    if (/(?<!\p{L})amanh[ãa](?!\p{L})/u.test(t) && opts.dayDiff !== 1) return true;
    if (/(?<!\p{L})hoje(?!\p{L})/u.test(t) && opts.dayDiff !== 0) return true;
  }
  if (opts.forbid && opts.forbid.test(text)) return true;
  return false;
}

export function pickBody(template: string, vars: Vars, fallback: string, guard: { dayDiff?: number; forbid?: RegExp } = {}): string {
  const custom = renderTemplate(template, vars);
  if (custom && !contradicts(custom, guard)) return custom;
  return fallback;
}

