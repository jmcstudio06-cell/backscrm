import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Cloud, Database, HardDrive, Activity, RefreshCw, Loader2, AlertTriangle,
  CheckCircle2, Timer, Mail, Users, Gauge, TrendingDown, Save,
} from "lucide-react";

interface CronJob { jobname: string; schedule: string; active: boolean }
interface TopTable { table_name: string; total_bytes: number; row_estimate: number }

interface CloudMetrics {
  db_size_bytes: number;
  connections_total: number;
  connections_active: number;
  max_connections: number;
  top_tables: TopTable[];
  cron_jobs: CronJob[];
  cron_runs_24h: number;
  cron_failures_24h: number;
  storage_bytes: number;
  storage_files: number;
  emails_24h: number;
  users_total: number;
  users_active_24h: number;
  shows_total: number;
  generated_at: string;
}

const BUDGET_KEY = "cloud_monthly_budget";
const RATE_KEY = "cloud_credits_per_day";

const fmtBytes = (b: number) => {
  if (!b) return "0 MB";
  const mb = b / 1024 / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
};

export function CloudUsagePanel() {
  const [metrics, setMetrics] = useState<CloudMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState("145");
  const [ratePerDay, setRatePerDay] = useState("0.79");

  const loadAll = async () => {
    setLoading(true);
    const [{ data, error }, { data: settings }] = await Promise.all([
      supabase.rpc("get_cloud_metrics" as never),
      supabase.from("app_settings").select("setting_key, setting_value").in("setting_key", [BUDGET_KEY, RATE_KEY]),
    ]);
    if (error) {
      toast.error("Não foi possível carregar os dados do Cloud");
    } else {
      setMetrics(data as unknown as CloudMetrics);
    }
    settings?.forEach(s => {
      if (s.setting_key === BUDGET_KEY && s.setting_value) setBudget(s.setting_value);
      if (s.setting_key === RATE_KEY && s.setting_value) setRatePerDay(s.setting_value);
    });
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const saveSettings = async () => {
    setSaving(true);
    const { error } = await supabase.from("app_settings").upsert([
      { setting_key: BUDGET_KEY, setting_value: budget },
      { setting_key: RATE_KEY, setting_value: ratePerDay },
    ], { onConflict: "setting_key" });
    setSaving(false);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Limites salvos");
  };

  const projection = useMemo(() => {
    const rate = parseFloat(ratePerDay.replace(",", ".")) || 0;
    const limit = parseFloat(budget.replace(",", ".")) || 0;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const usedSoFar = rate * dayOfMonth;
    const projected = rate * daysInMonth;
    const percent = limit > 0 ? Math.min((projected / limit) * 100, 200) : 0;
    const daysLeftUntilLimit = rate > 0 ? Math.max(Math.floor((limit - usedSoFar) / rate), 0) : 0;
    return { rate, limit, usedSoFar, projected, percent, daysLeftUntilLimit, dayOfMonth, daysInMonth };
  }, [ratePerDay, budget]);

  const risk = projection.percent >= 100 ? "high" : projection.percent >= 75 ? "medium" : "low";
  const riskStyle = {
    high: { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Risco alto" },
    medium: { text: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Atenção" },
    low: { text: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Saudável" },
  }[risk];

  const dbPercentOfDisk = metrics ? Math.min((metrics.db_size_bytes / (8 * 1024 * 1024 * 1024)) * 100, 100) : 0;
  const connPercent = metrics && metrics.max_connections
    ? Math.min((metrics.connections_total / metrics.max_connections) * 100, 100) : 0;

  const activeCrons = metrics?.cron_jobs.filter(j => j.active) ?? [];

  const alerts: { level: "high" | "medium"; text: string; action: string }[] = [];
  if (metrics) {
    if (risk === "high") alerts.push({ level: "high", text: `A projeção do mês (${projection.projected.toFixed(1)} créditos) passa do seu limite de ${projection.limit.toFixed(0)}.`, action: "Reduza a frequência dos jobs agendados e evite deixar tarefas rodando de madrugada." });
    else if (risk === "medium") alerts.push({ level: "medium", text: `Você deve chegar a ${projection.percent.toFixed(0)}% do limite neste mês.`, action: "Monitore por 3 dias e reduza jobs se a média subir." });
    if (connPercent > 70) alerts.push({ level: "high", text: `Conexões em ${connPercent.toFixed(0)}% do máximo.`, action: "Feche assinaturas em tempo real não usadas nas telas." });
    if (metrics.cron_runs_24h > 60) alerts.push({ level: "medium", text: `${metrics.cron_runs_24h} execuções agendadas nas últimas 24h.`, action: "Cada execução liga o processamento: diminua para 2x ao dia onde der." });
    if (metrics.cron_failures_24h > 0) alerts.push({ level: "medium", text: `${metrics.cron_failures_24h} execuções agendadas falharam nas últimas 24h.`, action: "Falhas repetem trabalho e gastam sem entregar nada — vale investigar." });
    if (metrics.storage_bytes > 2 * 1024 * 1024 * 1024) alerts.push({ level: "medium", text: `Armazenamento em ${fmtBytes(metrics.storage_bytes)}.`, action: "Apague fotos antigas e comprima imagens antes do upload." });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">Consumo do Cloud</h3>
            <p className="text-xs text-muted-foreground">
              {metrics ? `Atualizado às ${new Date(metrics.generated_at).toLocaleTimeString("pt-BR")}` : "Carregando..."}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Atualizar</span>
        </Button>
      </div>

      {/* Risk / projection */}
      <Card className={`border ${riskStyle.border} ${riskStyle.bg}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Gauge className={`h-5 w-5 ${riskStyle.text}`} />
              <span className={`font-bold ${riskStyle.text}`}>{riskStyle.label}</span>
            </div>
            <Badge variant="outline" className={riskStyle.text}>
              {projection.percent.toFixed(0)}% do limite projetado
            </Badge>
          </div>
          <Progress value={Math.min(projection.percent, 100)} className="h-2.5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Usado no mês (estimado)</p>
              <p className="text-lg font-black">{projection.usedSoFar.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Projeção do mês</p>
              <p className="text-lg font-black">{projection.projected.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Limite definido</p>
              <p className="text-lg font-black">{projection.limit.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dias até estourar</p>
              <p className="text-lg font-black">{projection.daysLeftUntilLimit}</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Estimativa baseada na média diária que você informou abaixo (dia {projection.dayOfMonth} de {projection.daysInMonth}).
            O valor oficial de créditos aparece em Configurações → Planos e créditos.
          </p>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Save className="h-4 w-4" /> Seus limites</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 items-end">
          <div>
            <Label className="text-xs">Limite de créditos por mês</Label>
            <Input value={budget} onChange={e => setBudget(e.target.value)} inputMode="decimal" />
          </div>
          <div>
            <Label className="text-xs">Média de créditos por dia</Label>
            <Input value={ratePerDay} onChange={e => setRatePerDay(e.target.value)} inputMode="decimal" />
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </CardContent>
      </Card>

      {/* Metrics grid */}
      {loading && !metrics ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando métricas...
        </div>
      ) : metrics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Database className="h-3.5 w-3.5" /> Banco de dados</div>
              <p className="text-xl font-black">{fmtBytes(metrics.db_size_bytes)}</p>
              <Progress value={dbPercentOfDisk} className="h-1.5 mt-2" />
              <p className="text-[10px] text-muted-foreground mt-1">{dbPercentOfDisk.toFixed(1)}% de 8 GB de disco</p>
            </CardContent></Card>

            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><HardDrive className="h-3.5 w-3.5" /> Arquivos</div>
              <p className="text-xl font-black">{fmtBytes(metrics.storage_bytes)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{metrics.storage_files} arquivos enviados</p>
            </CardContent></Card>

            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Activity className="h-3.5 w-3.5" /> Conexões</div>
              <p className="text-xl font-black">{metrics.connections_total}<span className="text-sm text-muted-foreground">/{metrics.max_connections}</span></p>
              <Progress value={connPercent} className="h-1.5 mt-2" />
              <p className="text-[10px] text-muted-foreground mt-1">{metrics.connections_active} ativas agora</p>
            </CardContent></Card>

            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Timer className="h-3.5 w-3.5" /> Tarefas agendadas 24h</div>
              <p className="text-xl font-black">{metrics.cron_runs_24h}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{metrics.cron_failures_24h} falhas · {activeCrons.length} jobs ativos</p>
            </CardContent></Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Users className="h-3.5 w-3.5" /> Usuários</div>
              <p className="text-xl font-black">{metrics.users_total}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{metrics.users_active_24h} ativos em 24h</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Mail className="h-3.5 w-3.5" /> E-mails 24h</div>
              <p className="text-xl font-black">{metrics.emails_24h}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Database className="h-3.5 w-3.5" /> Shows no banco</div>
              <p className="text-xl font-black">{metrics.shows_total}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Gauge className="h-3.5 w-3.5" /> Média por dia</div>
              <p className="text-xl font-black">{projection.rate.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">créditos/dia de Cloud</p>
            </CardContent></Card>
          </div>

          {/* Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> O que pode dar ruim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Nada crítico agora. Continue acompanhando a média diária.
                </div>
              ) : alerts.map((a, i) => (
                <div key={i} className={`rounded-lg p-3 border ${a.level === "high" ? "border-destructive/30 bg-destructive/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                  <p className="text-sm font-semibold">{a.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cron jobs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Timer className="h-4 w-4" /> Tarefas automáticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.cron_jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa agendada.</p>
              ) : metrics.cron_jobs.map(j => (
                <div key={j.jobname} className="flex items-center justify-between gap-2 text-sm border-b last:border-0 pb-2 last:pb-0">
                  <span className="font-medium truncate">{j.jobname}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{j.schedule}</code>
                    <Badge variant={j.active ? "default" : "secondary"} className="text-[10px]">{j.active ? "ativa" : "pausada"}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Biggest tables */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" /> Maiores tabelas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.top_tables.map(t => (
                <div key={t.table_name} className="flex items-center justify-between gap-2 text-sm border-b last:border-0 pb-2 last:pb-0">
                  <span className="font-medium truncate">{t.table_name}</span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {fmtBytes(t.total_bytes)} · ~{t.row_estimate.toLocaleString("pt-BR")} registros
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Playbook */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Como reduzir o gasto</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>• Mantenha o servidor do banco no tamanho <strong>Pequeno</strong> — subir de tamanho é o que mais encarece.</p>
              <p>• Menos tarefas agendadas: notificações 2x ao dia já cobrem o essencial.</p>
              <p>• Evite telas com atualização em tempo real ligada sem necessidade.</p>
              <p>• Comprima e limite o tamanho das imagens antes do upload (fotos grandes pesam no tráfego).</p>
              <p>• Limpe logs e notificações antigas periodicamente para o banco não crescer sem parar.</p>
              <p>• Confira este painel 1x por semana: se a média diária subir, corte tarefas antes do fim do mês.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
