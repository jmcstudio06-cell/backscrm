import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Bell, 
  Send, 
  Clock, 
  DollarSign, 
  Target, 
  UserX, 
  Settings2,
  History,
  Loader2,
  Info,
  ExternalLink,
  TrendingDown,
  CalendarCheck,
  Play,
  ClipboardList,
  Sparkles,
  Calendar,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationSetting {
  id: string;
  setting_key: string;
  is_enabled: boolean;
  config: unknown;
  notification_text: string | null;
}

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  action_url: string | null;
  notification_type: string;
  target_audience: string;
  users_reached: number;
  sent_at: string;
}

// Helper to safely parse config
const parseConfig = (config: unknown): Record<string, unknown> => {
  if (config && typeof config === "object" && !Array.isArray(config)) {
    return config as Record<string, unknown>;
  }
  return {};
};

// Placeholders each automation fills with the client's real data (see run-automated-notifications).
// If a placeholder has no value for a client, or the text contradicts the data, the built-in message is used.
const AUTOMATION_VARIABLES: Record<string, string[]> = {
  show_reminder: ["user_name", "show_title", "show_date", "show_time", "venue", "when"],
  checklist_reminder: ["user_name", "show_title", "show_date", "show_time", "venue", "when"],
  pending_payment: ["user_name", "count", "amount", "show_title", "show_date"],
  monthly_goal: ["user_name", "goal_name", "current", "target", "remaining", "percent", "month"],
  goal_reminder: ["user_name", "goals_summary", "month", "interval_days"],
  low_performance: ["user_name", "last_show_date"],
  inactivity: ["user_name", "days"],
  weekly_motivation: ["user_name"],
  plan_expiring: ["user_name", "days", "expiry_date"],
};

interface AutomationPreview {
  eligible: number;
  alreadySent: number;
  previews: { user: string; title: string; body: string }[];
  error?: string;
}

const AUTOMATION_CONFIG = [
  {
    key: "show_reminder",
    icon: Bell,
    title: "Lembrete de Show",
    description: "Lembrar X horas antes de cada show confirmado (nunca em negociação ou cancelado), com data, hora e local",
    configField: "hours_before",
    configLabel: "Horas antes do show",
    configType: "number",
    defaultConfig: { hours_before: 24 },
  },
  {
    key: "pending_payment",
    icon: DollarSign,
    title: "Cachê Pendente",
    description: "Avisar o total de cachês a receber de shows passados, com os mesmos valores da tela Cobranças",
    configField: null,
    configLabel: null,
    configType: null,
    defaultConfig: {},
  },
  {
    key: "monthly_goal",
    icon: Target,
    title: "Meta Mensal",
    description: "Notificar quando o usuário estiver abaixo do ritmo esperado da meta",
    configField: null,
    configLabel: null,
    configType: null,
    defaultConfig: {},
  },
  {
    key: "inactivity",
    icon: UserX,
    title: "Inatividade",
    description: "Notificar quando o usuário ficar X dias sem acessar o app",
    configField: "days_inactive",
    configLabel: "Dias de inatividade",
    configType: "number",
    defaultConfig: { days_inactive: 7 },
  },
  {
    key: "goal_reminder",
    icon: CalendarCheck,
    title: "Lembrete de Metas (periódico)",
    description: "Lembrar o usuário de conferir suas metas periodicamente",
    configField: "interval_days",
    configLabel: "Intervalo em dias",
    configType: "number",
    defaultConfig: { interval_days: 10 },
  },
  {
    key: "low_performance",
    icon: TrendingDown,
    title: "Desempenho Baixo",
    description: "Avisar quem está sem shows na agenda há mais de 30 dias (e sem próximos shows), com a data do último show",
    configField: null,
    configLabel: null,
    configType: null,
    defaultConfig: {},
  },
  {
    key: "checklist_reminder",
    icon: ClipboardList,
    title: "Lembrete de Checklist",
    description: "Lembrar de revisar o checklist dos shows confirmados nas próximas 48h",
    configField: null,
    configLabel: null,
    configType: null,
    defaultConfig: {},
  },
  {
    key: "weekly_motivation",
    icon: Sparkles,
    title: "Motivação Semanal",
    description: "Enviar mensagem motivacional semanal para usuários ativos",
    configField: null,
    configLabel: null,
    configType: null,
    defaultConfig: {},
  },
  {
    key: "plan_expiring",
    icon: Calendar,
    title: "Mensalidade Vencendo",
    description:
      "Avisar clientes do plano mensal 5, 3, 1 e 0 dias antes do vencimento (renove para manter o benefício mensal — caso contrário só fica disponível o plano anual).",
    configField: null,
    configLabel: null,
    configType: null,
    defaultConfig: {},
  },
];

