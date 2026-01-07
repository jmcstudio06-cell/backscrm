import { Calendar, MapPin, Music, ArrowRight, FileText, MessageCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

interface Show {
  id: string;
  date: string;
  title: string;
  location: string;
  value: string;
  status: "confirmed" | "pending" | "completed";
  clientPhone?: string;
  hasContract?: boolean;
}

interface UpcomingShowsCardProps {
  shows: Show[];
}

export function UpcomingShowsCard({ shows }: UpcomingShowsCardProps) {
  const navigate = useNavigate();

  const getGradient = (index: number) => {
    const gradients = [
      "from-primary to-primary/80",
      "from-violet-500 to-purple-600",
      "from-rose-500 to-pink-600",
    ];
    return gradients[index % gradients.length];
  };

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
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-sm">
      {/* Background decoration */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Próximos Shows</h3>
              <p className="text-xs text-muted-foreground">{shows.length} show{shows.length !== 1 ? 's' : ''} agendado{shows.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Link
            to="/agenda"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors group"
          >
            Ver agenda
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

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
                  className="group relative overflow-hidden rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col">
                    {/* Main row */}
                    <div className="flex items-stretch">
                      {/* Date pill */}
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center px-3 sm:px-4 py-3 bg-gradient-to-br text-white min-w-[60px] sm:min-w-[70px]",
                          getGradient(index)
                        )}
                      >
                        <span className="text-xl sm:text-2xl font-bold leading-none">{day}</span>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider opacity-90">{month}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-2 sm:p-3 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Music className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-muted-foreground flex-shrink-0" />
                              <p className="font-semibold text-foreground truncate text-xs sm:text-sm">{show.title}</p>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                              <MapPin className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-muted-foreground flex-shrink-0" />
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{show.location}</p>
                            </div>
                          </div>
                          
                          {/* Value badge */}
                          <div className="flex-shrink-0 mt-1 sm:mt-0">
                            <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-success/10 border border-success/20 inline-block">
                              <span className="text-xs sm:text-sm font-bold text-success">{show.value}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status and actions row */}
                        <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                          {/* Status badge */}
                          <div className={cn(
                            "flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border",
                            statusConfig.bg,
                            statusConfig.border
                          )}>
                            <StatusIcon className={cn("w-2.5 sm:w-3 h-2.5 sm:h-3", statusConfig.color)} />
                            <span className={cn("text-[10px] sm:text-xs font-medium", statusConfig.color)}>
                              {statusConfig.label}
                            </span>
                          </div>

                          {/* Quick actions */}
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {show.hasContract ? (
                              <Link
                                to="/contratos"
                                className="p-1 sm:p-1.5 rounded-lg bg-muted hover:bg-secondary transition-colors"
                                title="Ver contrato"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileText className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-muted-foreground hover:text-foreground" />
                              </Link>
                            ) : (
                              <Link
                                to="/contratos"
                                className="p-1 sm:p-1.5 rounded-lg bg-warning/10 hover:bg-warning/20 transition-colors border border-warning/20"
                                title="Criar contrato"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileText className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-warning" />
                              </Link>
                            )}
                            {show.clientPhone && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsApp(show.clientPhone, show.title);
                                }}
                                className="p-1 sm:p-1.5 rounded-lg bg-success/10 hover:bg-success/20 transition-colors border border-success/20"
                                title="Falar com contratante"
                              >
                                <MessageCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-success" />
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-2">Nenhum show agendado</p>
            <Link
              to="/agenda"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Agendar um show →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
