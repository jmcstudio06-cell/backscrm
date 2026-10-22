import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Lightbulb, Gift, Palette, X, Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import backstageIcon from "@/assets/backstage-icon.png";
import { InstallAppDialog } from "@/components/install/InstallAppDialog";
import { canPromptInstall, getInstallPlatform, isAppInstalled, isInAppBrowser, promptInstall, subscribeInstallState } from "@/lib/pwaInstall";

const items = [
  { icon: BookOpen, label: "Tutoriais", path: "/tutoriais", desc: "Aprenda a usar a plataforma" },
  { icon: Lightbulb, label: "Sugestões", path: "/sugestoes", desc: "Envie ideias e feedback" },
  { icon: Gift, label: "Indique e Ganhe", path: "/indicacoes", desc: "Indique amigos e ganhe" },
  { icon: Palette, label: "Brindes", path: "/kit-profissional/artes", desc: "Artes editáveis no Canva" },
];

export function HelpFab() {
  const [open, setOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(isAppInstalled);
  const [, forceRender] = useState(0);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const platform = getInstallPlatform();

  useEffect(() => {
    return subscribeInstallState(() => {
      setInstalled(isAppInstalled());
      forceRender((n) => n + 1);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  // Android/desktop: open the browser's native install sheet when it is available.
  // iOS (and browsers without the native sheet): show the step-by-step tutorial.
  const handleInstall = async () => {
    setOpen(false);
    if (platform !== "ios" && !isInAppBrowser() && canPromptInstall()) {
      setInstalling(true);
      try {
        const outcome = await promptInstall();
        if (outcome === "accepted") {
          toast.success("Instalando! O Backstage Pro vai aparecer na sua tela inicial.");
          return;
        }
        if (outcome === "dismissed") return;
      } catch (err) {
        console.error("Install prompt error:", err);
      } finally {
        setInstalling(false);
      }
    }
    setInstallOpen(true);
  };

  const installDesc = platform === "ios" ? "Veja como adicionar no iPhone" : "Adicione à tela inicial";

  return (
    <>
      <div
        ref={ref}
        className="fixed right-4 lg:right-6 bottom-28 lg:bottom-6 z-40 flex flex-col items-end"
      >
        {open && (
          <div
            className="mb-3 w-[260px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden origin-bottom-right animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
          >
            <div className="px-4 py-3 border-b border-border/60 bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Central de ajuda</p>
                <p className="text-xs text-muted-foreground">Acesso rápido</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-2">
              {!installed && (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                    {installing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Instalar app</p>
                    <p className="text-xs text-muted-foreground truncate">{installDesc}</p>
                  </div>
                </button>
              )}
              {items.map((it) => (
                <button
                  key={it.path}
                  onClick={() => go(it.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                    <it.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{it.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{it.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative w-14 h-14">
          {/* Rotating gradient ring */}
          <span
            aria-hidden
            className="absolute -inset-1 rounded-full animate-spin-slow pointer-events-none"
            style={{
              background: "conic-gradient(from 0deg, transparent 0deg, transparent 200deg, hsl(0 100% 75%) 300deg, hsl(0 100% 85%) 360deg)",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            }}
          />
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative w-14 h-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform overflow-hidden ring-2 ring-primary/30 p-0"
            aria-label="Abrir central de ajuda"
          >
            <img
              src={backstageIcon}
              alt="Backstage"
              className="w-full h-full object-cover rounded-full block"
            />
          </button>
        </div>
      </div>

      <InstallAppDialog open={installOpen} onOpenChange={setInstallOpen} />
    </>
  );
}
