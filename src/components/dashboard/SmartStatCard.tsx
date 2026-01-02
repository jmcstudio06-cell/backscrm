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
  primary: "from-primary to-primary/80",
  secondary: "from-violet-500 to-purple-600",
  success: "from-success to-success/80",
  warning: "from-warning to-warning/80",
  purple: "from-purple-500 to-indigo-600",
  cyan: "from-cyan-500 to-teal-600",
};

const bgMap = {
  primary: "bg-primary/10",
  secondary: "bg-purple-500/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  purple: "bg-purple-500/10",
  cyan: "bg-cyan-500/10",
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
  // If value is 0 or empty, show guidance instead
  const shouldShowEmpty = isEmpty || value === 0 || value === "0" || value === "R$ 0,00" || value === "0%";

  if (shouldShowEmpty && emptyMessage && emptyLink) {
    return (
      <Link to={emptyLink} className={cn("group block", className)}>
        <div className="relative overflow-hidden rounded-xl bg-card border border-border p-5 h-full hover:border-primary/30 hover:shadow-md transition-all duration-300">
          {/* Subtle gradient background */}
          <div className={cn("absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-50", bgMap[gradient])} />

          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2 rounded-lg bg-gradient-to-br", gradientMap[gradient])}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>

            <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
            <p className="text-sm text-foreground font-medium mb-2">{emptyMessage}</p>
            <p className={cn("text-xs font-medium", textMap[gradient])}>
              {emptyAction} →
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-card border border-border p-5",
      className
    )}>
      {/* Background gradient glow */}
      <div className={cn("absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-30", bgMap[gradient])} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2 rounded-lg bg-gradient-to-br", gradientMap[gradient])}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>

        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
