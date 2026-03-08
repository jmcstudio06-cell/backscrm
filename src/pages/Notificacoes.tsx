import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCheck, Megaphone, Sparkles, Gift, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  update: { icon: Sparkles, label: "Atualização", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  promo: { icon: Gift, label: "Promoção", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  tip: { icon: Megaphone, label: "Dica", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  general: { icon: Bell, label: "Geral", color: "bg-muted text-muted-foreground border-border" },
};

function NotificationCard({ notification, onRead }: { notification: AppNotification; onRead: (id: string) => void }) {
  const navigate = useNavigate();
  const config = TYPE_CONFIG[notification.notification_type] || TYPE_CONFIG.general;
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
    if (notification.action_url) navigate(notification.action_url);
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer hover:shadow-md",
        !notification.is_read && "border-primary/30 bg-primary/[0.02]"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex gap-3 items-start">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", config.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className={cn("font-semibold text-sm truncate", !notification.is_read && "text-foreground")}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={cn("text-[10px] font-semibold", config.color)}>
              {config.label}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {format(new Date(notification.created_at), "dd MMM, HH:mm", { locale: ptBR })}
            </span>
            {notification.action_url && (
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Notificacoes() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Layout title="Notificações" subtitle="Atualizações e novidades">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header bar */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
            </p>
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              <CheckCheck className="w-4 h-4 mr-1" />
              Marcar todas como lidas
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BellOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-lg">Nenhuma notificação</p>
            <p className="text-sm text-muted-foreground mt-1">
              Quando houver novidades, elas aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <NotificationCard key={n.id} notification={n} onRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
