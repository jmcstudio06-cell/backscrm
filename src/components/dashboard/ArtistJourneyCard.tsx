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
    <div className="relative overflow-hidden rounded-none bg-card border border-border/50 p-5 sm:p-6 shadow-card group hover:shadow-elevated transition-all duration-500">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 opacity-70" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-none blur-3xl opacity-50" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-none bg-gradient-to-br from-primary to-accent shadow-lg">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Sua Jornada na Backstage</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Progresso atual</p>
          </div>
        </div>

        {/* Timeline - Horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6 pb-2">
          <div className="flex items-start justify-between min-w-[520px] gap-1">
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
                      "relative w-12 h-12 rounded-none flex items-center justify-center transition-all duration-300 shadow-lg",
                      step.completed 
                        ? "bg-gradient-to-br from-primary to-accent text-white" 
                        : "bg-muted/50 text-muted-foreground border border-border/50"
                    )}>
                      <Icon className="w-5 h-5" />
                      {step.completed && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-none border-2 border-card flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">✓</span>
                        </div>
                      )}
                    </div>

                    {/* Step Title */}
                    <p className={cn(
                      "mt-3 text-xs font-semibold leading-tight max-w-[85px] sm:max-w-[100px]",
                      step.completed ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>

                    {/* Subtitle - Highlighted for important values */}
                    {step.subtitle && (
                      <p className={cn(
                        "mt-1 text-[10px] sm:text-xs leading-tight max-w-[85px] sm:max-w-[100px]",
                        isHighlightedValue 
                          ? "font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" 
                          : "text-muted-foreground"
                      )}>
                        {step.subtitle}
                      </p>
                    )}

                    {/* CTA Button */}
                    {isActive && step.ctaLink && (
                      <Link
                        to={step.ctaLink}
                        className="mt-2 inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-none bg-primary/5 hover:bg-primary/10"
                      >
                        {step.ctaText}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="flex items-center h-12 flex-shrink-0 px-1">
                      <div className={cn(
                        "w-8 sm:w-12 h-1 rounded-none transition-all duration-500",
                        step.completed 
                          ? "bg-gradient-to-r from-primary to-accent" 
                          : "bg-border"
                      )} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
