import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Lock, Settings, UserCheck } from "lucide-react";
import { FeatureBlockedDialog } from "@/components/layout/FeatureBlockedDialog";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);
  const [blockedFeatureName, setBlockedFeatureName] = useState("");

  if (!isMobile) return null;

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
        <div className="flex items-center justify-center gap-6 sm:gap-8">
          {quickActions.map((action) => {
            const blocked = !loading && isBlocked(action.featureKey);
            const Icon = action.icon;

            return (
              <button
                key={action.path}
                type="button"
                onClick={() => handleActionClick(action.label, action.path, action.featureKey)}
                className="group flex flex-col items-center gap-1.5 focus-visible:outline-none"
              >
                <div
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200",
                    blocked
                      ? "opacity-60"
                      : "group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md",
                  )}
                >
                  <Icon className="h-5 w-5 text-foreground/80" />
                  {blocked && (
                    <span className="absolute -right-1 -top-1 rounded-full border border-border/70 bg-background p-0.5 text-muted-foreground shadow-sm">
                      <Lock className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {action.label}
                </span>
              </button>
            );
          })}
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
