import { Calendar, MapPin, Music, ArrowRight, FileText, MessageCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

interface Show {
  id: string;
  date: string;
  title: string;
  location: string;
  value: string;
  status: "confirmed" | "pending" | "completed" | "partial" | "scheduled";
  clientPhone?: string;
  hasContract?: boolean;
}


interface UpcomingShowsCardProps {
  shows: Show[];
  monthlySummary?: {
    monthName: string;
    showsCount: number;
    totalValue: number;
  };
}

export function UpcomingShowsCard({ shows, monthlySummary }: UpcomingShowsCardProps) {
  const navigate = useNavigate();

  const handleShowClick = (showId: string) => {
    navigate(`/agenda?show=${showId}`);
  };

  const getStatusConfig = (status: Show["status"]) => {
    switch (status) {
      case "confirmed":
        return {
          icon: CheckCircle2,
          label: "Confirmado",
          color: "text-success",
          bg: "bg-success/10",
          border: "border-success/20",
        };
      case "pending":
        return {
          icon: Clock,
          label: "Aguardando",
          color: "text-warning",
          bg: "bg-warning/10",
          border: "border-warning/20",
        };
      case "completed":
        return {
          icon: CheckCircle2,
          label: "Realizado",
          color: "text-muted-foreground",
          bg: "bg-muted",
          border: "border-border",
        };
      default:
        return {
          icon: AlertCircle,
          label: "Pendente",
          color: "text-muted-foreground",
          bg: "bg-muted",
          border: "border-border",
        };
    }
  };

  const handleWhatsApp = (phone: string | undefined, showTitle: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Olá! Sobre o show "${showTitle}"...`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-card group hover:shadow-elevated transition-all duration-500">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-60" />
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:opacity-70 opacity-40 transition-opacity duration-700" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Próximos Shows</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{shows.length} show{shows.length !== 1 ? 's' : ''} agendado{shows.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Link
            to="/agenda"
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group/link px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10"
          >
            Ver agenda
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>

        {/* Monthly summary chips */}
        {monthlySummary && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary capitalize">
              🎤 {monthlySummary.monthName}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-bold text-foreground">
              {monthlySummary.showsCount} show{monthlySummary.showsCount !== 1 ? "s" : ""}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-xs font-bold text-success">
              R$ {monthlySummary.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} previstos
            </div>
          </div>
        )}

        {shows.length > 0 ? (
          <div className="space-y-3">
            {shows.map((show, index) => {
              const [day, month] = show.date.split(" ");
              const statusConfig = getStatusConfig(show.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={show.id || index}
                  onClick={() => handleShowClick(show.id)}
                  className="group/show relative overflow-hidden rounded-2xl bg-secondary/20 border border-border/50 hover:border-primary/30 hover:bg-secondary/40 transition-all duration-300 hover:shadow-card cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col">
                    {/* Main row */}
                    <div className="flex items-stretch">
                      {/* Date pill - always uses primary theme color */}
                      <div className="flex flex-col items-center justify-center px-4 py-4 text-white min-w-[72px] bg-gradient-to-br from-primary to-accent">
                        <span className="text-2xl font-bold leading-none">{day}</span>
                        <span className="text-[10px] uppercase tracking-wider opacity-90 mt-0.5">{month}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 sm:p-4 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Music className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <p className="font-semibold text-foreground truncate text-sm">{show.title}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <p className="text-xs text-muted-foreground truncate">{show.location}</p>
                            </div>
                          </div>
                          
                          {/* Value badge */}
                          <div className="flex-shrink-0">
                            <div className="px-3 py-1.5 rounded-xl bg-success/10 border border-success/20 inline-block">
                              <span className="text-sm font-bold text-success">{show.value}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status and actions row */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          {/* Status badge */}
                          <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border",
                            statusConfig.bg,
                            statusConfig.border
                          )}>
                            <StatusIcon className={cn("w-3 h-3", statusConfig.color)} />
                            <span className={cn("text-xs font-medium", statusConfig.color)}>
                              {statusConfig.label}
                            </span>
                          </div>

                          {/* Quick actions */}
                          <div className="flex items-center gap-2">
                            {show.clientPhone && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsApp(show.clientPhone, show.title);
                                }}
                                className="p-2 rounded-lg bg-success/10 hover:bg-success/20 transition-colors border border-success/20"
                                title="Falar com contratante"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-success" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-2">Nenhum show agendado</p>
            <Link
              to="/agenda"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10"
            >
              Agendar um show →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}