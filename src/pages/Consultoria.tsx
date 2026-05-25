import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  GraduationCap,
  Plus,
  Calendar as CalendarIcon,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  ArrowLeft,
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAYS_OF_WEEK = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function nextDateForWeekday(weekday: number, time: string | null): Date {
  const now = new Date();
  const result = new Date(now);
  const diff = (weekday - now.getDay() + 7) % 7;
  result.setDate(now.getDate() + (diff === 0 ? 7 : diff));
  if (time) {
    const [h, m] = time.split(":").map(Number);
    result.setHours(h || 0, m || 0, 0, 0);
  }
  return result;
}

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: Clock },
  submitted: { label: "Enviado", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400", icon: Send },
  in_review: { label: "Em análise", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400", icon: Sparkles },
  published: { label: "Publicado", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
};

type ConsultoriaSession = {
  id: string;
  user_id: string;
  month: number;
  year: number;
  status: "draft" | "submitted" | "in_review" | "published";
  shows_realizados: number;
  faturamento: number;
  despesas: number;
  leads_recebidos: number;
  leads_convertidos: number;
  meta_shows: number;
  meta_faturamento: number;
  ticket_medio: number;
  principais_cidades: string | null;
  observacoes_cantor: string | null;
  pontos_fortes: string | null;
  pontos_melhoria: string | null;
  proximos_passos: string | null;
  anotacoes_admin: string | null;
  published_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

type ArtistRow = {
  user_id: string;
  name: string;
  email: string | null;
  artist_name: string | null;
  avatar_url: string | null;
  sessions_count: number;
  last_session_at: string | null;
};

const fmtBR = (v: number) =>
  `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", meta.color)}>
      <Icon className="w-3 h-3" /> {meta.label}
    </span>
  );
}

export default function Consultoria() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (adminLoading) {
    return (
      <Layout title="Consultoria">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Consultoria" subtitle={isAdmin ? "Painel de acompanhamento dos cantores" : "Acompanhamento da sua carreira"}>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Consultoria</h1>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Acompanhe a carreira de cada cantor e registre as análises mensais."
                  : "Preencha os dados do seu mês para receber a análise da consultoria."}
              </p>
            </div>
          </div>
        </header>

        {isAdmin ? <AdminView /> : <ArtistView userId={user!.id} />}
      </div>
    </Layout>
  );
}

/* -------------------- ADMIN VIEW -------------------- */

function AdminView() {
  const [artists, setArtists] = useState<ArtistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<ArtistRow | null>(null);

  useEffect(() => {
    loadArtists();
  }, []);

  async function loadArtists() {
    setLoading(true);
    const [{ data: profiles }, { data: sessions }] = await Promise.all([
      supabase.from("profiles").select("user_id, name, email, artist_name, avatar_url"),
      supabase.from("consultoria_sessions").select("user_id, created_at"),
    ]);

    const counts = new Map<string, { count: number; last: string | null }>();
    (sessions || []).forEach((s: any) => {
      const cur = counts.get(s.user_id) || { count: 0, last: null };
      cur.count += 1;
      if (!cur.last || s.created_at > cur.last) cur.last = s.created_at;
      counts.set(s.user_id, cur);
    });

    const rows: ArtistRow[] = (profiles || []).map((p: any) => ({
      user_id: p.user_id,
      name: p.name || "",
      email: p.email,
      artist_name: p.artist_name,
      avatar_url: p.avatar_url,
      sessions_count: counts.get(p.user_id)?.count || 0,
      last_session_at: counts.get(p.user_id)?.last || null,
    }));

    rows.sort((a, b) => {
      if (a.sessions_count !== b.sessions_count) return b.sessions_count - a.sessions_count;
      return (a.artist_name || a.name).localeCompare(b.artist_name || b.name);
    });

    setArtists(rows);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter(
      (a) =>
        (a.artist_name || "").toLowerCase().includes(q) ||
        (a.name || "").toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q),
    );
  }, [artists, search]);

  if (selectedUser) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setSelectedUser(null)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a lista
        </Button>
        <ArtistSessionsPanel
          userId={selectedUser.user_id}
          displayName={selectedUser.artist_name || selectedUser.name || "Artista"}
          isAdmin
        />
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cantor por nome, artista ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Nenhum cantor encontrado.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((a) => {
            const display = a.artist_name || a.name || "Artista";
            return (
              <button
                key={a.user_id}
                onClick={() => setSelectedUser(a)}
                className="text-left rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {a.avatar_url ? (
                      <img src={a.avatar_url} alt={display} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-primary">{display.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{display}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Sessões</div>
                    <div className="text-lg font-bold text-primary">{a.sessions_count}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------- ARTIST VIEW -------------------- */

function ArtistView({ userId }: { userId: string }) {
  return <ArtistSessionsPanel userId={userId} displayName="Minhas consultorias" isAdmin={false} />;
}

/* -------------------- SHARED SESSIONS PANEL -------------------- */

function ArtistSessionsPanel({
  userId,
  displayName,
  isAdmin,
}: {
  userId: string;
  displayName: string;
  isAdmin: boolean;
}) {
  const [sessions, setSessions] = useState<ConsultoriaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ConsultoriaSession | null>(null);
  const [creating, setCreating] = useState(false);
  const _now = new Date();
  const [newMonth, setNewMonth] = useState<number>(_now.getMonth() + 1);
  const [newYear, setNewYear] = useState<number>(_now.getFullYear());

  useEffect(() => {
    load();
  }, [userId]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("consultoria_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });
    if (error) toast.error("Erro ao carregar consultorias");
    setSessions((data as any) || []);
    setLoading(false);
  }

  async function createSession() {
    const existing = sessions.find((s) => s.month === newMonth && s.year === newYear);
    if (existing) {
      toast.info("Já existe uma consultoria nesse mês — abrindo.");
      setEditing(existing);
      setCreating(false);
      return;
    }
    const { data, error } = await supabase
      .from("consultoria_sessions")
      .insert({ user_id: userId, month: newMonth, year: newYear, status: "draft" })
      .select("*")
      .single();
    if (error) {
      toast.error("Não foi possível criar a sessão");
      return;
    }
    setSessions((prev) => [data as any, ...prev]);
    setEditing(data as any);
    setCreating(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-lg font-bold">{displayName}</h2>
        {isAdmin && (
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nova consultoria
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">
              {isAdmin
                ? "Este cantor ainda não tem nenhuma consultoria registrada."
                : "Nenhuma consultoria publicada ainda. Quando o admin publicar, aparecerá aqui."}
            </p>
            {isAdmin && (
              <Button onClick={() => setCreating(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Criar primeira consultoria
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} onOpen={() => setEditing(s)} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {creating && (
        <Dialog open onOpenChange={(o) => !o && setCreating(false)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Nova consultoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Selecione o mês/ano da consultoria para <strong>{displayName}</strong>.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Mês</Label>
                  <Select value={String(newMonth)} onValueChange={(v) => setNewMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES.map((m, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Ano</Label>
                  <Input type="number" value={newYear} onChange={(e) => setNewYear(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
                <Button onClick={createSession} className="gap-2">
                  <Plus className="w-4 h-4" /> Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editing && (
        <SessionEditor
          session={editing}
          isAdmin={isAdmin}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setSessions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditing(updated);
          }}
          onDeleted={(id) => {
            setSessions((prev) => prev.filter((p) => p.id !== id));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function SessionRow({
  session,
  onOpen,
  isAdmin,
}: {
  session: ConsultoriaSession;
  onOpen: () => void;
  isAdmin: boolean;
}) {
  const locked = !isAdmin && session.status !== "published" && session.status !== "draft" && session.status !== "submitted";
  // Singer can always open (read own draft / read published / view submitted).
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/50 transition-all"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">
            {MONTH_NAMES[session.month - 1]} / {session.year}
          </span>
        </div>
        <StatusPill status={session.status} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <Mini icon={CalendarIcon} label="Shows" value={String(session.shows_realizados || 0)} />
        <Mini icon={DollarSign} label="Faturamento" value={fmtBR(session.faturamento || 0)} />
        <Mini icon={Users} label="Leads" value={String(session.leads_recebidos || 0)} />
        <Mini icon={TrendingUp} label="Convertidos" value={String(session.leads_convertidos || 0)} />
      </div>
    </button>
  );
}

function Mini({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-sm font-semibold mt-0.5 truncate">{value}</div>
    </div>
  );
}

/* -------------------- SESSION EDITOR -------------------- */

function SessionEditor({
  session,
  isAdmin,
  onClose,
  onSaved,
  onDeleted,
}: {
  session: ConsultoriaSession;
  isAdmin: boolean;
  onClose: () => void;
  onSaved: (s: ConsultoriaSession) => void;
  onDeleted: (id: string) => void;
}) {
  const [form, setForm] = useState<ConsultoriaSession>(session);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(session), [session.id]);

  const isPublished = form.status === "published";
  const singerLocked = !isAdmin && isPublished;

  // For singer: only see admin fields if published. Otherwise hidden.
  const showAdminFields = isAdmin || isPublished;

  function update<K extends keyof ConsultoriaSession>(key: K, val: ConsultoriaSession[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function save(extra: Partial<ConsultoriaSession> = {}) {
    setSaving(true);
    const payload: any = {
      shows_realizados: Number(form.shows_realizados) || 0,
      faturamento: Number(form.faturamento) || 0,
      despesas: Number(form.despesas) || 0,
      leads_recebidos: Number(form.leads_recebidos) || 0,
      leads_convertidos: Number(form.leads_convertidos) || 0,
      meta_shows: Number(form.meta_shows) || 0,
      meta_faturamento: Number(form.meta_faturamento) || 0,
      ticket_medio: Number(form.ticket_medio) || 0,
      principais_cidades: form.principais_cidades,
      observacoes_cantor: form.observacoes_cantor,
      month: form.month,
      year: form.year,
    };
    if (isAdmin) {
      payload.pontos_fortes = form.pontos_fortes;
      payload.pontos_melhoria = form.pontos_melhoria;
      payload.proximos_passos = form.proximos_passos;
      payload.anotacoes_admin = form.anotacoes_admin;
    }
    Object.assign(payload, extra);

    const { data, error } = await supabase
      .from("consultoria_sessions")
      .update(payload)
      .eq("id", form.id)
      .select("*")
      .single();
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar");
      return null;
    }
    toast.success("Salvo");
    onSaved(data as any);
    return data as ConsultoriaSession;
  }

  async function submitForReview() {
    await save({ status: "submitted", submitted_at: new Date().toISOString() });
  }

  async function markInReview() {
    await save({ status: "in_review" });
  }

  async function publish() {
    await save({ status: "published", published_at: new Date().toISOString() });
  }

  async function unpublish() {
    await save({ status: "in_review", published_at: null });
  }

  async function remove() {
    if (!confirm("Excluir esta sessão de consultoria?")) return;
    const { error } = await supabase.from("consultoria_sessions").delete().eq("id", form.id);
    if (error) {
      toast.error("Erro ao excluir");
      return;
    }
    toast.success("Excluído");
    onDeleted(form.id);
  }

  const conversionRate =
    form.leads_recebidos > 0 ? Math.round((form.leads_convertidos / form.leads_recebidos) * 100) : 0;
  const lucro = (Number(form.faturamento) || 0) - (Number(form.despesas) || 0);
  const showsPct = form.meta_shows > 0 ? Math.min(100, Math.round((form.shows_realizados / form.meta_shows) * 100)) : 0;
  const fatPct =
    form.meta_faturamento > 0
      ? Math.min(100, Math.round((form.faturamento / form.meta_faturamento) * 100))
      : 0;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>
              {MONTH_NAMES[form.month - 1]} / {form.year}
            </span>
            <StatusPill status={form.status} />
          </DialogTitle>
        </DialogHeader>

        {/* Período (admin pode mudar) */}
        {isAdmin && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <Label className="text-xs">Mês</Label>
              <Select value={String(form.month)} onValueChange={(v) => update("month", Number(v) as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Ano</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => update("year", Number(e.target.value) as any)}
              />
            </div>
          </div>
        )}

        {/* DADOS DO MÊS - cantor preenche */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Dados do mês
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Dados informados pelo cantor."
                : singerLocked
                ? "Esta consultoria já foi publicada e está bloqueada para edição."
                : "Preencha conforme conversamos. Você pode salvar e voltar depois."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <NumberField label="Shows realizados" value={form.shows_realizados} onChange={(v) => update("shows_realizados", v)} disabled={singerLocked} />
              <NumberField label="Leads recebidos" value={form.leads_recebidos} onChange={(v) => update("leads_recebidos", v)} disabled={singerLocked} />
              <NumberField label="Leads convertidos" value={form.leads_convertidos} onChange={(v) => update("leads_convertidos", v)} disabled={singerLocked} />
              <NumberField label="Ticket médio (R$)" value={form.ticket_medio} onChange={(v) => update("ticket_medio", v)} step="0.01" disabled={singerLocked} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Faturamento (R$)" value={form.faturamento} onChange={(v) => update("faturamento", v)} step="0.01" disabled={singerLocked} />
              <NumberField label="Despesas (R$)" value={form.despesas} onChange={(v) => update("despesas", v)} step="0.01" disabled={singerLocked} />
            </div>
            <div>
              <Label className="text-xs">Principais cidades atendidas</Label>
              <Input
                value={form.principais_cidades || ""}
                onChange={(e) => update("principais_cidades", e.target.value)}
                placeholder="Ex: São Paulo, Campinas, Sorocaba"
                disabled={singerLocked}
              />
            </div>
            <div>
              <Label className="text-xs">Observações do cantor</Label>
              <Textarea
                rows={3}
                value={form.observacoes_cantor || ""}
                onChange={(e) => update("observacoes_cantor", e.target.value)}
                placeholder="Conte como foi o mês, dificuldades, vitórias..."
                disabled={singerLocked}
              />
            </div>
          </CardContent>
        </Card>

        {/* METAS */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Metas vs Realizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Meta de shows" value={form.meta_shows} onChange={(v) => update("meta_shows", v)} disabled={singerLocked} />
              <NumberField label="Meta de faturamento (R$)" value={form.meta_faturamento} onChange={(v) => update("meta_faturamento", v)} step="0.01" disabled={singerLocked} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Bar label={`Shows: ${form.shows_realizados}/${form.meta_shows || 0}`} pct={showsPct} />
              <Bar label={`Faturamento: ${fatPct}%`} pct={fatPct} />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              <Summary label="Lucro" value={fmtBR(lucro)} positive={lucro >= 0} />
              <Summary label="Conversão" value={`${conversionRate}%`} />
              <Summary label="Ticket médio" value={fmtBR(form.ticket_medio || 0)} />
            </div>
          </CardContent>
        </Card>

        {/* ANÁLISE DO ADMIN */}
        {showAdminFields && (
          <Card className="mb-4 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Análise da consultoria
              </CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Use estes campos durante a call. O cantor verá depois que você publicar."
                  : "Análise registrada pela consultoria."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-emerald-600">Pontos fortes</Label>
                <Textarea
                  rows={3}
                  value={form.pontos_fortes || ""}
                  onChange={(e) => update("pontos_fortes", e.target.value)}
                  disabled={!isAdmin}
                  placeholder="O que está funcionando bem..."
                />
              </div>
              <div>
                <Label className="text-xs text-amber-600">Pontos de melhoria</Label>
                <Textarea
                  rows={3}
                  value={form.pontos_melhoria || ""}
                  onChange={(e) => update("pontos_melhoria", e.target.value)}
                  disabled={!isAdmin}
                  placeholder="O que precisa ajustar..."
                />
              </div>
              <div>
                <Label className="text-xs text-primary">Próximos passos</Label>
                <Textarea
                  rows={3}
                  value={form.proximos_passos || ""}
                  onChange={(e) => update("proximos_passos", e.target.value)}
                  disabled={!isAdmin}
                  placeholder="Ações concretas até a próxima consultoria..."
                />
              </div>
              {isAdmin && (
                <div>
                  <Label className="text-xs">Anotações livres (privadas durante a call)</Label>
                  <Textarea
                    rows={3}
                    value={form.anotacoes_admin || ""}
                    onChange={(e) => update("anotacoes_admin", e.target.value)}
                    placeholder="Anotações livres da conversa..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!showAdminFields && (
          <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground mb-4">
            <Lock className="w-4 h-4 inline-block mr-1" />
            A análise aparecerá aqui quando a consultoria for publicada.
          </div>
        )}

        {/* AÇÕES */}
        <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
          {isAdmin && (
            <Button variant="ghost" className="text-destructive" onClick={remove}>
              Excluir
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Fechar</Button>

          {!isAdmin && !singerLocked && (
            <>
              <Button variant="outline" onClick={() => save()} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar rascunho"}
              </Button>
              {form.status === "draft" && (
                <Button onClick={async () => { await save(); await submitForReview(); }} disabled={saving} className="gap-2">
                  <Send className="w-4 h-4" /> Enviar para análise
                </Button>
              )}
            </>
          )}

          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => save()} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
              {form.status !== "in_review" && form.status !== "published" && (
                <Button variant="outline" onClick={async () => { await save(); await markInReview(); }} disabled={saving}>
                  Marcar em análise
                </Button>
              )}
              {form.status !== "published" ? (
                <Button onClick={async () => { await save(); await publish(); }} disabled={saving} className="gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Publicar para o cantor
                </Button>
              ) : (
                <Button variant="outline" onClick={unpublish} disabled={saving}>
                  Despublicar
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        step={step || "1"}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
    </div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Summary({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-sm font-bold mt-0.5",
          positive === true && "text-emerald-600",
          positive === false && "text-destructive",
        )}
      >
        {value}
      </div>
    </div>
  );
}
