import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: "primary" | "success" | "warning" | "danger" | "blue" | "purple";
  className?: string;
}

const gradientMap = {
  primary: "from-primary to-accent",
  success: "from-success to-teal-500",
  warning: "from-warning to-orange-500",
  danger: "from-destructive to-rose-400",
  blue: "from-primary to-cyan-500",
  purple: "from-violet-500 to-purple-600",
};

const bgGlowMap = {
  primary: "from-primary/10 to-accent/5",
  success: "from-success/10 to-teal-500/5",
  warning: "from-warning/10 to-orange-500/5",
  danger: "from-destructive/10 to-rose-400/5",
  blue: "from-primary/10 to-cyan-500/5",
  purple: "from-violet-500/10 to-purple-600/5",
};

export function StatCard({ title, value, icon: Icon, trend, gradient = "primary", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 bg-card border border-border/50 shadow-card group hover:shadow-elevated transition-all duration-500 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Background glow */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", bgGlowMap[gradient])} />
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-30 bg-gradient-to-br group-hover:opacity-50 transition-opacity duration-500" style={{ background: `var(--gradient-${gradient})` }} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
              trend.isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{trend.value}% vs mês anterior</span>
            </div>
          )}
        </div>
        <div
          className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br", gradientMap[gradient])}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
