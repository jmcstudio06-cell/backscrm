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
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-card group hover:shadow-elevated transition-all duration-500">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-60" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:opacity-80 opacity-50 transition-opacity duration-700" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-warning to-orange-500 shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Próximo Passo</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ação recomendada</p>
          </div>
        </div>

        {/* Primary Action */}
        <Link
          to={primaryAction.link}
          onClick={(e) => handleActionClick(e, primaryAction.link)}
          className="group/action block mb-4"
        >
          <div className={cn(
            "relative overflow-hidden rounded-2xl p-5 transition-all duration-500",
            "bg-gradient-to-r hover:scale-[1.02] hover:shadow-float",
            isPrimaryBlocked ? "from-muted to-muted-foreground/50 opacity-75" : primaryAction.gradient
          )}>
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover/action:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/action:translate-x-full transition-transform duration-1000" />
            </div>
            
            <div className="flex items-center gap-4 relative">
              <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
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
                <p className="text-white/80 text-sm mt-1 line-clamp-2">
                  {isPrimaryBlocked ? "Faça upgrade para acessar" : primaryAction.description}
                </p>
              </div>
              <div className="p-2 rounded-full bg-white/10 group-hover/action:bg-white/20 transition-colors">
                <ArrowRight className="w-5 h-5 text-white group-hover/action:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Secondary Actions */}
        {secondaryActions.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Outras sugestões</p>
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
                      "group/sec flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                      actionIsBlocked 
                        ? "bg-muted/30 border-border opacity-60" 
                        : "bg-secondary/30 border-border/50 hover:border-primary/30 hover:bg-secondary/50 hover:shadow-card"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-xl bg-gradient-to-br shadow-sm",
                      actionIsBlocked ? "from-muted to-muted-foreground/50" : action.gradient
                    )}>
                      {actionIsBlocked ? (
                        <Lock className="w-4 h-4 text-white" />
                      ) : (
                        <ActionIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                        {action.title}
                        {actionIsBlocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/sec:text-primary group-hover/sec:translate-x-0.5 transition-all" />
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
