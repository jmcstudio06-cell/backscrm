import { Wallet, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-sm">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-success/5 rounded-full blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success/20">
              <Wallet className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Seus Cachês</h3>
              <p className="text-xs text-muted-foreground">Controle financeiro simplificado</p>
            </div>
          </div>
          <Link
            to="/financeiro"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors group"
          >
            Ver tudo
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning" />
              <p className="text-xs text-warning font-medium">A Receber</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              R$ {formatCurrency(totalPending)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <p className="text-xs text-success font-medium">Recebido</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              R$ {formatCurrency(totalReceived)}
            </p>
          </div>
        </div>

        {/* Pending shows list */}
        {pendingShows.length > 0 ? (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Próximos Cachês</p>
            <div className="space-y-2">
              {pendingShows.slice(0, 3).map((show, index) => (
                <div
                  key={show.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                    )}>
                      {show.date.split(" ")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{show.title}</p>
                      <p className="text-xs text-muted-foreground">{show.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success">
                      R$ {formatCurrency(show.cachet)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {show.status === "confirmed" ? "Confirmado" : "Pendente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">Nenhum cachê pendente</p>
            <Link
              to="/agenda"
              className="text-xs text-primary hover:text-primary/80 mt-1 inline-block"
            >
              Agendar um show →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
