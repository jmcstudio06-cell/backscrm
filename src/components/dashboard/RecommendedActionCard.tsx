import { Link, useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  FileText, 
  Calendar, 
  Wallet,
  ArrowRight,
  Zap,
  Target,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { toast } from "sonner";

interface RecommendedActionCardProps {
  hasLeads: boolean;
  hasShows: boolean;
  hasContracts: boolean;
  hasGoals: boolean;
  pendingCachet: number;
  upcomingShowsCount: number;
}

interface Action {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: React.ElementType;
  gradient: string;
  priority: number;
}

export function RecommendedActionCard({
  hasLeads,
  hasShows,
  hasContracts,
  hasGoals,
  pendingCachet,
  upcomingShowsCount,
}: RecommendedActionCardProps) {
  const navigate = useNavigate();
  const { isBlocked } = useFeatureBlocks();

  // Map routes to feature keys
  const routeToFeatureKey: Record<string, string> = {
    "/metas": "metas",
    "/crm": "crm",
    "/agenda": "agenda",
    "/contratos": "contratos",
    "/financeiro": "financeiro",
  };

  const handleActionClick = (e: React.MouseEvent, link: string) => {
    const featureKey = routeToFeatureKey[link];
    if (featureKey && isBlocked(featureKey)) {
      e.preventDefault();
      toast.error("Funcionalidade bloqueada. Faça upgrade do seu plano para acessar.");
      navigate("/planos");
    }
  };

  // Determine recommended actions based on user state
  const getRecommendedActions = (): Action[] => {
    const actions: Action[] = [];

    // Priority 1: No goals set
    if (!hasGoals) {
      actions.push({
        id: "goals",
        title: "Defina suas metas",
        description: "Configure metas de shows, leads e faturamento para acompanhar seu progresso",
        link: "/metas",
        icon: Target,
        gradient: "from-violet-500 to-purple-600",
        priority: 1,
      });
    }

    // Priority 2: No leads
    if (!hasLeads) {
      actions.push({
        id: "leads",
        title: "Cadastre seu primeiro lead",
        description: "Adicione contatos interessados nos seus shows e comece a vender",
        link: "/crm",
        icon: UserPlus,
        gradient: "from-primary to-primary/80",
        priority: 2,
      });
    }

    // Priority 3: Has leads but no shows
    if (hasLeads && !hasShows) {
      actions.push({
        id: "shows",
        title: "Agende seu primeiro show",
        description: "Transforme seus leads em shows confirmados",
        link: "/agenda",
        icon: Calendar,
        gradient: "from-success to-success/80",
        priority: 3,
      });
    }

    // Priority 4: Has shows but no contracts
    if (hasShows && !hasContracts) {
      actions.push({
        id: "contracts",
        title: "Crie um contrato",
        description: "Formalize seus shows com contratos profissionais",
        link: "/contratos",
        icon: FileText,
        gradient: "from-warning to-warning/80",
        priority: 4,
      });
    }

    // Priority 5: Has pending cachet
    if (pendingCachet > 0) {
      actions.push({
        id: "cachet",
        title: "Acompanhe seus cachês",
        description: `Você tem R$ ${pendingCachet.toLocaleString("pt-BR")} em cachês pendentes`,
        link: "/financeiro",
        icon: Wallet,
        gradient: "from-rose-500 to-pink-600",
        priority: 5,
      });
    }

    // Priority 6: Active user - suggest reviewing upcoming shows
    if (upcomingShowsCount > 0) {
      actions.push({
        id: "upcoming",
        title: "Prepare seus próximos shows",
        description: `Você tem ${upcomingShowsCount} show${upcomingShowsCount > 1 ? "s" : ""} chegando. Revise os detalhes!`,
        link: "/agenda",
        icon: Calendar,
        gradient: "from-primary to-primary/80",
        priority: 6,
      });
    }

    // Default action if nothing else
    if (actions.length === 0) {
      actions.push({
        id: "default",
        title: "Explore suas funcionalidades",
        description: "Descubra todas as ferramentas disponíveis para gerenciar sua carreira",
        link: "/agenda",
        icon: Zap,
        gradient: "from-muted-foreground to-muted-foreground",
        priority: 99,
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  };

  const actions = getRecommendedActions();
  const primaryAction = actions[0];
  const secondaryActions = actions.slice(1, 3);
  const Icon = primaryAction.icon;
  const primaryFeatureKey = routeToFeatureKey[primaryAction.link];
  const isPrimaryBlocked = primaryFeatureKey ? isBlocked(primaryFeatureKey) : false;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-sm">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-bold text-foreground">Próximo Passo</h3>
        </div>

        {/* Primary Action */}
        <Link
          to={primaryAction.link}
          onClick={(e) => handleActionClick(e, primaryAction.link)}
          className="group block mb-4"
        >
          <div className={cn(
            "relative overflow-hidden rounded-xl p-4 transition-all duration-300",
            "bg-gradient-to-r hover:scale-[1.02]",
            isPrimaryBlocked ? "from-muted to-muted-foreground/50 opacity-75" : primaryAction.gradient
          )}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                {isPrimaryBlocked ? (
                  <Lock className="w-6 h-6 text-white" />
                ) : (
                  <Icon className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                  {primaryAction.title}
                  {isPrimaryBlocked && <Lock className="w-4 h-4" />}
                </h4>
                <p className="text-white/80 text-sm mt-0.5 line-clamp-2">
                  {isPrimaryBlocked ? "Faça upgrade para acessar" : primaryAction.description}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
          </div>
        </Link>

        {/* Secondary Actions */}
        {secondaryActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Outras sugestões</p>
            <div className="grid grid-cols-1 gap-2">
              {secondaryActions.map((action) => {
                const ActionIcon = action.icon;
                const featureKey = routeToFeatureKey[action.link];
                const actionIsBlocked = featureKey ? isBlocked(featureKey) : false;
                return (
                  <Link
                    key={action.id}
                    to={action.link}
                    onClick={(e) => handleActionClick(e, action.link)}
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-xl border transition-all",
                      actionIsBlocked 
                        ? "bg-muted/30 border-border opacity-60" 
                        : "bg-secondary/50 border-border hover:border-primary/30 hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      actionIsBlocked ? "from-muted to-muted-foreground/50" : action.gradient
                    )}>
                      {actionIsBlocked ? (
                        <Lock className="w-4 h-4 text-white" />
                      ) : (
                        <ActionIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                        {action.title}
                        {actionIsBlocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
