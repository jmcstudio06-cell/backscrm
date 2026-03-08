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
 
const AUTOMATION_CONFIG = [
  {
    key: "show_reminder",
    icon: Bell,
    title: "Lembrete de Show",
    description: "Enviar notificação X horas antes de um show agendado",
    configField: "hours_before",
    configLabel: "Horas antes do show",
    configType: "number",
    defaultConfig: { hours_before: 24 },
  },
  {
    key: "pending_payment",
    icon: DollarSign,
    title: "Cachê Pendente",
    description: "Notificar quando existir show realizado com pagamento pendente",
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
    description: "Notificar usuários que não agendaram shows nos últimos 30 dias",
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
   { value: "/crm", label: "Radar de Shows" },
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
  const [runningAutomations, setRunningAutomations] = useState(false);
 
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
         // Initialize editing states
         const texts: Record<string, string> = {};
         const configs: Record<string, number> = {};
         settingsResult.data.forEach((s: NotificationSetting) => {
           texts[s.setting_key] = s.notification_text || "";
           const config = parseConfig(s.config);
            if (config.hours_before) configs[`${s.setting_key}_hours_before`] = config.hours_before as number;
            if (config.days_inactive) configs[`${s.setting_key}_days_inactive`] = config.days_inactive as number;
            if (config.interval_days) configs[`${s.setting_key}_interval_days`] = config.interval_days as number;
         });
         setEditingTexts(texts);
         setEditingConfigs(configs);
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
       const newConfig: Record<string, unknown> = {};
 
       if (automationConfig?.configField) {
         const configValue = editingConfigs[`${settingKey}_${automationConfig.configField}`];
         if (configValue) {
           newConfig[automationConfig.configField] = configValue;
         }
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

  const runAutomationsNow = async () => {
    setRunningAutomations(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-automated-notifications", {
        body: {},
      });

      if (error) throw error;

      const sent = data?.sent || 0;
      if (sent > 0) {
        toast.success(`🔔 Automações executadas! ${sent} notificações enviadas.`);
      } else {
        toast.info("Automações executadas, mas nenhum usuário se enquadrou nos critérios.");
      }

      fetchData();
    } catch (error) {
      console.error("Error running automations:", error);
      toast.error("Erro ao executar automações");
    } finally {
      setRunningAutomations(false);
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
      // Get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast.error("Você precisa estar logado para enviar notificações");
        return;
      }

      // Call edge function to send push via OneSignal
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

      // Reset form
      setManualTitle("");
      setManualMessage("");
      setManualActionUrl("");
      setManualAudience("all");

      // Refresh history
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Automações
                </CardTitle>
                <CardDescription className="mt-1">
                  Configure notificações automáticas baseadas em ações dos usuários
                </CardDescription>
              </div>
              <Button
                onClick={runAutomationsNow}
                disabled={runningAutomations}
                variant="outline"
                size="sm"
              >
                {runningAutomations ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Executar Agora
              </Button>
            </div>
          </CardHeader>
         <CardContent className="space-y-6">
           {AUTOMATION_CONFIG.map((automation) => {
             const setting = settings.find((s) => s.setting_key === automation.key);
             const isEnabled = setting?.is_enabled || false;
             const Icon = automation.icon;
 
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
                         Variáveis disponíveis: {"{show_title}"}, {"{remaining}"}, {"{user_name}"}
                       </p>
                     </div>
 
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
                   <p className="font-medium text-amber-900">Push Notifications em PWA</p>
                   <p className="text-sm text-amber-800 mt-1">
                     Para receber notificações, os usuários precisam instalar o app (PWA) e permitir
                     notificações no navegador. As automações serão executadas por um job agendado.
                   </p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </CardContent>
       </Card>
 
       {/* History Section */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <History className="h-5 w-5" />
             Histórico de Notificações
           </CardTitle>
            <CardDescription>
              Histórico das últimas 48 horas (limpo automaticamente)
            </CardDescription>
         </CardHeader>
         <CardContent>
           {history.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
               <p>Nenhuma notificação enviada ainda</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Data</TableHead>
                     <TableHead>Tipo</TableHead>
                     <TableHead>Título</TableHead>
                     <TableHead className="hidden md:table-cell">Mensagem</TableHead>
                     <TableHead>Público</TableHead>
                     <TableHead className="text-right">Alcance</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {history.map((notification) => (
                     <TableRow key={notification.id}>
                       <TableCell className="whitespace-nowrap">
                         {format(new Date(notification.sent_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                       </TableCell>
                       <TableCell>{getNotificationTypeBadge(notification.notification_type)}</TableCell>
                       <TableCell className="font-medium">
                         {notification.title}
                         {notification.action_url && (
                           <ExternalLink className="inline h-3 w-3 ml-1 text-muted-foreground" />
                         )}
                       </TableCell>
                       <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                         {notification.message}
                       </TableCell>
                       <TableCell>
                         <Badge variant="outline">{getAudienceLabel(notification.target_audience)}</Badge>
                       </TableCell>
                       <TableCell className="text-right font-medium">
                         {notification.users_reached}
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }