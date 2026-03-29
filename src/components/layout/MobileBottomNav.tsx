import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, DollarSign, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

const navItems = [
  { label: "Agenda", path: "/agenda", icon: Calendar },
  { label: "Resumo", path: "/financeiro", icon: DollarSign },
  { label: "Config", path: "/configuracoes", icon: Settings },
] as const;

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="bg-background/80 backdrop-blur-2xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 focus-visible:outline-none"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Menu button - opens sidebar */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 focus-visible:outline-none"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl text-muted-foreground transition-all duration-200">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              Menu
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
