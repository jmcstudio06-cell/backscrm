import { useState } from "react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { usePendingChecklist } from "@/hooks/usePendingChecklist";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AppLogo } from "@/components/layout/AppLogo";
import { FeatureBlockedDialog } from "@/components/layout/FeatureBlockedDialog";
import {
  LayoutDashboard,
  Calendar,
  Trophy,
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
  ClipboardList,
  Shield,
  Lock,
  X,
  BookOpen,
  MapPin,
  Music,
  Gift,
  Inbox,
  Package,
  Sparkles,
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
  { icon: Sparkles, label: "Ideias de Post", path: "/planejamento-conteudo", featureKey: "checklist" },
  {
    icon: Briefcase,
    label: "Área Comercial",
    children: [
      { icon: DollarSign, label: "Precificação", path: "/precificacao", featureKey: "precificacao" },
      { icon: TrendingUp, label: "Radar de Shows", path: "/crm", featureKey: "crm" },
      { icon: Package, label: "Serviços e Produtos", path: "/servicos", featureKey: "servicos" },
      { icon: CheckSquare, label: "Contrato Automático", path: "/contratos", featureKey: "contratos" },
      { icon: DollarSign, label: "Orçamento Automático", path: "/orcamentos", featureKey: "orcamentos" },
    ],
  },
  {
    icon: DollarSign,
    label: "Financeiro",
    children: [
      { icon: UserCheck, label: "Clientes", path: "/clientes", featureKey: "clientes" },
      { icon: DollarSign, label: "Resumo Mensal", path: "/financeiro", featureKey: "financeiro" },
      { icon: History, label: "Histórico Completo", path: "/historico", featureKey: "historico" },
    ],
  },
  {
    icon: ClipboardList,
    label: "Planejamento",
    children: [
      { icon: Target, label: "Avanços", path: "/avancos", featureKey: "checklist" },
      { icon: Music, label: "Repertório", path: "/repertorio", featureKey: "repertorio" },
      { icon: Users2, label: "Banda & Músicos", path: "/equipe", featureKey: "equipe" },
      { icon: CheckSquare, label: "Checklist de Show", path: "/checklist", featureKey: "checklist" },
      { icon: MapPin, label: "Mapeamento de Palco", path: "/mapeamento-palco", featureKey: "mapeamento-palco" },
    ],
  },
  {
    icon: Target,
    label: "Controle de Metas",
    children: [
      { icon: TrendingUp, label: "Metas Comerciais", path: "/metas", featureKey: "metas" },
      { icon: Target, label: "Meta Anual 2026", path: "/metas/anual", featureKey: "metas" },
    ],
  },
  { icon: Trophy, label: "Bônus", path: "/bonus", featureKey: "aulas" },
  
  { icon: Inbox, label: "Solicitações", path: "/solicitacoes", featureKey: "agenda" },
  { icon: Bell, label: "Notificações", path: "/notificacoes" },
  { icon: Settings, label: "Configurações", path: "/configuracoes", featureKey: "configuracoes" },
  { icon: Shield, label: "Admin", path: "/admin", adminOnly: true },
];

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [manualClosed, setManualClosed] = useState<Set<string>>(new Set());
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);
  const [blockedFeatureName, setBlockedFeatureName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { isBlocked, loading: blocksLoading } = useFeatureBlocks();
  const { signOut } = useAuth();
  const { pendingCount } = usePendingChecklist();
  const { unreadCount } = useNotifications();

  const filteredMenuItems = menuItems.filter((item) => !(item.adminOnly && !isAdmin));

  const handleBlockedClick = (label: string) => {
    setBlockedFeatureName(label);
    setBlockedDialogOpen(true);
  };

  const isChildActive = (children?: MenuItem["children"]) =>
    children?.some((c) => location.pathname.startsWith(c.path));

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onCloseMobile} />}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border pt-[calc(1rem+env(safe-area-inset-top))]">
          <AppLogo collapsed={false} />
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onCloseMobile}>
            <X className="w-5 h-5 text-sidebar-foreground" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
            if (item.children) {
              const active = isChildActive(item.children);
              const isOpen = openGroup === item.label || (isChildActive(item.children) && !manualClosed.has(item.label));
              const highlighted = active || isOpen;

              return (
                  <li key={item.label}>
                    <Collapsible
                      open={openGroup === item.label || (isChildActive(item.children) && !manualClosed.has(item.label))}
                      onOpenChange={(open) => {
                        if (open) {
                          setOpenGroup(item.label);
                          setManualClosed(prev => { const n = new Set(prev); n.delete(item.label); return n; });
                        } else {
                          setOpenGroup(openGroup === item.label ? null : openGroup);
                          setManualClosed(prev => new Set(prev).add(item.label));
                        }
                      }}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-primary",
                          )}
                        >
                          <item.icon className="w-5 h-5 shrink-0" />
                          <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                          {item.label === "Planejamento" && pendingCount > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs font-bold">
                              {pendingCount > 99 ? "99+" : pendingCount}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="pl-4 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const blocked = !blocksLoading && child.featureKey && isBlocked(child.featureKey);
                          const isActive = location.pathname.startsWith(child.path);

                          if (blocked) {
                            return (
                              <button
                                key={child.path}
                                onClick={() => handleBlockedClick(child.label)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-border w-full text-left"
                              >
                                <Lock className="w-4 h-4" />
                                <span className="text-sm">{child.label}</span>
                              </button>
                            );
                          }

                          return (
                            <RouterNavLink
                              key={child.path}
                              to={child.path}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                                isActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-primary",
                              )}
                            >
                              <child.icon className="w-4 h-4" />
                              <span className="text-sm">{child.label}</span>
                            </RouterNavLink>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                );
              }

              const blocked = !blocksLoading && item.featureKey && isBlocked(item.featureKey);
              const isActive = location.pathname.startsWith(item.path!);

              if (blocked) {
                return (
                  <li key={item.label}>
                    <button
                      onClick={() => handleBlockedClick(item.label)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-border w-full text-left"
                    >
                      <Lock className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <RouterNavLink
                    to={item.path!}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-primary",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.label === "Notificações" && unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs font-bold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </RouterNavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-3 pb-2 space-y-2">
          {/* Tutoriais */}
          <RouterNavLink
            to="/tutoriais"
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg font-medium transition-all duration-200 text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <BookOpen className="w-5 h-5" />
            <span>Tutoriais</span>
          </RouterNavLink>

          {/* Indique e Ganhe */}
          <RouterNavLink
            to="/indicacoes"
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg font-medium transition-all duration-200 text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Gift className="w-5 h-5" />
            <span>Indique e Ganhe</span>
          </RouterNavLink>

          <Button
            onClick={() => navigate("/planos")}
            className="w-full justify-start bg-[hsl(220,90%,56%)] hover:bg-[hsl(220,90%,50%)] text-white border-0"
          >
            <Crown className="w-5 h-5 mr-2" />
            Garantir acesso
          </Button>

          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-border"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </div>

        <FeatureBlockedDialog
          open={blockedDialogOpen}
          onOpenChange={setBlockedDialogOpen}
          featureName={blockedFeatureName}
        />
      </aside>
    </>
  );
}
