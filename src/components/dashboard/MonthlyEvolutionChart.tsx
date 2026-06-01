import { BarChart3, TrendingUp, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyData {
  name: string;
  count: number;
  revenue: number;
}

interface MonthlyEvolutionChartProps {
  data: MonthlyData[];
}

export function MonthlyEvolutionChart({ data }: MonthlyEvolutionChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border/50 p-6 shadow-card group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Evolução Mensal</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Desempenho dos últimos meses</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 h-48 items-end">
        {data.map((month, idx) => {
          const countHeight = (month.count / maxCount) * 100;
          const revenueHeight = (month.revenue / maxRevenue) * 100;

          return (
            <div key={month.name} className="relative flex flex-col items-center gap-3 group/bar h-full justify-end">
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-background border border-border shadow-xl rounded-md p-2 z-20 min-w-[100px] pointer-events-none">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{month.name}</p>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-medium flex items-center gap-1"><Music className="w-2.5 h-2.5" /> Shows:</span>
                  <span className="text-[10px] font-black">{month.count}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-medium flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> Receita:</span>
                  <span className="text-[10px] font-black">R$ {Math.round(month.revenue / 1000)}k</span>
                </div>
              </div>

              {/* Double bars */}
              <div className="flex items-end gap-1.5 w-full justify-center flex-1">
                {/* Revenue Bar */}
                <div 
                  className="w-4 sm:w-6 bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all duration-500 relative"
                  style={{ height: `${revenueHeight}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                </div>
                {/* Shows Bar */}
                <div 
                  className="w-4 sm:w-6 bg-primary hover:bg-primary/80 rounded-t-sm transition-all duration-500 shadow-lg shadow-primary/20"
                  style={{ height: `${countHeight}%` }}
                />
              </div>
              
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {month.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-none bg-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Shows</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-none bg-primary/30" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Receita</span>
        </div>
      </div>
    </div>
  );
}
