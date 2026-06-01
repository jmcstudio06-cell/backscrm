import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
const CONSULTORIA_ALLOWED_DAYS = [1, 2, 3];
const CONSULTORIA_ALLOWED_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

function sanitizePreferredDays(days: number[] | null | undefined): number[] {
  if (!Array.isArray(days)) return [];
  return days.filter((day) => CONSULTORIA_ALLOWED_DAYS.includes(day));
}

function sanitizePreferredTime(time: string | null | undefined): string {
  if (!time) return "";
  return CONSULTORIA_ALLOWED_TIMES.includes(time) ? time : "";
}

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
  consultoria_active: boolean | null;
  sessions_count: number;
  last_session_at: string | null;
  consultoria_day_of_week: number | null;
  consultoria_time: string | null;
  consultoria_activated_at: string | null;
  consultoria_preferred_days: number[] | null;
  consultoria_preferred_period: string | null;
  next_consultoria_at: string | null;
  next_consultoria_type: string | null;
  next_consultoria_notes: string | null;
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
  const [manualScheduleOpen, setManualScheduleOpen] = useState(false);

  useEffect(() => {
    loadArtists();
  }, []);

  async function loadArtists() {
    setLoading(true);
    const [{ data: profiles }, { data: sessions }] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, name, email, artist_name, avatar_url, consultoria_day_of_week, consultoria_time, consultoria_activated_at, consultoria_active, consultoria_preferred_days, consultoria_preferred_period, next_consultoria_at, next_consultoria_type, next_consultoria_notes")
        .order("name"),
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
      consultoria_active: p.consultoria_active,
      sessions_count: counts.get(p.user_id)?.count || 0,
      last_session_at: counts.get(p.user_id)?.last || null,
      consultoria_day_of_week: p.consultoria_day_of_week,
      consultoria_time: p.consultoria_time,
      consultoria_activated_at: p.consultoria_activated_at,
      consultoria_preferred_days: sanitizePreferredDays(p.consultoria_preferred_days),
      consultoria_preferred_period: p.consultoria_preferred_period,
      next_consultoria_at: p.next_consultoria_at,
      next_consultoria_type: p.next_consultoria_type,
      next_consultoria_notes: p.next_consultoria_notes,
    }));

    rows.sort((a, b) => {
      // próximos agendados primeiro
      if (a.next_consultoria_at && !b.next_consultoria_at) return -1;
      if (!a.next_consultoria_at && b.next_consultoria_at) return 1;
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
  const requestedArtists = filtered.filter((a) => a.consultoria_active === true);
  const manualArtists = filtered.filter((a) => a.consultoria_active !== true);

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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cantor por nome, artista ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={manualScheduleOpen} onOpenChange={setManualScheduleOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Agendar sem pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Agendar para quem ainda não pediu consultoria</DialogTitle>
            </DialogHeader>
            {manualArtists.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum cantor disponível nessa lista.
              </div>
            ) : (
              <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1 sm:grid-cols-2">
                {manualArtists.map((artist) => (
                  <AdminArtistCard
                    key={artist.user_id}
                    artist={artist}
                    onSelect={setSelectedUser}
                    onUpdated={loadArtists}
                    showRequestHint
                  />
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : requestedArtists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            Nenhum cantor pediu consultoria ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {requestedArtists.map((artist) => (
            <AdminArtistCard
              key={artist.user_id}
              artist={artist}
              onSelect={setSelectedUser}
              onUpdated={loadArtists}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminArtistCard({
  artist,
  onSelect,
  onUpdated,
  showRequestHint = false,
}: {
  artist: ArtistRow;
  onSelect: (artist: ArtistRow) => void;
  onUpdated: () => void;
  showRequestHint?: boolean;
}) {
  const display = artist.artist_name || artist.name || "Artista";
  const prefDays = (artist.consultoria_preferred_days || []).map((d) => DAYS_OF_WEEK[d]?.slice(0, 3)).filter(Boolean).join(", ");
  const scheduled = artist.next_consultoria_at ? new Date(artist.next_consultoria_at) : null;
  const isApresentacao = artist.next_consultoria_type === "apresentacao";

  return (
    <div className="rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/50 transition-all">
      <button onClick={() => onSelect(artist)} className="w-full text-left">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden flex-shrink-0">
            {artist.avatar_url ? (
              <img src={artist.avatar_url} alt={display} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary">{display.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{display}</p>
            <p className="text-xs text-muted-foreground truncate">{artist.email}</p>
            {showRequestHint && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                Ainda nao pediu consultoria
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Sessões</div>
            <div className="text-lg font-bold text-primary">{artist.sessions_count}</div>
          </div>
        </div>
      </button>

      {(prefDays || artist.consultoria_preferred_period) && (
        <div className="mt-3 rounded-lg bg-muted/40 p-2 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Disponibilidade</div>
          {prefDays && <div className="capitalize">{prefDays}</div>}
          {artist.consultoria_preferred_period && (
            <div className="text-muted-foreground">{artist.consultoria_preferred_period}</div>
          )}
        </div>
      )}

      {scheduled && scheduled.getTime() > Date.now() - 1000 * 60 * 60 && (
        <div className={cn(
          "mt-2 rounded-lg p-2 text-xs border",
          isApresentacao ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
                         : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
        )}>
          <div className="font-semibold">
            {isApresentacao ? "Apresentação" : "Consultoria"} agendada
          </div>
          <div className="capitalize">
            {scheduled.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            {" • "}
            {scheduled.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )}

      <ScheduleConsultoriaButton artist={artist} onUpdated={onUpdated} />
    </div>
  );
}

function ScheduleConsultoriaButton({ artist, onUpdated }: { artist: ArtistRow; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const initialDate = artist.next_consultoria_at
    ? new Date(artist.next_consultoria_at).toISOString().slice(0, 10)
    : "";
  const initialTime = artist.next_consultoria_at
    ? new Date(artist.next_consultoria_at).toTimeString().slice(0, 5)
    : "14:00";
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [type, setType] = useState(artist.next_consultoria_type || "consultoria");
  const [notes, setNotes] = useState(artist.next_consultoria_notes || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!date || !time) {
      toast.error("Selecione data e horário");
      return;
    }
    setSaving(true);
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const dt = new Date(y, m - 1, d, hh, mm, 0);
    const { error } = await supabase
      .from("profiles")
      .update({
        consultoria_active: true,
        consultoria_activated_at: artist.consultoria_active ? artist.consultoria_activated_at : new Date().toISOString(),
        next_consultoria_at: dt.toISOString(),
        next_consultoria_type: type,
        next_consultoria_notes: notes || null,
      })
      .eq("user_id", artist.user_id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao agendar");
      return;
    }
    toast.success("Agendado!");
    setOpen(false);
    onUpdated();
  }

  async function clearSchedule() {
    if (!confirm("Remover agendamento?")) return;
    const { error } = await supabase
      .from("profiles")
      .update({ next_consultoria_at: null, next_consultoria_notes: null })
      .eq("user_id", artist.user_id);
    if (error) { toast.error("Erro"); return; }
    toast.success("Agendamento removido");
    setOpen(false);
    onUpdated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
          <CalendarIcon className="w-3.5 h-3.5" />
          {artist.next_consultoria_at ? "Reagendar" : "Agendar próxima"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Agendar para {artist.artist_name || artist.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="consultoria">Consultoria</SelectItem>
                <SelectItem value="apresentacao">Apresentação do app</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Horário</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Observação (opcional)</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Link da chamada, etc." />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            {artist.next_consultoria_at && (
              <Button variant="ghost" className="text-destructive" onClick={clearSchedule}>Remover</Button>
            )}
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------- ARTIST VIEW -------------------- */

function ArtistView({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ConsultoriaSession[]>([]);
  const [viewing, setViewing] = useState<ConsultoriaSession | null>(null);
  const [prefDays, setPrefDays] = useState<number[]>([]);
  const [prefPeriod, setPrefPeriod] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: prof }, { data: sess }] = await Promise.all([
        supabase
          .from("profiles")
          .select("consultoria_active, consultoria_preferred_days, consultoria_preferred_period, consultoria_activated_at, next_consultoria_at, next_consultoria_type, next_consultoria_notes")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("consultoria_sessions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "published")
          .order("year", { ascending: false })
          .order("month", { ascending: false }),
      ]);
      const sanitizedProfile = prof
        ? {
            ...prof,
            consultoria_preferred_days: sanitizePreferredDays(prof.consultoria_preferred_days),
          }
        : prof;
      setProfile(sanitizedProfile);
      if (sanitizedProfile?.consultoria_active && sanitizedProfile.consultoria_preferred_days?.length > 0) {
        setPrefDays(sanitizedProfile.consultoria_preferred_days as number[]);
      } else {
        setPrefDays([]);
      }
      if (sanitizedProfile?.consultoria_active && sanitizedProfile.consultoria_preferred_period) {
        setPrefPeriod(sanitizePreferredTime(sanitizedProfile.consultoria_preferred_period));
      } else {
        setPrefPeriod("");
      }
      setSessions((sess as any) || []);
      setLoading(false);
    })();
  }, [userId]);

  function toggleDay(i: number) {
    if (!CONSULTORIA_ALLOWED_DAYS.includes(i)) return;
    setPrefDays((prev) => prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort());
  }

  async function activate() {
    const sanitizedDays = sanitizePreferredDays(prefDays);
    if (sanitizedDays.length === 0) {
      toast.error("Selecione ao menos 1 dia da semana");
      return;
    }
    const sanitizedTime = sanitizePreferredTime(prefPeriod);
    if (!sanitizedTime) {
      toast.error("Selecione um horário entre 09:00 e 18:00");
      return;
    }
    setSaving(true);
    const payload = {
      consultoria_active: true,
      consultoria_preferred_days: sanitizedDays,
      consultoria_preferred_period: sanitizedTime,
      consultoria_activated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").update(payload).eq("user_id", userId);
    setSaving(false);
    if (error) { toast.error("Não foi possível salvar"); return; }
    toast.success("Disponibilidade salva! Em breve agendaremos sua consultoria.");
    setProfile({ ...profile, ...payload });
    setEditOpen(false);
  }

  async function deactivate() {
    if (!confirm("Deseja realmente desativar a consultoria mensal?")) return;
    const { error } = await supabase
      .from("profiles")
      .update({ consultoria_active: false })
      .eq("user_id", userId);
    if (error) { toast.error("Erro ao desativar"); return; }
    toast.success("Consultoria desativada");
    setProfile({ ...profile, consultoria_active: false });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const DayChips = () => (
    <div className="flex flex-wrap gap-2">
      {CONSULTORIA_ALLOWED_DAYS.map((i) => {
        const d = DAYS_OF_WEEK[i];
        const active = prefDays.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => toggleDay(i)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {d}
          </button>
        );
      })}
    </div>
  );

  // NÃO ATIVADO → tela de ativação
  if (!profile?.consultoria_active) {
    return (
      <Card className="max-w-2xl mx-auto border-primary/30">
        <CardHeader>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Quero ter consultoria mensal</CardTitle>
          <CardDescription>
            Uma vez por mês analisamos sua carreira juntos. Marque os dias da semana e o período que ficam melhores pra você —
            a equipe entra em contato e agenda a data e horário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs mb-2 block">Dias da semana que ficam melhores</Label>
            <DayChips />
          </div>
          <div>
            <Label className="text-xs">Horário preferido</Label>
            <Select value={prefPeriod} onValueChange={setPrefPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {CONSULTORIA_ALLOWED_TIMES.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
            ✦ Você só sinaliza sua disponibilidade. A equipe agenda a data exata e te avisa aqui no app.
          </div>
          <Button onClick={activate} disabled={saving} className="w-full gap-2" size="lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Salvar disponibilidade
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ATIVADO
  const scheduled = profile.next_consultoria_at ? new Date(profile.next_consultoria_at) : null;
  const hasScheduled = scheduled && scheduled.getTime() > Date.now() - 1000 * 60 * 60;
  const isApresentacao = profile.next_consultoria_type === "apresentacao";

  return (
    <div className="space-y-6">
      {/* PRÓXIMA CONSULTORIA / AGUARDANDO */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                {hasScheduled ? (isApresentacao ? "Próxima apresentação" : "Próxima consultoria") : "Aguardando agendamento"}
              </div>
              {hasScheduled ? (
                <>
                  <div className="text-2xl font-bold capitalize">
                    {scheduled!.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {scheduled!.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {profile.next_consultoria_notes && (
                    <p className="text-sm mt-2 text-foreground/80">{profile.next_consultoria_notes}</p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-base font-semibold">Em breve a equipe agenda sua próxima consultoria</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Sua disponibilidade:{" "}
                    <span className="capitalize">
                      {(profile.consultoria_preferred_days || []).map((d: number) => DAYS_OF_WEEK[d]).join(", ") || "—"}
                    </span>
                    {profile.consultoria_preferred_period ? ` • ${profile.consultoria_preferred_period}` : ""}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Alterar disponibilidade</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Minha disponibilidade</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs mb-2 block">Dias da semana</Label>
                      <DayChips />
                    </div>
                    <div>
                      <Label className="text-xs">Horário</Label>
                      <Select value={prefPeriod} onValueChange={setPrefPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONSULTORIA_ALLOWED_TIMES.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={activate} disabled={saving} className="w-full">
                      {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={deactivate}>
                Desativar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HISTÓRICO */}
      <div>
        <h2 className="text-lg font-bold mb-3">Relatórios de consultorias</h2>
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              Nenhum relatório publicado ainda. Após a sua primeira consultoria, ele aparecerá aqui.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <SessionRow key={s.id} session={s} onOpen={() => setViewing(s)} isAdmin={false} />
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <SessionEditor
          session={viewing}
          isAdmin={false}
          onClose={() => setViewing(null)}
          onSaved={(u) => { setSessions((p) => p.map((x) => x.id === u.id ? u : x)); setViewing(u); }}
          onDeleted={(id) => { setSessions((p) => p.filter((x) => x.id !== id)); setViewing(null); }}
        />
      )}
    </div>
  );
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
