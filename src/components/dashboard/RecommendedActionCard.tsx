import { Link, useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  FileText, 
  Calendar, 
  Wallet,
  ArrowRight,
  Target,
  Lock,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  benefit: string;
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

    if (!hasContracts) {
      actions.push({
        id: "contracts",
        title: "Crie um contrato",
        description: "Contratos aumentam em até 70% a chance de receber corretamente.",
        benefit: "Proteja sua receita",
        link: "/contratos",
        icon: FileText,
        gradient: "from-primary to-primary/80",
        priority: 1,
      });
    }

    if (!hasGoals) {
      actions.push({
        id: "goals",
        title: "Defina suas metas",
        description: "Artistas com metas definidas crescem 2x mais rápido.",
        benefit: "Acelere seu crescimento",
        link: "/metas",
        icon: Target,
        gradient: "from-violet-500 to-purple-600",
        priority: 2,
      });
    }

    if (!hasLeads) {
      actions.push({
        id: "leads",
        title: "Cadastre seu primeiro lead",
        description: "Comece a organizar seus contatos e oportunidades de shows.",
        benefit: "Organize suas vendas",
        link: "/crm",
        icon: UserPlus,
        gradient: "from-primary to-primary/80",
        priority: 3,
      });
    }

    if (hasLeads && !hasShows) {
      actions.push({
        id: "shows",
        title: "Agende seu primeiro show",
        description: "Transforme seus leads em shows confirmados.",
        benefit: "Feche negócios",
        link: "/agenda",
        icon: Calendar,
        gradient: "from-emerald-500 to-teal-600",
        priority: 4,
      });
    }

    if (pendingCachet > 0) {
      actions.push({
        id: "cachet",
        title: "Acompanhe seus cachês",
        description: `Você tem R$ ${pendingCachet.toLocaleString("pt-BR")} em cachês pendentes.`,
        benefit: "Controle financeiro",
        link: "/financeiro",
        icon: Wallet,
        gradient: "from-rose-500 to-pink-600",
        priority: 5,
      });
    }

    if (upcomingShowsCount > 0) {
      actions.push({
        id: "upcoming",
        title: "Prepare seus próximos shows",
        description: `${upcomingShowsCount} show${upcomingShowsCount > 1 ? "s" : ""} chegando. Revise os detalhes!`,
        benefit: "Organize-se",
        link: "/agenda",
        icon: Calendar,
        gradient: "from-primary to-primary/80",
        priority: 6,
      });
    }

    if (actions.length === 0) {
      actions.push({
        id: "default",
        title: "Continue evoluindo",
        description: "Explore todas as ferramentas para gerenciar sua carreira.",
        benefit: "Cresça sempre",
        link: "/agenda",
        icon: Star,
        gradient: "from-primary to-primary/80",
        priority: 99,
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  };

  const actions = getRecommendedActions();
  const primaryAction = actions[0];
  const Icon = primaryAction.icon;
  const primaryFeatureKey = routeToFeatureKey[primaryAction.link];
  const isPrimaryBlocked = primaryFeatureKey ? isBlocked(primaryFeatureKey) : false;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide">
          Missão Prioritária
        </h3>
      </div>

      {/* Primary Action Card */}
      <div className={cn(
        "relative overflow-hidden rounded-xl p-4 sm:p-5",
        "bg-gradient-to-r",
        isPrimaryBlocked ? "from-muted to-muted-foreground/50 opacity-75" : primaryAction.gradient
      )}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
            {isPrimaryBlocked ? (
              <Lock className="w-6 h-6 text-white" />
            ) : (
              <Icon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
              {primaryAction.title}
              {isPrimaryBlocked && <Lock className="w-4 h-4" />}
            </h4>
            <p className="text-white/80 text-xs sm:text-sm mt-1 leading-relaxed">
              {isPrimaryBlocked ? "Faça upgrade para acessar" : primaryAction.description}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to={primaryAction.link}
          onClick={(e) => handleActionClick(e, primaryAction.link)}
          className="block mt-4"
        >
          <Button
            variant="secondary"
            className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm group"
          >
            {isPrimaryBlocked ? "Ver planos" : `${primaryAction.title.split(" ")[0]} agora`}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
