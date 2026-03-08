import { Wallet, ArrowRight, Clock, CheckCircle2, TrendingUp } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-card group hover:shadow-elevated transition-all duration-500">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-60" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-primary to-accent group-hover:opacity-40 transition-opacity duration-700" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Seus Cachês</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Controle financeiro</p>
            </div>
          </div>
          <Link
            to="/financeiro"
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group/link px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10"
          >
            Ver tudo
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative p-4 rounded-2xl bg-warning/10 border border-warning/20 backdrop-blur-sm overflow-hidden group/stat">
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-warning/10 blur-2xl group-hover/stat:bg-warning/20 transition-colors" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-warning/20">
                  <Clock className="w-3.5 h-3.5 text-warning" />
                </div>
                <p className="text-xs text-warning font-semibold">A Receber</p>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                R$ {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
          <div className="relative p-4 rounded-2xl bg-success/10 border border-success/20 backdrop-blur-sm overflow-hidden group/stat">
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-success/10 blur-2xl group-hover/stat:bg-success/20 transition-colors" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-success/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                </div>
                <p className="text-xs text-success font-semibold">Recebido</p>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                R$ {formatCurrency(totalReceived)}
              </p>
            </div>
          </div>
        </div>

        {/* Pending shows list */}
        {pendingShows.length > 0 ? (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Próximos Cachês</p>
            <div className="space-y-2">
              {pendingShows.slice(0, 3).map((show, index) => (
                <div
                  key={show.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-border transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold",
                      index === 0 
                        ? "bg-gradient-to-br from-primary to-accent text-white" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      <span className="text-sm leading-none">{show.date.split(" ")[0]}</span>
                      <span className="text-[8px] uppercase opacity-80">{show.date.split(" ")[1]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">{show.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {show.status === "confirmed" ? "✓ Confirmado" : "◦ Pendente"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success">
                      R$ {formatCurrency(show.cachet)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">Nenhum cachê pendente</p>
            <Link
              to="/agenda"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Agendar um show →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}