import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Smartphone, Download, Share, PlusSquare, MoreVertical, CheckCircle2, Apple } from "lucide-react";

let deferredPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1));

export function InstallAppSection() {
  const [canAutoInstall, setCanAutoInstall] = useState(!!deferredPrompt);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    const check = () =>
      setInstalled(
        window.matchMedia?.("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone === true
      );
    check();
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanAutoInstall(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setCanAutoInstall(false);
      deferredPrompt = null;
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        deferredPrompt = null;
        setCanAutoInstall(false);
        toast.success("App instalado! Procure o ícone na sua tela inicial.");
      }
    } catch (err) {
      console.error("Install error:", err);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
      <div className="flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">Instalar o App</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione o Backstage Pro à tela inicial e use como um aplicativo nativo, em tela cheia e com acesso rápido.
          </p>

          {installed ? (
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-primary">
              <CheckCircle2 className="w-4 h-4" />
              App já instalado neste dispositivo
            </div>
          ) : canAutoInstall ? (
            <Button size="sm" className="mt-3 gap-2" onClick={handleInstall} disabled={installing}>
              <Download className="w-4 h-4" />
              {installing ? "Instalando..." : "Instalar App"}
            </Button>
          ) : ios ? (
            <div className="mt-3 rounded-lg border border-border/40 bg-background/60 p-3 space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Apple className="w-4 h-4" />
                Como instalar no iPhone / iPad
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                <li>Abra este site no navegador <strong>Safari</strong>.</li>
                <li>
                  Toque no botão{" "}
                  <span className="font-medium text-foreground inline-flex items-center gap-1">
                    Compartilhar <Share className="w-3.5 h-3.5" />
                  </span>{" "}
                  (na barra inferior).
                </li>
                <li>
                  Role a lista e toque em{" "}
                  <span className="font-medium text-foreground inline-flex items-center gap-1">
                    Adicionar à Tela de Início <PlusSquare className="w-3.5 h-3.5" />
                  </span>
                  .
                </li>
                <li>
                  Confirme em <span className="font-medium text-foreground">Adicionar</span> — o ícone aparecerá na sua
                  tela inicial.
                </li>
              </ol>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-border/40 bg-background/60 p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">Como instalar neste dispositivo</p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                <li>
                  Toque no menu{" "}
                  <span className="font-medium text-foreground inline-flex items-center gap-1">
                    <MoreVertical className="w-3.5 h-3.5" /> do navegador
                  </span>
                  .
                </li>
                <li>
                  Escolha <span className="font-medium text-foreground">Instalar aplicativo</span> ou{" "}
                  <span className="font-medium text-foreground">Adicionar à tela inicial</span>.
                </li>
                <li>
                  Confirme em <span className="font-medium text-foreground">Instalar</span>.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
