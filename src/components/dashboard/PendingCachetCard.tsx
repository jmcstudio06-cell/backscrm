import { Wallet, Calendar, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface PendingShow {
  id: string;
  title: string;
  date: string;
  cachet: number;
  status: string;
}

interface PendingCachetCardProps {
  pendingShows: PendingShow[];
  totalPending: number;
  totalReceived: number;
}

export function PendingCachetCard({ pendingShows, totalPending, totalReceived }: PendingCachetCardProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Seus Cachês</h3>
              <p className="text-xs text-slate-400">Controle financeiro simplificado</p>
            </div>
          </div>
          <Link
            to="/financeiro"
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors group"
          >
            Ver tudo
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-amber-400 font-medium">A Receber</p>
            </div>
            <p className="text-2xl font-bold text-white">
              R$ {formatCurrency(totalPending)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-emerald-400 font-medium">Recebido</p>
            </div>
            <p className="text-2xl font-bold text-white">
              R$ {formatCurrency(totalReceived)}
            </p>
          </div>
        </div>

        {/* Pending shows list */}
        {pendingShows.length > 0 ? (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Próximos Cachês</p>
            <div className="space-y-2">
              {pendingShows.slice(0, 3).map((show, index) => (
                <div
                  key={show.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-amber-500/20 text-amber-400" : "bg-slate-700 text-slate-400"
                    )}>
                      {show.date.split(" ")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[150px]">{show.title}</p>
                      <p className="text-xs text-slate-500">{show.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">
                      R$ {formatCurrency(show.cachet)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {show.status === "confirmed" ? "Confirmado" : "Pendente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm">Nenhum cachê pendente</p>
            <Link
              to="/agenda"
              className="text-xs text-emerald-400 hover:text-emerald-300 mt-1 inline-block"
            >
              Agendar um show →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
