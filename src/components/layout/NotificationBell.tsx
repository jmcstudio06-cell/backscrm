import { useState } from "react";
import { Bell, Plus, CheckCheck, Sparkles, Gift, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdminNotificationQuickModal } from "./AdminNotificationQuickModal";

const TYPE_ICON: Record<string, React.ElementType> = {
  update: Sparkles,
  promo: Gift,
  tip: Megaphone,
  general: Bell,
};

const TYPE_COLOR: Record<string, string> = {
  update: "bg-blue-500/10 text-blue-600",
  promo: "bg-emerald-500/10 text-emerald-600",
  tip: "bg-amber-500/10 text-amber-600",
  general: "bg-muted text-muted-foreground",
};

export function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refetch } = useNotifications();
  const { isAdmin } = useAdmin();
  const [createOpen, setCreateOpen] = useState(false);

  const recent = notifications.slice(0, 6);

  const handleClick = (n: AppNotification) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.action_url) navigate(n.action_url);
    else navigate("/notificacoes");
  };

  return (
    <>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-md h-9 w-9 sm:h-10 sm:w-10 text-primary-foreground lg:text-foreground hover:bg-primary-foreground/10 lg:hover:bg-secondary"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-sm bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-primary lg:ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <p className="font-semibold text-sm">Notificações</p>
            {unreadCount > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={markAllAsRead}>
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Ler todas
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="default"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Nova
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {recent.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Sem notificações</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Novidades e ofertas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {recent.map((n) => {
                const Icon = TYPE_ICON[n.notification_type] || Bell;
                const color = TYPE_COLOR[n.notification_type] || TYPE_COLOR.general;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-muted/60 transition-colors",
                      !n.is_read && "bg-primary/[0.03]"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-md flex items-center justify-center shrink-0", color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm truncate", !n.is_read ? "font-semibold" : "font-medium text-muted-foreground")}>
                          {n.title}
                        </p>
                        {!n.is_read && <span className="w-2 h-2 rounded-sm bg-red-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(n.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate("/notificacoes")}>
            Ver todas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
    <AdminNotificationQuickModal open={createOpen} onOpenChange={setCreateOpen} onSent={refetch} />
    </>
  );
}
