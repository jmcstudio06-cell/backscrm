import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Lock, Settings, UserCheck } from "lucide-react";
import { FeatureBlockedDialog } from "@/components/layout/FeatureBlockedDialog";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    label: "Agenda",
    path: "/agenda",
    featureKey: "agenda",
    icon: Calendar,
  },
  {
    label: "Resumo mensal",
    path: "/financeiro",
    featureKey: "financeiro",
    icon: DollarSign,
  },
  {
    label: "Clientes",
    path: "/clientes",
    featureKey: "clientes",
    icon: UserCheck,
  },
  {
    label: "Configurações",
    path: "/configuracoes",
    featureKey: "configuracoes",
    icon: Settings,
  },
] as const;

export function QuickAccessActions() {
  const navigate = useNavigate();
  const { isBlocked, loading } = useFeatureBlocks();
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);
  const [blockedFeatureName, setBlockedFeatureName] = useState("");

  const handleActionClick = (label: string, path: string, featureKey: string) => {
    const blocked = !loading && isBlocked(featureKey);

    if (blocked) {
      setBlockedFeatureName(label);
      setBlockedDialogOpen(true);
      return;
    }

    navigate(path);
  };

  return (
    <>
      <div className="animate-fade-in">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-sm sm:p-4">
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action) => {
              const blocked = !loading && isBlocked(action.featureKey);
              const Icon = action.icon;

              return (
                <button
                  key={action.path}
                  type="button"
                  title={action.label}
                  aria-label={blocked ? `${action.label} bloqueado` : action.label}
                  onClick={() => handleActionClick(action.label, action.path, action.featureKey)}
                  className={cn(
                    "group relative flex aspect-square w-full items-center justify-center rounded-full border border-border/60 bg-muted/40 text-foreground shadow-sm transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    blocked
                      ? "opacity-70 hover:bg-muted"
                      : "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  {blocked && (
                    <span className="absolute right-1.5 top-1.5 rounded-full border border-border/70 bg-background/95 p-1 text-muted-foreground shadow-sm sm:right-2 sm:top-2">
                      <Lock className="h-3 w-3" />
                    </span>
                  )}
                  <span className="sr-only">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <FeatureBlockedDialog
        open={blockedDialogOpen}
        onOpenChange={setBlockedDialogOpen}
        featureName={blockedFeatureName}
      />
    </>
  );
}
