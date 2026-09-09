import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  PartyPopper,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  content: ReactNode;
}

interface StepWizardProps {
  steps: WizardStep[];
  /** Public URL shown on the final step */
  previewUrl?: string | null;
  previewTitle?: string;
  previewDescription?: string;
  /** Called when the user advances or finishes a step */
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
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-lg">
            <PartyPopper className="w-7 h-7" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">{previewTitle}</p>
            <p className="text-sm text-muted-foreground mt-1">{previewDescription}</p>
          </div>
        </div>

        {previewUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-border/50">
              <code className="flex-1 text-xs sm:text-sm truncate">{previewUrl}</code>
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
            <Button asChild size="lg" variant="gradient" className="w-full">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir minha página
              </a>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-3 bg-secondary/30 rounded-xl border border-border/50">
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

  const working = busy || saving;

  return (
    <div className="space-y-4">
      {/* Progresso */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Etapa {index + 1} de {total}
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.round(((index + 1) / total) * 100)}% concluído
          </p>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allSteps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                i === index
                  ? "bg-primary text-primary-foreground border-primary"
                  : i < index
                    ? "bg-success/10 text-success border-success/30"
                    : "bg-secondary/40 text-muted-foreground border-border/60 hover:border-border"
              }`}
            >
              {i < index && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
              {i + 1}. {s.title}
            </button>
          ))}
        </div>
      </Card>

      {/* Etapa atual */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="flex items-start gap-3">
          {StepIcon && (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md shrink-0">
              <StepIcon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground">
              Etapa {index + 1} — {current.title}
            </h3>
            {current.description && (
              <p className="text-sm text-muted-foreground mt-1">{current.description}</p>
            )}
          </div>
        </div>

        <div>{current.content}</div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            onClick={() => goTo(index - 1)}
            disabled={index === 0 || working}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar
          </Button>

          {isLast ? (
            <Button variant="outline" onClick={() => goTo(0)} disabled={working}>
              Revisar do início
            </Button>
          ) : (
            <Button variant="gradient" onClick={() => goTo(index + 1)} disabled={working}>
              {working ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Salvar e continuar
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
