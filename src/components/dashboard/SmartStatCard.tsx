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
  primary: "from-cyan-500 to-blue-600",
  secondary: "from-violet-500 to-purple-600",
  success: "from-emerald-500 to-green-600",
  warning: "from-amber-500 to-orange-600",
  purple: "from-purple-500 to-indigo-600",
  cyan: "from-cyan-500 to-teal-600",
};

const glowMap = {
  primary: "shadow-cyan-500/30",
  secondary: "shadow-violet-500/30",
  success: "shadow-emerald-500/30",
  warning: "shadow-amber-500/30",
  purple: "shadow-purple-500/30",
  cyan: "shadow-cyan-500/30",
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
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-5 h-full hover:border-slate-600 transition-all duration-300">
          {/* Subtle gradient background */}
          <div className={cn(
            "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity",
            `bg-gradient-to-br ${gradientMap[gradient]}`
          )} />

          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-br shadow-lg",
                gradientMap[gradient],
                glowMap[gradient]
              )}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>

            <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
            <p className="text-sm text-white font-medium mb-2">{emptyMessage}</p>
            <p className={cn(
              "text-xs font-medium",
              gradient === "primary" && "text-cyan-400",
              gradient === "secondary" && "text-violet-400",
              gradient === "success" && "text-emerald-400",
              gradient === "warning" && "text-amber-400",
              gradient === "purple" && "text-purple-400",
              gradient === "cyan" && "text-cyan-400"
            )}>
              {emptyAction} →
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-5",
      className
    )}>
      {/* Background gradient glow */}
      <div className={cn(
        "absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20",
        `bg-gradient-to-br ${gradientMap[gradient]}`
      )} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-2 rounded-lg bg-gradient-to-br shadow-lg",
            gradientMap[gradient],
            glowMap[gradient]
          )}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>

        <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
