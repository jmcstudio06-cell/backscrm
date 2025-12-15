import { useState } from "react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  UserCheck,
  DollarSign,
  History,
  Users2,
  Target,
  Crown,
  Settings,
  ChevronDown,
  LogOut,
  TrendingUp,
  CheckSquare,
  Briefcase,
  Truck,
  Shield,
  Lock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  featureKey?: string;
  adminOnly?: boolean;
  children?: {
    icon: React.ElementType;
    label: string;
    path: string;
    featureKey?: string;
  }[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", featureKey: "dashboard" },
  { icon: Calendar, label: "Agenda de Shows", path: "/agenda", featureKey: "agenda" },
  {
    icon: Briefcase,
    label: "Área Comercial",
    children: [
      { icon: TrendingUp, label: "Funil de Vendas", path: "/crm", featureKey: "crm" },
      { icon: UserCheck, label: "Clientes", path: "/clientes", featureKey: "clientes" },
      { icon: DollarSign, label: "Orçamento Automático", path: "/orcamentos", featureKey: "orcamentos" },
      { icon: CheckSquare, label: "Contrato Automático", path: "/contratos", featureKey: "contratos" },
    ],
  },
  {
    icon: DollarSign,
    label: "Financeiro",
    children: [
      { icon: DollarSign, label: "Resumo Geral", path: "/financeiro", featureKey: "financeiro" },
      { icon: History, label: "Histórico Mensal", path: "/historico", featureKey: "historico" },
    ],
  },
  {
    icon: Truck,
    label: "Logística",
    children: [
      { icon: CheckSquare, label: "Checklist de Show", path: "/checklist", featureKey: "checklist" },
      { icon: Users2, label: "Equipe & Freelancer", path: "/equipe", featureKey: "equipe" },
    ],
  },
  { icon: Target, label: "Metas", path: "/metas", featureKey: "metas" },
  { icon: GraduationCap, label: "Apoio e Conhecimentos", path: "/aulas", featureKey: "aulas" },
  { icon: Settings, label: "Configurações", path: "/configuracoes", featureKey: "configuracoes" },
  { icon: Shield, label: "Admin", path: "/admin", adminOnly: true },
];

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { isBlocked } = useFeatureBlocks();
  const { signOut } = useAuth();

  const filteredMenuItems = menuItems.filter((item) => !(item.adminOnly && !isAdmin));

  const handleBlockedClick = (label: string) => {
    toast.error(`Seu plano não inclui "${label}"`, {
      action: {
        label: "Ver Planos",
        onClick: () => navigate("/planos"),
      },
    });
  };

  const isChildActive = (children?: MenuItem["children"]) =>
    children?.some((c) => location.pathname.startsWith(c.path));

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onCloseMobile} />}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <AppLogo collapsed={false} />
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onCloseMobile}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* NAVIGATION (AQUI ESTAVA O ERRO) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              if (item.children) {
                const active = isChildActive(item.children);

                return (
                  <li key={item.label}>
                    <Collapsible
                      open={openGroup === item.label}
                      onOpenChange={() => setOpenGroup(openGroup === item.label ? null : item.label)}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg",
                            active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-border",
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-1 pl-4 space-y-1">
                        {item.children.map((child) => {
                          const blocked = child.featureKey && isBlocked(child.featureKey);

                          if (blocked) {
                            return (
                              <button
                                key={child.path}
                                onClick={() => handleBlockedClick(child.label)}
                                className="flex w-full items-center gap-3 px-3 py-2 text-sm opacity-50"
                              >
                                <Lock className="w-4 h-4" />
                                {child.label}
                              </button>
                            );
                          }

                          return (
                            <RouterNavLink
                              key={child.path}
                              to={child.path}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
                                  isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "hover:bg-sidebar-border",
                                )
                              }
                            >
                              <child.icon className="w-4 h-4" />
                              {child.label}
                            </RouterNavLink>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                );
              }

              const blocked = item.featureKey && isBlocked(item.featureKey);

              if (blocked) {
                return (
                  <li key={item.label}>
                    <button
                      onClick={() => handleBlockedClick(item.label)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 opacity-50"
                    >
                      <Lock className="w-5 h-5" />
                      {item.label}
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <RouterNavLink
                    to={item.path!}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-border",
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </RouterNavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Button
            onClick={() => navigate("/planos")}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          >
            <Crown className="w-5 h-5 mr-2" />
            Ver Planos
          </Button>

          <Button variant="ghost" onClick={signOut} className="w-full justify-start">
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