const ACTION_URLS = [
  { value: "/dashboard", label: "Dashboard" },
  { value: "/agenda", label: "Agenda de Shows" },
  { value: "/financeiro", label: "Financeiro" },
  { value: "/metas", label: "Metas" },
  { value: "/crm", label: "CRM do Artista" },
  { value: "/checklist", label: "Checklist" },
];

const TARGET_AUDIENCES = [
  { value: "all", label: "Todos os usuários" },
  { value: "active", label: "Usuários ativos" },
  { value: "inactive", label: "Usuários inativos" },
];

export function NotificationsAdminPanel() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [savingSettings, setSavingSettings] = useState<Record<string, boolean>>({});

  // Manual notification form
  const [manualTitle, setManualTitle] = useState("");
  const [manualMessage, setManualMessage] = useState("");
  const [manualActionUrl, setManualActionUrl] = useState("");
  const [manualAudience, setManualAudience] = useState("all");

  const [editingTexts, setEditingTexts] = useState<Record<string, string>>({});
  const [editingConfigs, setEditingConfigs] = useState<Record<string, number>>({});
  const [editingTimes, setEditingTimes] = useState<Record<string, string>>({});
  const [editingIntervals, setEditingIntervals] = useState<Record<string, number>>({});
  const [runningIndividual, setRunningIndividual] = useState<Record<string, boolean>>({});
  const [previews, setPreviews] = useState<Record<string, AutomationPreview>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsResult, historyResult] = await Promise.all([
        supabase
          .from("notification_settings")
          .select("*")
          .order("setting_key"),
        supabase
          .from("notification_history")
          .select("*")
          .order("sent_at", { ascending: false })
          .limit(50),
      ]);

      if (settingsResult.data) {
        setSettings(settingsResult.data as NotificationSetting[]);
        const texts: Record<string, string> = {};
        const configs: Record<string, number> = {};
        const times: Record<string, string> = {};
        const intervals: Record<string, number> = {};
        settingsResult.data.forEach((s: NotificationSetting) => {
          texts[s.setting_key] = s.notification_text || "";
          const config = parseConfig(s.config);
          if (config.hours_before) configs[`${s.setting_key}_hours_before`] = config.hours_before as number;
          if (config.days_inactive) configs[`${s.setting_key}_days_inactive`] = config.days_inactive as number;
          if (config.interval_days) configs[`${s.setting_key}_interval_days`] = config.interval_days as number;
          if (config.scheduled_time) times[s.setting_key] = config.scheduled_time as string;
          if (config.repeat_every_days) intervals[s.setting_key] = config.repeat_every_days as number;
        });
        setEditingTexts(texts);
        setEditingConfigs(configs);
        setEditingTimes(times);
        setEditingIntervals(intervals);
      }

      if (historyResult.data) {
        setHistory(historyResult.data);
      }
    } catch (error) {
      console.error("Error fetching notification data:", error);
      toast.error("Erro ao carregar dados de notificações");
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (settingKey: string, enabled: boolean) => {
    setSavingSettings((prev) => ({ ...prev, [settingKey]: true }));
    try {
      const { error } = await supabase
        .from("notification_settings")
        .update({ is_enabled: enabled })
        .eq("setting_key", settingKey);

      if (error) throw error;

      setSettings((prev) =>
        prev.map((s) => (s.setting_key === settingKey ? { ...s, is_enabled: enabled } : s))
      );
      toast.success(enabled ? "Automação ativada" : "Automação desativada");
    } catch (error) {
      console.error("Error toggling automation:", error);
      toast.error("Erro ao atualizar automação");
    } finally {
      setSavingSettings((prev) => ({ ...prev, [settingKey]: false }));
    }
  };

  const saveAutomationSettings = async (settingKey: string) => {
    setSavingSettings((prev) => ({ ...prev, [`save_${settingKey}`]: true }));
    try {
      const automationConfig = AUTOMATION_CONFIG.find((a) => a.key === settingKey);
      
      // Get existing config to preserve last_sent_at
      const existingSetting = settings.find((s) => s.setting_key === settingKey);
      const existingConfig = parseConfig(existingSetting?.config);
      
      const newConfig: Record<string, unknown> = {};

      if (automationConfig?.configField) {
        const configValue = editingConfigs[`${settingKey}_${automationConfig.configField}`];
        if (configValue) {
          newConfig[automationConfig.configField] = configValue;
        }
      }

      // Save scheduled time
      if (editingTimes[settingKey]) {
        newConfig.scheduled_time = editingTimes[settingKey];
      }

      // Save repeat interval in days
      if (editingIntervals[settingKey]) {
        newConfig.repeat_every_days = editingIntervals[settingKey];
      }

      // Preserve last_sent_at
      if (existingConfig.last_sent_at) {
        newConfig.last_sent_at = existingConfig.last_sent_at;
      }

      const { error } = await supabase
        .from("notification_settings")
        .update({
          notification_text: editingTexts[settingKey],
          config: newConfig as Json,
        })
        .eq("setting_key", settingKey);

      if (error) throw error;

      setSettings((prev) =>
        prev.map((s) =>
          s.setting_key === settingKey
            ? { ...s, notification_text: editingTexts[settingKey], config: newConfig }
            : s
        )
      );
      toast.success("Configuração salva com sucesso");
    } catch (error) {
      console.error("Error saving automation settings:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setSavingSettings((prev) => ({ ...prev, [`save_${settingKey}`]: false }));
    }
  };

  // Step 1: preview exactly what each client would receive. Nothing is sent.
  const previewAutomation = async (settingKey: string) => {
    setRunningIndividual((prev) => ({ ...prev, [settingKey]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("run-automated-notifications", {
        body: { automation_key: settingKey, dry_run: true },
      });
      if (error) throw error;
      const result = (data?.results ?? []).find((r: { key: string }) => r.key === settingKey);
      setPreviews((prev) => ({
        ...prev,
        [settingKey]: result ?? { eligible: 0, alreadySent: 0, previews: [] },
      }));
    } catch (error) {
      console.error("Error previewing automation:", error);
      toast.error("Erro ao gerar a prévia");
    } finally {
      setRunningIndividual((prev) => ({ ...prev, [settingKey]: false }));
    }
  };

  // Step 2: real send, only after the admin has seen the preview.
  const runSingleAutomation = async (settingKey: string) => {
    setRunningIndividual((prev) => ({ ...prev, [settingKey]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("run-automated-notifications", {
        body: { automation_key: settingKey },
      });

      if (error) throw error;

      const result = (data?.results ?? []).find((r: { key: string }) => r.key === settingKey);
      const automation = AUTOMATION_CONFIG.find((a) => a.key === settingKey);
      if (result?.error) {
        toast.error(`${automation?.title}: ${result.error}`);
      } else if ((result?.sent ?? 0) > 0) {
        toast.success(`🔔 ${automation?.title}: ${result.sent} clientes receberam a notificação.`);
      } else {
        toast.info(`${automation?.title}: nenhum envio novo (ninguém se enquadra ou já foi avisado).`);
      }
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[settingKey];
        return next;
      });
      fetchData();
    } catch (error) {
      console.error("Error running automation:", error);
      toast.error("Erro ao executar automação");
    } finally {
      setRunningIndividual((prev) => ({ ...prev, [settingKey]: false }));
    }
  };

  const sendManualNotification = async () => {
    if (!manualTitle.trim() || !manualMessage.trim()) {
      toast.error("Preencha o título e a mensagem");
      return;
    }

    if (manualMessage.length > 120) {
      toast.error("A mensagem deve ter no máximo 120 caracteres");
      return;
    }

    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast.error("Você precisa estar logado para enviar notificações");
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-push-notification", {
        body: {
          title: manualTitle,
          body: manualMessage,
          url: manualActionUrl || "/dashboard",
          target_audience: manualAudience,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro ao enviar notificações");
      }

      console.log("Push response:", data);

      const sentCount = data?.sent || 0;
      const notificationId = data?.notification_id;

      if (sentCount > 0) {
        toast.success(`🔔 ${sentCount} notificações enviadas com sucesso!`);
      } else if (notificationId) {
        toast.info("Notificação enviada", {
          description: "Será entregue aos usuários inscritos.",
        });
      } else {
        toast.warning("Nenhum usuário inscrito para notificações", {
          description: "Os usuários precisam ativar notificações no app.",
        });
      }

      setManualTitle("");
      setManualMessage("");
      setManualActionUrl("");
      setManualAudience("all");

      fetchData();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Erro ao enviar notificação", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setSending(false);
    }
  };

  const getNotificationTypeBadge = (type: string) => {
    if (type === "manual") {
      return <Badge variant="secondary">Manual</Badge>;
    }
    const automation = AUTOMATION_CONFIG.find((a) => a.key === type);
    return (
      <Badge variant="outline" className="bg-primary/10">
        {automation?.title || type}
      </Badge>
    );
  };

  const getAudienceLabel = (audience: string) => {
    return TARGET_AUDIENCES.find((a) => a.value === audience)?.label || audience;
  };

  const getLastSentAt = (settingKey: string) => {
    const setting = settings.find((s) => s.setting_key === settingKey);
    if (!setting) return null;
    const config = parseConfig(setting.config);
    return config.last_sent_at as string | null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Manual Notification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Notificação Manual
          </CardTitle>
          <CardDescription>
            Envie notificações push instantâneas para os usuários do aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título da notificação</Label>
              <Input
                placeholder="Ex: 🎤 Novidade no app!"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Público-alvo</Label>
              <Select value={manualAudience} onValueChange={setManualAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_AUDIENCES.map((audience) => (
                    <SelectItem key={audience.value} value={audience.value}>
                      {audience.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Mensagem ({manualMessage.length}/120 caracteres)
            </Label>
            <Textarea
              placeholder="Ex: Confira as novas funcionalidades que preparamos para você!"
              value={manualMessage}
              onChange={(e) => setManualMessage(e.target.value.slice(0, 120))}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Ação ao clicar (opcional)</Label>
            <Select value={manualActionUrl} onValueChange={setManualActionUrl}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a página de destino" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_URLS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={sendManualNotification}
            disabled={sending || !manualTitle.trim() || !manualMessage.trim()}
            className="w-full md:w-auto"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Notificação
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Automations Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Automações
            </CardTitle>
            <CardDescription className="mt-1">
              Configure notificações automáticas. Cada uma será enviada automaticamente no horário e intervalo configurado.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {AUTOMATION_CONFIG.map((automation) => {
            const setting = settings.find((s) => s.setting_key === automation.key);
            const isEnabled = setting?.is_enabled || false;
            const Icon = automation.icon;
            const lastSent = getLastSentAt(automation.key);

            return (
              <div key={automation.key} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {automation.title}
                        {isEnabled && (
                          <Badge variant="default" className="text-xs">
                            Ativo
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">{automation.description}</p>
                      {lastSent && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Último envio: {format(new Date(lastSent), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => toggleAutomation(automation.key, checked)}
                    disabled={savingSettings[automation.key]}
                  />
                </div>

                {isEnabled && (
                  <div className="pl-10 space-y-4">
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {automation.configField && (
                        <div className="space-y-2">
                          <Label>{automation.configLabel}</Label>
                          <Input
                            type="number"
                            value={editingConfigs[`${automation.key}_${automation.configField}`] || ""}
                            onChange={(e) =>
                              setEditingConfigs((prev) => ({
                                ...prev,
                                [`${automation.key}_${automation.configField}`]: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="max-w-[200px]"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Horário de envio
                        </Label>
                        <Input
                          type="time"
                          value={editingTimes[automation.key] || ""}
                          onChange={(e) =>
                            setEditingTimes((prev) => ({
                              ...prev,
                              [automation.key]: e.target.value,
                            }))
                          }
                          className="max-w-[200px]"
                          placeholder="Ex: 09:00"
                        />
                        <p className="text-xs text-muted-foreground">
                          Horário de Brasília
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Repetir a cada (dias)
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          value={editingIntervals[automation.key] || ""}
                          onChange={(e) =>
                            setEditingIntervals((prev) => ({
                              ...prev,
                              [automation.key]: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="max-w-[200px]"
                          placeholder="Ex: 7"
                        />
                        <p className="text-xs text-muted-foreground">
                          Deixe vazio para enviar diariamente
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Texto da notificação</Label>
                      <Textarea
                        value={editingTexts[automation.key] || ""}
                        onChange={(e) =>
                          setEditingTexts((prev) => ({
                            ...prev,
                            [automation.key]: e.target.value,
                          }))
                        }
                        placeholder="Digite o texto da notificação..."
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        <Info className="inline h-3 w-3 mr-1" />
                        Variáveis desta automação:{" "}
                        {(AUTOMATION_VARIABLES[automation.key] ?? []).map((v) => `{${v}}`).join(", ")}.
                        {" "}Deixe vazio para usar a mensagem padrão. Se faltar um dado do cliente ou o texto
                        contradizer os dados (ex.: "amanhã" para um show de hoje), a mensagem padrão é usada.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveAutomationSettings(automation.key)}
                        disabled={savingSettings[`save_${automation.key}`]}
                      >
                        {savingSettings[`save_${automation.key}`] ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Salvar Configuração
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => previewAutomation(automation.key)}
                        disabled={runningIndividual[automation.key]}
                      >
                        {runningIndividual[automation.key] ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        Ver prévia
                      </Button>
                    </div>

                    {previews[automation.key] && (
                      <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            {previews[automation.key].eligible} cliente(s) receberiam agora
                            {previews[automation.key].alreadySent > 0 &&
                              ` · ${previews[automation.key].alreadySent} já foram avisados deste evento`}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setPreviews((prev) => {
                                const next = { ...prev };
                                delete next[automation.key];
                                return next;
                              })
                            }
                          >
                            Fechar
                          </Button>
                        </div>
                        {previews[automation.key].error && (
                          <p className="text-sm text-destructive">{previews[automation.key].error}</p>
                        )}
                        {previews[automation.key].previews.length > 0 ? (
                          <ul className="space-y-2">
                            {previews[automation.key].previews.map((p, i) => (
                              <li key={i} className="rounded-md bg-background border p-3 text-sm">
                                <p className="text-xs text-muted-foreground">Para: {p.user}</p>
                                <p className="font-medium">{p.title}</p>
                                <p className="text-muted-foreground">{p.body}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Ninguém se enquadra agora (ou o cliente não tem notificações ativas no aparelho).
                          </p>
                        )}
                        {previews[automation.key].previews.length < previews[automation.key].eligible && (
                          <p className="text-xs text-muted-foreground">
                            Mostrando {previews[automation.key].previews.length} de {previews[automation.key].eligible}.
                          </p>
                        )}
                        {previews[automation.key].eligible > 0 && (
                          <Button
                            size="sm"
                            onClick={() => runSingleAutomation(automation.key)}
                            disabled={runningIndividual[automation.key] || !isEnabled}
                          >
                            {runningIndividual[automation.key] ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            Enviar agora para {previews[automation.key].eligible} cliente(s)
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Envio 100% Automático</p>
                  <p className="text-sm text-amber-800 mt-1">
                    As notificações são disparadas automaticamente pelo sistema no horário e intervalo configurado.
                    O botão "Testar Agora" é apenas para fins de teste. Os usuários precisam instalar o app (PWA) e permitir
                    notificações no navegador para recebê-las.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Envios
            </CardTitle>
            <CardDescription>
              Últimas 50 notificações enviadas (limpo automaticamente após 48h)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead className="text-center">Alcance</TableHead>
                    <TableHead>Enviado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{getNotificationTypeBadge(item.notification_type)}</TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {item.title}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {item.message}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.users_reached}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(item.sent_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
