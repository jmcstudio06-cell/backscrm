import { Calendar, MapPin, Music, ArrowRight, FileText, MessageCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
  const getGradient = (index: number) => {
    const gradients = [
      "from-cyan-500 to-blue-600",
      "from-violet-500 to-purple-600",
      "from-rose-500 to-pink-600",
    ];
    return gradients[index % gradients.length];
  };

  const getStatusConfig = (status: Show["status"]) => {
    switch (status) {
      case "confirmed":
        return {
          icon: CheckCircle2,
          label: "Confirmado",
          color: "text-emerald-400",
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/30",
        };
      case "pending":
        return {
          icon: Clock,
          label: "Aguardando",
          color: "text-amber-400",
          bg: "bg-amber-500/20",
          border: "border-amber-500/30",
        };
      case "completed":
        return {
          icon: CheckCircle2,
          label: "Realizado",
          color: "text-slate-400",
          bg: "bg-slate-500/20",
          border: "border-slate-500/30",
        };
      default:
        return {
          icon: AlertCircle,
          label: "Pendente",
          color: "text-slate-400",
          bg: "bg-slate-500/20",
          border: "border-slate-500/30",
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-violet-500/10 to-transparent rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Próximos Shows</h3>
              <p className="text-xs text-slate-400">{shows.length} show{shows.length !== 1 ? 's' : ''} agendado{shows.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Link
            to="/agenda"
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group"
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
                  className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:bg-slate-800/80"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col">
                    {/* Main row */}
                    <div className="flex items-stretch">
                      {/* Date pill */}
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center px-4 py-3 bg-gradient-to-br text-white min-w-[70px]",
                          getGradient(index)
                        )}
                      >
                        <span className="text-2xl font-bold leading-none">{day}</span>
                        <span className="text-[10px] uppercase tracking-wider opacity-90">{month}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Music className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <p className="font-semibold text-white truncate text-sm">{show.title}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                              <p className="text-xs text-slate-400 truncate">{show.location}</p>
                            </div>
                          </div>
                          
                          {/* Value badge */}
                          <div className="flex-shrink-0">
                            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                              <span className="text-sm font-bold text-emerald-400">{show.value}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status and actions row */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
                          {/* Status badge */}
                          <div className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-lg",
                            statusConfig.bg,
                            statusConfig.border,
                            "border"
                          )}>
                            <StatusIcon className={cn("w-3 h-3", statusConfig.color)} />
                            <span className={cn("text-xs font-medium", statusConfig.color)}>
                              {statusConfig.label}
                            </span>
                          </div>

                          {/* Quick actions */}
                          <div className="flex items-center gap-2">
                            {show.hasContract ? (
                              <Link
                                to="/contratos"
                                className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                                title="Ver contrato"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                              </Link>
                            ) : (
                              <Link
                                to="/contratos"
                                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors border border-amber-500/30"
                                title="Criar contrato"
                              >
                                <FileText className="w-3.5 h-3.5 text-amber-400" />
                              </Link>
                            )}
                            {show.clientPhone && (
                              <button
                                onClick={() => handleWhatsApp(show.clientPhone, show.title)}
                                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                                title="Falar com contratante"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm mb-2">Nenhum show agendado</p>
            <Link
              to="/agenda"
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Agendar um show →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
