import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, DollarSign, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda", path: "/agenda", icon: Calendar },
  { label: "Menu", path: "__menu__", icon: Menu },
  { label: "Resumo", path: "/financeiro", icon: DollarSign },
  { label: "Config", path: "/configuracoes", icon: Settings },
] as const;

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="bg-sidebar backdrop-blur-2xl border-t border-sidebar-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isMenu = item.path === "__menu__";
            const isActive = !isMenu && location.pathname.startsWith(item.path);
            const Icon = item.icon;

            if (isMenu) {
              return (
                <button
                  key="menu"
                  type="button"
                  onClick={onMenuClick}
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 -mt-5 focus-visible:outline-none"
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white text-sidebar shadow-lg shadow-black/20 transition-transform active:scale-95">
                    <Menu className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-medium text-primary-foreground/70 mt-0.5">
                    Menu
                  </span>
                </button>
              );
            }

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
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/60"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary-foreground" : "text-primary-foreground/60"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
