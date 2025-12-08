import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

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
  primary: "var(--gradient-primary)",
  success: "var(--gradient-success)",
  warning: "var(--gradient-warning)",
  danger: "var(--gradient-danger)",
  blue: "var(--gradient-blue)",
  purple: "var(--gradient-purple)",
};

export function StatCard({ title, value, icon: Icon, trend, gradient = "primary", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-5 glass card-hover animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend.value}% vs mês anterior</span>
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: gradientMap[gradient] }}
        >
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
      
      {/* Decorative gradient blur */}
      <div
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ background: gradientMap[gradient] }}
      />
    </div>
  );
}
