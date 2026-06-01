import { Wallet, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface PendingCachetHighlightProps {
  totalPending: number;
}

export function PendingCachetHighlight({ totalPending }: PendingCachetHighlightProps) {
  if (totalPending <= 0) return null;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="animate-fade-in">
      <Link 
        to="/financeiro"
        className="group relative flex items-center justify-between w-full overflow-hidden rounded-none bg-gradient-to-r from-success/20 to-success/10 border border-success/30 p-4 transition-all hover:shadow-lg hover:border-success/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-none bg-success flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-success/80">Cachês Pendentes</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">R$ {formatCurrency(totalPending)}</span>
              <span className="text-xs font-bold text-success">para receber</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-success/20 text-success text-xs font-bold group-hover:gap-3 transition-all">
          Ver detalhes
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        {/* Decorative glow */}
        <div className="absolute top-0 right-1/4 w-32 h-full bg-success/5 blur-3xl transform -skew-x-12 pointer-events-none" />
      </Link>
    </div>
  );
}
