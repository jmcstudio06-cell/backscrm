import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Users,
  UserCheck,
  CheckSquare,
  FileText,
  DollarSign,
  History,
  Music2,
  Calculator,
  ListMusic,
  Target,
  Crown,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Calendar, label: "Agenda de Shows", path: "/agenda" },
  { icon: GraduationCap, label: "Aulas de Alavancagem", path: "/aulas" },
  { icon: Users, label: "CRM - Funil de Vendas", path: "/crm" },
  { icon: UserCheck, label: "Clientes", path: "/clientes" },
  { icon: CheckSquare, label: "Tarefas", path: "/tarefas" },
  { icon: FileText, label: "Contratos", path: "/contratos" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: History, label: "Histórico Mensal", path: "/historico" },
  { icon: Music2, label: "Músicos da Banda", path: "/musicos" },
  { icon: Calculator, label: "Orçamentos", path: "/orcamentos" },
  { icon: ListMusic, label: "Repertório", path: "/repertorio" },
  { icon: Target, label: "Definir Metas", path: "/metas" },
  { icon: Crown, label: "Ver Planos", path: "/planos" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center [background:var(--gradient-primary)]">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Backstage</span>
            <span className="text-xs text-primary">PRO</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
