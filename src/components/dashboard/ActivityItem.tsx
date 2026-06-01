import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

export function ActivityItem({ icon: Icon, title, description, time, variant = "default" }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-none hover:bg-secondary/50 transition-colors">
      <div className={cn("w-9 h-9 rounded-none flex items-center justify-center shrink-0", variantStyles[variant])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </div>
  );
}
