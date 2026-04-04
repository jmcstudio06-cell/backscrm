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
  isGradient?: boolean;
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
  { icon: Crown, label: "Ranking & Selos", path: "/ranking", featureKey: "aulas" },
  
  { icon: Inbox, label: "Link Agenda", path: "/solicitacoes", featureKey: "link-agenda" },
  { icon: BookOpen, label: "Tutoriais", path: "/tutoriais", featureKey: "tutoriais", isGradient: true },
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
        <div className="p-4 border-b border-sidebar-border pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <AppLogo collapsed={false} />
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onCloseMobile}>
              <X className="w-5 h-5 text-sidebar-foreground" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <a
              href="https://www.instagram.com/backstageprooficiall/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-sidebar text-sidebar-foreground text-xs font-medium transition-colors hover:opacity-80 border border-sidebar-border"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </a>
            <a
              href="https://wa.me/5512992423317"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-sidebar text-sidebar-foreground text-xs font-medium transition-colors hover:opacity-80 border border-sidebar-border"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Suporte
            </a>
          </div>
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
                      item.isGradient
                        ? "text-primary-foreground font-medium"
                        : isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-primary",
                    )}
                    style={item.isGradient ? { background: "var(--gradient-primary)" } : undefined}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
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
