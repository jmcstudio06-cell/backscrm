import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  ArrowDown,
  Check,
} from "lucide-react";

interface InstallPromptModalProps {
  open: boolean;
  onClose: () => void;
}

let deferredPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function InstallPromptModal({ open, onClose }: InstallPromptModalProps) {
  const [installing, setInstalling] = useState(false);
  const [canAutoInstall, setCanAutoInstall] = useState(!!deferredPrompt);

  useEffect(() => {
    const handler = () => setCanAutoInstall(true);
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem("install_prompt_dismissed", Date.now().toString());
    onClose();
  };

  const handleAutoInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        deferredPrompt = null;
      }
    } catch (e) {
      console.error("Install error:", e);
    } finally {
      setInstalling(false);
      dismiss();
    }
  };

  const ios = isIOS();

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">
            Instale o Backstage Pro
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p>
              Tenha acesso rápido direto da sua tela inicial, como um app de verdade!
            </p>

            {canAutoInstall ? (
              <p className="text-sm text-muted-foreground">
                Clique em <strong>"Instalar"</strong> para adicionar ao seu celular.
              </p>
            ) : ios ? (
              <div className="bg-muted p-3 rounded-lg text-left text-sm space-y-2">
                <p className="font-medium">Como instalar no iPhone:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>
                    Toque no botão{" "}
                    <span className="font-medium inline-flex items-center gap-1">
                      Compartilhar <Share className="w-3 h-3 inline" />
                    </span>
                  </li>
                  <li>
                    Role e toque em{" "}
                    <span className="font-medium inline-flex items-center gap-1">
                      "Adicionar à Tela de Início" <PlusSquare className="w-3 h-3 inline" />
                    </span>
                  </li>
                  <li>
                    Toque em <span className="font-medium">"Adicionar"</span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="bg-muted p-3 rounded-lg text-left text-sm space-y-2">
                <p className="font-medium">Como instalar:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>
                    Toque no menu{" "}
                    <span className="font-medium inline-flex items-center gap-1">
                      <MoreVertical className="w-3 h-3 inline" /> (três pontinhos)
                    </span>
                  </li>
                  <li>
                    Toque em{" "}
                    <span className="font-medium inline-flex items-center gap-1">
                      "Instalar aplicativo" <Download className="w-3 h-3 inline" />
                    </span>
                  </li>
                  <li>
                    Confirme tocando em <span className="font-medium">"Instalar"</span>
                  </li>
                </ol>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={dismiss} className="w-full">
            Depois
          </AlertDialogCancel>
          {canAutoInstall ? (
            <AlertDialogAction
              onClick={handleAutoInstall}
              disabled={installing}
              className="w-full"
            >
              <Download className="mr-2 w-4 h-4" />
              {installing ? "Instalando..." : "Instalar Agora"}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={dismiss} className="w-full">
              <Check className="mr-2 w-4 h-4" />
              Entendi
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
