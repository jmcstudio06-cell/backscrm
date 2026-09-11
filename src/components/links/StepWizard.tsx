import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  PartyPopper,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  content: ReactNode;
}

interface StepWizardProps {
  steps: WizardStep[];
  previewUrl?: string | null;
  previewTitle?: string;
  previewDescription?: string;
  onSave?: () => Promise<void> | void;
  saving?: boolean;
}

export function StepWizard({
  steps,
  previewUrl,
  previewTitle = "Tudo pronto!",
  previewDescription = "Sua página está configurada. Abra o link para ver como ficou.",
  onSave,
  saving,
}: StepWizardProps) {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const finalStep: WizardStep = {
    id: "__final",
    title: "Ver como ficou",
    description: previewDescription,
    icon: PartyPopper,
    content: (
      <div className="space-y-6 py-2">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-lg">
            <PartyPopper className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bold text-foreground text-xl">{previewTitle}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{previewDescription}</p>
          </div>
        </div>

        {previewUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-border/50">
              <code className="flex-1 text-xs sm:text-sm truncate text-foreground">{previewUrl}</code>
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(previewUrl);
                  setCopied(true);
                  toast.success("Link copiado!");
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button asChild size="lg" variant="gradient" className="w-full gap-2">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Abrir minha página
              </a>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-4 bg-secondary/30 rounded-xl border border-border/50">
            Configure seu nome artístico no Perfil Artístico para gerar este link.
          </p>
        )}
      </div>
    ),
  };

  const allSteps = [...steps, finalStep];
  const total = allSteps.length;
  const current = allSteps[Math.min(index, total - 1)];
  const isLast = index === total - 1;
  const StepIcon = current.icon;
  const working = busy || saving;
  const progress = ((index + 1) / total) * 100;

  const goTo = async (next: number) => {
    if (next > index && onSave) {
      try {
        setBusy(true);
        await onSave();
      } finally {
        setBusy(false);
      }
    }
    setIndex(Math.max(0, Math.min(total - 1, next)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      {/* ── Stepper visual ── */}
      <div className="rounded-2xl border bg-card/60 overflow-hidden">
        {/* Barra de progresso topo */}
        <div className="h-1.5 bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-4 py-3 flex items-center justify-between gap-3">
          {/* Etapa atual */}
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              isLast
                ? "bg-emerald-500 text-white"
                : "bg-primary text-primary-foreground"
            )}>
              {isLast ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{current.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {index + 1} de {total}
              </p>
            </div>
          </div>

          {/* Dots de navegação — clicáveis */}
          <div className="flex items-center gap-1.5 shrink-0">
            {allSteps.map((s, i) => {
              const done = i < index;
              const active = i === index;
              return (
                <button
                  key={s.id}
                  type="button"
                  title={s.title}
                  onClick={() => goTo(i)}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    active
                      ? "w-6 h-2.5 bg-primary"
                      : done
                        ? "w-2.5 h-2.5 bg-emerald-500"
                        : "w-2.5 h-2.5 bg-border hover:bg-muted-foreground/40"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Linha de etapas scrollável (desktop) — oculta no mobile */}
        <div className="hidden sm:flex border-t overflow-x-auto scrollbar-hide">
          {allSteps.map((s, i) => {
            const done = i < index;
            const active = i === index;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-r last:border-r-0 transition-colors shrink-0",
                  active
                    ? "bg-primary/5 text-primary border-b-2 border-b-primary"
                    : done
                      ? "text-emerald-600 hover:bg-secondary/50"
                      : "text-muted-foreground hover:bg-secondary/30"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                  active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"
                )}>
                  {done ? <Check className="w-3 h-3" /> : Icon ? <Icon className="w-3 h-3" /> : i + 1}
                </span>
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Conteúdo da etapa ── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Header da etapa */}
        <div className={cn(
          "px-5 pt-5 pb-4 border-b",
          "bg-gradient-to-r from-primary/5 to-transparent"
        )}>
          <div className="flex items-center gap-3">
            {StepIcon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md shrink-0">
                <StepIcon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight">
                {current.title}
              </h3>
              {current.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {current.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-5">{current.content}</div>

        {/* Rodapé de navegação */}
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goTo(index - 1)}
            disabled={index === 0 || working}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>

          {/* Indicador central */}
          <p className="text-xs text-muted-foreground hidden sm:block">
            {index + 1} / {total}
          </p>

          {isLast ? (
            <Button variant="outline" size="sm" onClick={() => goTo(0)} disabled={working} className="gap-1.5">
              Recomeçar
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => goTo(index + 1)}
              disabled={working}
              className="gap-1.5"
            >
              {working ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Salvar e continuar
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
