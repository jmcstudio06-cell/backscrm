import { Link, useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  FileText, 
  Calendar, 
  Wallet,
  ArrowRight,
  Zap,
  Target,
  Lock,
  ChevronRight,
  Sparkles
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

  const getRecommendedActions = (): Action[] => {
    const actions: Action[] = [];

    if (!hasGoals) {
      actions.push({
        id: "goals",
        title: "Defina suas metas",
        description: "Configure metas de shows, leads e faturamento para acompanhar seu progresso",
        link: "/metas",
        icon: Target,
        gradient: "from-primary to-accent",
        priority: 1,
      });
    }

    if (!hasLeads) {
      actions.push({
        id: "leads",
        title: "Cadastre oportunidades no radar de shows!",
        description: "Organize seus contatos e oportunidades comerciais para vender mais",
        link: "/crm",
        icon: UserPlus,
        gradient: "from-primary to-primary/80",
        priority: 2,
      });
    }

    if (hasLeads && !hasShows) {
      actions.push({
        id: "shows",
        title: "Agende seu primeiro show",
        description: "Transforme seus leads em shows confirmados",
        link: "/agenda",
        icon: Calendar,
        gradient: "from-primary to-accent",
        priority: 3,
      });
    }

    if (hasShows && !hasContracts) {
      actions.push({
        id: "contracts",
        title: "Crie um contrato",
        description: "Formalize seus shows com contratos profissionais",
        link: "/contratos",
        icon: FileText,
        gradient: "from-primary to-accent",
        priority: 4,
      });
    }

    if (pendingCachet > 0) {
      actions.push({
        id: "cachet",
        title: "Acompanhe seus cachês",
        description: `Você tem R$ ${pendingCachet.toLocaleString("pt-BR")} em cachês pendentes`,
        link: "/financeiro",
        icon: Wallet,
        gradient: "from-primary to-accent",
        priority: 5,
      });
    }

    if (upcomingShowsCount > 0) {
      actions.push({
        id: "upcoming",
        title: "Prepare seus próximos shows",
        description: `Você tem ${upcomingShowsCount} show${upcomingShowsCount > 1 ? "s" : ""} chegando. Revise os detalhes!`,
        link: "/agenda",
        icon: Calendar,
        gradient: "from-primary to-accent",
        priority: 6,
      });
    }

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

  const rawActions = getRecommendedActions();
  const primaryAction = rawActions[0];
  const secondaryActions = rawActions.slice(1, 3);
  const Icon = primaryAction.icon;
  const primaryFeatureKey = routeToFeatureKey[primaryAction.link];
  const isPrimaryBlocked = primaryFeatureKey ? isBlocked(primaryFeatureKey) : false;

  const actions = [
    {
      title: primaryAction.title,
      description: primaryAction.description,
      path: primaryAction.link,
      icon: Icon,
      gradient: primaryAction.gradient,
      isBlocked: isPrimaryBlocked
    },
    ...secondaryActions.map(a => ({
      title: a.title,
      description: a.description,
      path: a.link,
      icon: a.icon,
      gradient: "from-primary to-accent",
      isBlocked: routeToFeatureKey[a.link] ? isBlocked(routeToFeatureKey[a.link]) : false
    }))
  ];

  return (
    <div className="relative overflow-hidden rounded-none bg-card border border-border/50 p-6 shadow-card group hover:shadow-elevated transition-all duration-500">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-60" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-none blur-3xl group-hover:opacity-70 opacity-40 transition-opacity duration-700" />

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-none bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Ações Sugeridas</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Próximos passos para crescer</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {actions.length > 0 ? (
            actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={index}
                  onClick={(e) => handleActionClick(e as any, action.path)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-none border transition-all duration-300 group/action",
                    action.isBlocked 
                      ? "bg-muted/30 border-border opacity-60 cursor-not-allowed" 
                      : "bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-none flex items-center justify-center transition-colors shadow-inner bg-gradient-to-br",
                      action.isBlocked ? "from-muted to-muted-foreground/50" : action.gradient
                    )}>
                      {action.isBlocked ? (
                        <Lock className="w-5 h-5 text-white" />
                      ) : (
                        <ActionIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground group-hover/action:text-primary transition-colors flex items-center gap-2">
                        {action.title}
                        {action.isBlocked && <Lock className="w-3 h-3" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {action.isBlocked ? "Faça upgrade para acessar" : action.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/action:translate-x-1 transition-all" />
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 bg-secondary/20 rounded-none border border-dashed border-border">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 opacity-50" />
              <p className="text-sm font-bold text-foreground">Tudo em dia!</p>
              <p className="text-xs text-muted-foreground mt-1">Você está seguindo todos os passos recomendados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}