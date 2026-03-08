import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Send, Loader2, Bell, Sparkles, Gift, Megaphone, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const NOTIFICATION_TYPES = [
  { value: "update", label: "Atualização", icon: Sparkles },
  { value: "promo", label: "Promoção/Oferta", icon: Gift },
  { value: "tip", label: "Dica/Conteúdo", icon: Megaphone },
  { value: "general", label: "Geral", icon: Bell },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Todos os usuários" },
  { value: "by_plan", label: "Por plano" },
  { value: "specific_user", label: "Usuário específico" },
];

const PLAN_OPTIONS = [
  { value: "trial", label: "Trial" },
  { value: "mensal_starter", label: "Mensal Starter" },
  { value: "mensal_profissional", label: "Mensal Profissional" },
  { value: "mensal_completo", label: "Mensal Empresarial" },
  { value: "anual_starter", label: "Anual Starter" },
  { value: "anual_profissional", label: "Anual Profissional" },
  { value: "anual_completo", label: "Anual Empresarial" },
  { value: "expirado", label: "Expirados" },
];

const ACTION_URLS = [
  { value: "", label: "Nenhuma (abre notificações)" },
  { value: "/dashboard", label: "Dashboard" },
  { value: "/agenda", label: "Agenda" },
  { value: "/planos", label: "Planos" },
  { value: "/financeiro", label: "Financeiro" },
  { value: "/bonus", label: "Bônus" },
  { value: "/tutoriais", label: "Tutoriais" },
];

interface SentNotification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
}

export function AppNotificationsAdminPanel() {
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState("update");
  const [audience, setAudience] = useState("all");
  const [planFilter, setPlanFilter] = useState("");
  const [userId, setUserId] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [sendPush, setSendPush] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState<SentNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // User search for specific user
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<{ user_id: string; name: string | null; email: string | null }[]>([]);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("user_notifications" as any)
      .select("id, title, message, notification_type, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      // Deduplicate by title+created_at (since we insert per user)
      const seen = new Set<string>();
      const unique = (data as SentNotification[]).filter((n) => {
        const key = `${n.title}__${n.created_at}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setRecentNotifications(unique.slice(0, 10));
    }
    setLoadingHistory(false);
  };

  const searchUsers = async (term: string) => {
    setUserSearch(term);
    if (term.length < 2) { setUserResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, name, email")
      .or(`name.ilike.%${term}%,email.ilike.%${term}%`)
      .limit(5);
    if (data) setUserResults(data);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha o título e a mensagem");
      return;
    }

    if (audience === "by_plan" && !planFilter) {
      toast.error("Selecione um plano");
      return;
    }

    if (audience === "specific_user" && !userId) {
      toast.error("Selecione um usuário");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-app-notification", {
        body: {
          title,
          message,
          notification_type: notificationType,
          action_url: actionUrl || null,
          target_audience: audience,
          plan_filter: audience === "by_plan" ? planFilter : undefined,
          user_id: audience === "specific_user" ? userId : undefined,
          send_push: sendPush,
        },
      });

      if (error) throw error;

      const inserted = data?.inserted || 0;
      const pushSent = data?.push_sent || 0;

      toast.success(`🔔 ${inserted} notificações criadas${sendPush ? ` + ${pushSent} push enviados` : ""}!`);
      
      setTitle("");
      setMessage("");
      setActionUrl("");
      setAudience("all");
      setPlanFilter("");
      setUserId("");
      setUserSearch("");
      fetchRecent();
    } catch (err) {
      console.error("Error sending notification:", err);
      toast.error("Erro ao enviar notificação");
    } finally {
      setSending(false);
    }
  };

  const typeConfig = NOTIFICATION_TYPES.find((t) => t.value === notificationType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Enviar Notificação In-App
          </CardTitle>
          <CardDescription>
            Envie notificações que aparecem no sininho do app. Opcionalmente, envia push também.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type selection */}
          <div className="space-y-2">
            <Label>Tipo de notificação</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {NOTIFICATION_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setNotificationType(t.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      notificationType === t.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input placeholder="Ex: 🚀 Nova funcionalidade!" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Público-alvo</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional: Plan filter */}
          {audience === "by_plan" && (
            <div className="space-y-2">
              <Label>Filtrar por plano</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger><SelectValue placeholder="Selecione o plano" /></SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Conditional: User search */}
          {audience === "specific_user" && (
            <div className="space-y-2">
              <Label>Buscar usuário</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={userSearch}
                  onChange={(e) => searchUsers(e.target.value)}
                  className="pl-10"
                />
              </div>
              {userResults.length > 0 && (
                <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                  {userResults.map((u) => (
                    <button
                      key={u.user_id}
                      onClick={() => { setUserId(u.user_id); setUserSearch(u.name || u.email || ""); setUserResults([]); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        userId === u.user_id ? "bg-primary/5 font-semibold" : ""
                      }`}
                    >
                      {u.name || "Sem nome"} — <span className="text-muted-foreground">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Ex: Confira a nova funcionalidade de contratos automáticos!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ação ao clicar (opcional)</Label>
              <Select value={actionUrl} onValueChange={setActionUrl}>
                <SelectTrigger><SelectValue placeholder="Selecione destino" /></SelectTrigger>
                <SelectContent>
                  {ACTION_URLS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Também enviar Push?</Label>
              <div className="flex items-center gap-3 pt-1">
                <Switch checked={sendPush} onCheckedChange={setSendPush} />
                <span className="text-sm text-muted-foreground">{sendPush ? "Sim, enviar push" : "Apenas in-app"}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()} className="w-full md:w-auto">
            {sending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Enviar Notificação</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas Notificações Enviadas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : recentNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma notificação enviada ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Mensagem</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentNotifications.map((n) => {
                  const tc = NOTIFICATION_TYPES.find((t) => t.value === n.notification_type);
                  return (
                    <TableRow key={n.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{tc?.label || n.notification_type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{n.title}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[200px]">{n.message}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(n.created_at), "dd/MM HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
