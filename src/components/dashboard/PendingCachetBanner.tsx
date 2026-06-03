import { Wallet, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PendingCachetBannerProps {
  totalPending: number;
  pendingCount: number;
}

export function PendingCachetBanner({ totalPending, pendingCount }: PendingCachetBannerProps) {
  if (totalPending <= 0) return null;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Link
      to="/financeiro"
      className="block group relative overflow-hidden rounded-lg border border-success/30 bg-gradient-to-r from-success/10 via-success/5 to-transparent p-4 sm:p-5 shadow-sm hover:shadow-md transition-all animate-fade-in"
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl bg-success/20 opacity-50 group-hover:opacity-80 transition-opacity" />
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg shrink-0 bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-md">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-success font-bold leading-none">
            Cachês a receber
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none mt-1.5 tracking-tight">
            R$ {fmt(totalPending)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {pendingCount} show{pendingCount !== 1 ? "s" : ""} pendente{pendingCount !== 1 ? "s" : ""} de pagamento
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-success group-hover:translate-x-1 transition-transform shrink-0" />
      </div>
    </Link>
  );
}

