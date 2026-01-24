import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, action, className }: ChartCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-5 bg-card border border-border/50 shadow-card group hover:shadow-elevated transition-all duration-500",
      className
    )}>
      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-60" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
