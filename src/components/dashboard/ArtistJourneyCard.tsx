import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Music, 
  DollarSign, 
  FileText, 
  CheckSquare, 
  LayoutDashboard,
  Crown,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface JourneyStep {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  completed: boolean;
  current?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

interface ArtistJourneyCardProps {
  trialStart: string | null;
  showsCount: number;
  totalRevenue: number;
  contractsCount: number;
  checklistsUsed: boolean;
  stageMappingsCount: number;
}

export function ArtistJourneyCard({
  trialStart,
  showsCount,
  totalRevenue,
  contractsCount,
  checklistsUsed,
  stageMappingsCount,
}: ArtistJourneyCardProps) {
  // Calculate artist level based on achievements
  const getArtistLevel = () => {
    const achievements = [
      showsCount >= 1,
      totalRevenue > 0,
      contractsCount >= 1,
      checklistsUsed,
      stageMappingsCount >= 1,
    ];
    const completedCount = achievements.filter(Boolean).length;
    
    if (completedCount >= 5) return { name: "Artista Profissional", icon: Crown };
    if (completedCount >= 3) return { name: "Artista Organizado", icon: Sparkles };
    if (completedCount >= 1) return { name: "Artista em Evolução", icon: Music };
    return { name: "Seu Nível Atual", icon: Sparkles };
  };

  const artistLevel = getArtistLevel();
  
  // Has at least one professionalization feature
  const hasProfessionalization = contractsCount >= 1 || checklistsUsed || stageMappingsCount >= 1;

  // Build journey steps - new order: Início → Shows → Profissionalização → Faturamento → Nível
  const journeySteps: JourneyStep[] = [
    {
      id: "entrada",
      title: "Primeiro passo dado",
      subtitle: trialStart 
        ? `Conta criada em ${format(parseISO(trialStart), "dd/MM/yyyy", { locale: ptBR })}`
        : "Bem-vindo!",
      icon: Sparkles,
      completed: true,
    },
    {
      id: "shows",
      title: "Shows organizados",
      subtitle: showsCount > 0 
        ? `${showsCount} registrado${showsCount > 1 ? 's' : ''}` 
        : "Nenhum show registrado ainda",
      icon: Music,
      completed: showsCount >= 1,
      current: showsCount === 0,
      ctaText: showsCount === 0 ? "Registrar show" : undefined,
      ctaLink: showsCount === 0 ? "/agenda" : undefined,
    },
    {
      id: "profissionalizacao",
      title: "Estrutura profissional",
      subtitle: hasProfessionalization 
        ? [
            contractsCount >= 1 && "Contratos",
            checklistsUsed && "Checklist",
            stageMappingsCount >= 1 && "Mapa de Palco"
          ].filter(Boolean).join(" • ")
        : "Sua estrutura ainda está incompleta",
      icon: FileText,
      completed: hasProfessionalization,
      current: showsCount >= 1 && !hasProfessionalization,
      ctaText: !hasProfessionalization && showsCount >= 1 ? "Criar contrato" : undefined,
      ctaLink: !hasProfessionalization && showsCount >= 1 ? "/contratos" : undefined,
    },
    {
      id: "faturamento",
      title: "Faturamento organizado",
      subtitle: totalRevenue > 0 
        ? `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
        : "Você ainda não acompanha seus ganhos",
      icon: DollarSign,
      completed: totalRevenue > 0,
      current: hasProfessionalization && totalRevenue === 0,
      ctaText: totalRevenue === 0 && hasProfessionalization ? "Registrar receita" : undefined,
      ctaLink: totalRevenue === 0 && hasProfessionalization ? "/financeiro" : undefined,
    },
    {
      id: "nivel",
      title: "Seu nível hoje",
      subtitle: artistLevel.name,
      icon: artistLevel.icon,
      completed: true,
    },
  ];

  // Find the single active CTA (first incomplete step with CTA)
  const activeCTAStep = journeySteps.find(step => step.ctaText && step.ctaLink);

  return (
    <div className="rounded-xl bg-card border border-border p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Sua Jornada na Backstage</h3>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex items-start justify-between min-w-[500px]">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === journeySteps.length - 1;
            const isActive = step === activeCTAStep;
            const isHighlightedValue = step.id !== "entrada" && step.completed;
            
            return (
              <div key={step.id} className="flex items-start flex-1">
                {/* Step */}
                <div className="flex flex-col items-center text-center flex-1">
                  {/* Icon Circle */}
                  <div className={cn(
                    "relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all",
                    step.completed 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {step.completed && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>

                  {/* Step Title */}
                  <p className={cn(
                    "mt-2 text-xs font-medium leading-tight max-w-[80px] sm:max-w-[100px]",
                    step.completed ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>

                  {/* Subtitle - Highlighted for important values */}
                  {step.subtitle && (
                    <p className={cn(
                      "mt-0.5 text-[10px] sm:text-xs leading-tight max-w-[80px] sm:max-w-[100px]",
                      isHighlightedValue 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground"
                    )}>
                      {step.subtitle}
                    </p>
                  )}

                  {/* CTA Button */}
                  {isActive && step.ctaLink && (
                    <Link
                      to={step.ctaLink}
                      className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {step.ctaText}
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex items-center h-10 sm:h-11 flex-shrink-0">
                    <div className={cn(
                      "w-6 sm:w-10 h-0.5 rounded-full",
                      step.completed ? "bg-primary/40" : "bg-border"
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
