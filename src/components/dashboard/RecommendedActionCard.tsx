import { Link } from "react-router-dom";
import { 
  UserPlus, 
  FileText, 
  Calendar, 
  Wallet,
  ArrowRight,
  Zap,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        gradient: "from-cyan-500 to-blue-600",
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
        gradient: "from-emerald-500 to-green-600",
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
        gradient: "from-amber-500 to-orange-600",
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
        gradient: "from-indigo-500 to-blue-600",
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
        gradient: "from-slate-500 to-gray-600",
        priority: 99,
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  };

  const actions = getRecommendedActions();
  const primaryAction = actions[0];
  const secondaryActions = actions.slice(1, 3);
  const Icon = primaryAction.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-violet-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Próximo Passo</h3>
        </div>

        {/* Primary Action */}
        <Link
          to={primaryAction.link}
          className="group block mb-4"
        >
          <div className={cn(
            "relative overflow-hidden rounded-xl p-4 transition-all duration-300",
            "bg-gradient-to-r hover:scale-[1.02]",
            primaryAction.gradient
          )}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-lg">{primaryAction.title}</h4>
                <p className="text-white/80 text-sm mt-0.5 line-clamp-2">{primaryAction.description}</p>
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
            <p className="text-xs text-slate-500 uppercase tracking-wider">Outras sugestões</p>
            <div className="grid grid-cols-1 gap-2">
              {secondaryActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.id}
                    to={action.link}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/80 transition-all"
                  >
                    <div className={cn("p-2 rounded-lg bg-gradient-to-br", action.gradient)}>
                      <ActionIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{action.title}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
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
