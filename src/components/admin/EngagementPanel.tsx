import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Activity, MessageCircle, Search, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Row {
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  plan: string | null;
  last_seen: string | null;
  created_at: string;
}

type Bucket = "all" | "active" | "warm" | "cold" | "never";

const BUCKETS: { value: Bucket; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos (até 7 dias)" },
  { value: "warm", label: "Esfriando (8 a 30 dias)" },
  { value: "cold", label: "Sumidos (+30 dias)" },
  { value: "never", label: "Nunca entrou" },
];

const daysSince = (date: string | null) => {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / 86400000);
};

const relative = (date: string | null) => {
  if (!date) return "Nunca entrou";
  const d = daysSince(date) ?? 0;
  if (d === 0) return "Hoje";
  if (d === 1) return "Ontem";
  if (d < 30) return `Há ${d} dias`;
  const m = Math.floor(d / 30);
  return m === 1 ? "Há 1 mês" : `Há ${m} meses`;
};

const bucketOf = (r: Row): Bucket => {
  const d = daysSince(r.last_seen);
  if (d === null) return "never";
  if (d <= 7) return "active";
  if (d <= 30) return "warm";
  return "cold";
};

const bucketStyle: Record<Bucket, string> = {
  all: "",
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  warm: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  cold: "bg-destructive/10 text-destructive border-destructive/30",
  never: "bg-muted text-muted-foreground border-border",
};

export function EngagementPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [bucket, setBucket] = useState<Bucket>("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);

    // Planos pagos válidos — exclui trial, expirados, parceiros e sem plano
    const PAID_PLANS = [
      "mensal_starter", "mensal_profissional", "mensal_completo", "mensal_empresarial", "mensal_executivo",
      "anual_starter", "anual_profissional", "anual_completo", "anual_empresarial", "anual_executivo",
      // legados pagos
      "mensal", "essencial", "completo", "anual", "base",
    ];

    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, name, email, phone, plan, last_seen, created_at")
      .in("plan", PAID_PLANS)
      .order("last_seen", { ascending: true, nullsFirst: false })
      .limit(2000);

    if (error) toast.error("Não foi possível carregar os acessos");
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length, active: 0, warm: 0, cold: 0, never: 0 };
    rows.forEach(r => { c[bucketOf(r)]++; });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows
      .filter(r => bucket === "all" || bucketOf(r) === bucket)
      .filter(r => !term || (r.name || "").toLowerCase().includes(term) || (r.email || "").toLowerCase().includes(term))
      .sort((a, b) => {
        const av = a.last_seen ? new Date(a.last_seen).getTime() : 0;
        const bv = b.last_seen ? new Date(b.last_seen).getTime() : 0;
        return av - bv;
      });
  }, [rows, bucket, search]);

  const whatsapp = (r: Row) => {
    const digits = (r.phone || "").replace(/\D/g, "");
    if (!digits) { toast.error("Este artista não tem WhatsApp cadastrado"); return; }
    const first = (r.name || "").split(" ")[0] || "tudo bem";
    const msg = `Olá ${first}! Aqui é do Backstage Pro. Notei que faz um tempinho que você não organiza seus shows por aqui. Quer ajuda para colocar sua agenda e seu financeiro em ordem?`;
    const full = digits.length <= 11 ? `55${digits}` : digits;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Engajamento</CardTitle>
            <CardDescription>Última visita ao app dos clientes com plano pago — não conta apenas o login</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {BUCKETS.map(b => (
            <button
              key={b.value}
              onClick={() => setBucket(b.value)}
              className={`rounded-xl border p-3 text-left transition-all ${bucket === b.value ? "ring-2 ring-primary" : "hover:bg-muted/40"} ${b.value === "all" ? "bg-muted/30" : bucketStyle[b.value]}`}
            >
              <p className="text-2xl font-black leading-none">{counts[b.value] ?? 0}</p>
              <p className="text-[10px] font-semibold mt-1 opacity-80">{b.label}</p>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou e-mail" className="pl-9" />
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Nenhum artista neste filtro</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => {
              const b = bucketOf(r);
              return (
                <div key={r.user_id} className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{r.name || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${bucketStyle[b]}`}>{relative(r.last_seen)}</Badge>
                    <p className="text-[10px] text-muted-foreground mt-1 capitalize">{r.plan || "sem plano"}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => whatsapp(r)}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
