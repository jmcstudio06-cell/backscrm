import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Smartphone, Monitor, Eye, Lightbulb } from "lucide-react";

interface LivePreviewFrameProps {
  url: string | null;
  title?: string;
  subtitle?: string;
  /** Reload the iframe whenever this value changes (e.g. updated_at). */
  refreshKey?: string | number;
}

type DeviceMode = "mobile" | "desktop";

/**
 * Mostra a página pública (Link na bio / Link Agenda) ao vivo dentro de um
 * mockup. O cliente vê EXATAMENTE como o link fica enquanto configura.
 *
 * Como o perfil tem autosave, basta o cliente clicar em "Atualizar prévia"
 * (ou trocar de aba/dispositivo) para ver as últimas mudanças refletidas.
 */
export function LivePreviewFrame({
  url,
  title = "Prévia ao vivo",
  subtitle = "É exatamente assim que sua página pública aparece",
  refreshKey,
}: LivePreviewFrameProps) {
  const [device, setDevice] = useState<DeviceMode>("mobile");
  const [nonce, setNonce] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Atualiza a prévia automaticamente quando o perfil muda (autosave).
  useEffect(() => {
    setNonce((n) => n + 1);
  }, [refreshKey]);

  const reload = () => setNonce((n) => n + 1);

  const iframeSrc = url ? `${url}${url.includes("?") ? "&" : "?"}_p=${nonce}` : null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground text-sm sm:text-base truncate">{title}</h3>
            <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle dispositivo */}
          <div className="flex rounded-lg border border-border bg-secondary/40 p-0.5">
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                device === "mobile"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Visualizar como celular"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Celular</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                device === "desktop"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Visualizar como computador"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
          </div>

          <Button size="sm" variant="outline" onClick={reload} className="h-8 gap-1.5" disabled={!url}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>

          {url && (
            <Button size="sm" variant="outline" asChild className="h-8 w-8 p-0">
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Abrir em nova aba">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Stage */}
      <div className="bg-gradient-to-b from-secondary/30 to-secondary/10 p-4 sm:p-6 flex justify-center">
        {!iframeSrc ? (
          <div className="w-full max-w-md py-16 text-center text-sm text-muted-foreground italic">
            Configure seu nome artístico no Perfil para ver a prévia da sua página.
          </div>
        ) : device === "mobile" ? (
          // Mockup de celular
          <div className="relative">
            <div
              className="relative rounded-[2.2rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl overflow-hidden"
              style={{ width: 320, height: 640 }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-zinc-900 rounded-b-2xl z-10" />
              <iframe
                ref={iframeRef}
                key={`mobile-${nonce}`}
                src={iframeSrc}
                title="Prévia da página pública"
                className="w-full h-full bg-white"
                loading="lazy"
              />
            </div>
            <p className="text-center mt-3 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              375 × 750 · iPhone
            </p>
          </div>
        ) : (
          // Mockup desktop
          <div className="w-full max-w-4xl">
            <div className="rounded-t-xl border border-border bg-zinc-900 px-3 py-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div className="flex-1 mx-3 px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-400 truncate">
                {url}
              </div>
            </div>
            <div
              className="border border-t-0 border-border rounded-b-xl overflow-hidden bg-white"
              style={{ height: 600 }}
            >
              <iframe
                key={`desktop-${nonce}`}
                src={iframeSrc}
                title="Prévia da página pública"
                className="w-full h-full"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>

      {/* Dica */}
      <div className="px-5 py-3 border-t border-border/50 bg-secondary/20">
        <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <Lightbulb className="w-3 h-3 text-warning" />
          As alterações são salvas automaticamente. Clique em <span className="font-semibold text-foreground">Atualizar</span> para recarregar a prévia.
        </p>
      </div>
    </div>
  );
}
