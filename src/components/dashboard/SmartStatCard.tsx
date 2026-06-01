import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SmartStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: "primary" | "secondary" | "success" | "warning" | "purple" | "cyan";
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyAction?: string;
  emptyLink?: string;
  className?: string;
}

const gradientMap = {
  primary: "from-primary to-accent",
  secondary: "from-violet-500 to-purple-600",
  success: "from-success to-teal-500",
  warning: "from-warning to-orange-500",
  purple: "from-purple-500 to-indigo-600",
  cyan: "from-cyan-500 to-teal-600",
};

const bgMap = {
  primary: "from-primary/10 to-accent/5",
  secondary: "from-purple-500/10 to-purple-600/5",
  success: "from-success/10 to-teal-500/5",
  warning: "from-warning/10 to-orange-500/5",
  purple: "from-purple-500/10 to-indigo-600/5",
  cyan: "from-cyan-500/10 to-teal-600/5",
};

const textMap = {
  primary: "text-primary",
  secondary: "text-purple-500",
  success: "text-success",
  warning: "text-warning",
  purple: "text-purple-500",
  cyan: "text-cyan-500",
};

export function SmartStatCard({
  title,
  value,
  icon: Icon,
  gradient = "primary",
  isEmpty = false,
  emptyMessage,
  emptyAction,
  emptyLink,
  className,
}: SmartStatCardProps) {
  const shouldShowEmpty = isEmpty || value === 0 || value === "0" || value === "R$ 0,00" || value === "0%";

  if (shouldShowEmpty && emptyMessage && emptyLink) {
    return (
      <Link to={emptyLink} className={cn("group block", className)}>
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 h-full hover:border-primary/30 hover:shadow-elevated transition-all duration-500 hover:-translate-y-0.5">
          {/* Subtle gradient background */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", bgMap[gradient])} />
          <div className={cn("absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl opacity-30 bg-gradient-to-br", gradientMap[gradient])} />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shadow-lg", gradientMap[gradient])}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="p-1.5 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</h3>
            <p className="text-sm text-foreground font-medium mb-3">{emptyMessage}</p>
            <p className={cn("text-xs font-semibold", textMap[gradient])}>
              {emptyAction} →
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 shadow-card group hover:shadow-elevated transition-all duration-500 hover:-translate-y-0.5",
      className
    )}>
      {/* Background gradient glow */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", bgMap[gradient])} />
      <div className={cn("absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br", gradientMap[gradient])} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shadow-lg", gradientMap[gradient])}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>

        <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</h3>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      </div>
    </div>
  );
}
