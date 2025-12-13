import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Users,
  UserCheck,
  DollarSign,
  History,
  Users2,
  Target,
  Crown,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  LogOut,
  TrendingUp,
  CheckSquare,
  Briefcase,
  Truck,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  adminOnly?: boolean;
  children?: { icon: React.ElementType; label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Agenda de Shows", path: "/agenda" },
  {
    icon: Briefcase,
    label: "Área Comercial",
    children: [
      { icon: TrendingUp, label: "Funil de Vendas", path: "/crm" },
      { icon: UserCheck, label: "Clientes", path: "/clientes" },
      { icon: DollarSign, label: "Orçamento Automático", path: "/orcamentos" },
      { icon: CheckSquare, label: "Contrato Automático", path: "/contratos" },
    ],
  },
  {
    icon: DollarSign,
    label: "Financeiro",
    children: [
      { icon: DollarSign, label: "Resumo Geral", path: "/financeiro" },
      { icon: History, label: "Histórico Mensal", path: "/historico" },
    ],
  },
  {
    icon: Truck,
    label: "Logística",
    children: [
      { icon: CheckSquare, label: "Checklist de Show", path: "/checklist" },
      { icon: Users2, label: "Equipe & Freelancer", path: "/equipe" },
    ],
  },
  { icon: Target, label: "Metas", path: "/metas" },
  { icon: GraduationCap, label: "Apoio e Conhecimentos", path: "/aulas" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
  { icon: Shield, label: "Admin", path: "/admin", adminOnly: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  // Filter menu items based on admin status
  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  const isChildActive = (children: MenuItem["children"]) => {
    return children?.some(
      (child) =>
        location.pathname === child.path ||
        (child.path !== "/" && location.pathname.startsWith(child.path))
    );
  };

  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-sidebar-primary">Backstage Pro</span>
            <span className="text-xs text-sidebar-foreground">CRM para Artistas</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            if (item.children) {
              const isOpen = openGroup === item.label;
              const hasActiveChild = isChildActive(item.children);

              return (
                <li key={item.label}>
                  <Collapsible open={isOpen && !collapsed} onOpenChange={() => toggleGroup(item.label)}>
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left",
                          hasActiveChild
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-primary"
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="text-sm font-medium truncate flex-1">
                              {item.label}
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                isOpen && "rotate-180"
                              )}
                            />
                          </>
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isActive =
                          location.pathname === child.path ||
                          (child.path !== "/" && location.pathname.startsWith(child.path));

                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-primary"
                            )}
                          >
                            <child.icon className="w-4 h-4 shrink-0" />
                            {!collapsed && (
                              <span className="text-sm truncate">{child.label}</span>
                            )}
                          </NavLink>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              );
            }

            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path!));

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path!}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-primary"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-sidebar-accent-foreground")} />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-accent-foreground" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Ver Planos Button */}
      <div className="px-3 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/planos")}
          className={cn(
            "w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90",
            collapsed && "justify-center"
          )}
        >
          <Crown className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <div className="ml-3 flex flex-col items-start">
              <span className="text-sm font-medium">Ver Planos</span>
              <span className="text-xs opacity-80">A partir de R$ 19,99/mês</span>
            </div>
          )}
        </Button>
      </div>

      {/* Logout Button */}
      <div className="px-3 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-border",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-border"
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
