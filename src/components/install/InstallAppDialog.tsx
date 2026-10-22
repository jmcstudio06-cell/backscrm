import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Download, MoreVertical, PlusSquare, Share, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getInstallPlatform, isInAppBrowser, isIOSSafari } from "@/lib/pwaInstall";
import appIcon from "@/assets/ba-icon.png";

interface InstallAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Step {
  title: string;
  text: ReactNode;
  visual: ReactNode;
}

/* ---------- Small phone mockups that show exactly what to tap ---------- */

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[210px] rounded-[30px] border-[6px] border-slate-900 bg-slate-100 shadow-xl overflow-hidden">
      <div className="mx-auto mt-1.5 h-4 w-20 rounded-full bg-slate-900" />
      <div className="relative h-[230px]">{children}</div>
    </div>
  );
}

function Pulse({ className }: { className?: string }) {
  return (
    <span className={cn("absolute rounded-full border-2 border-primary animate-ping pointer-events-none", className)} aria-hidden />
  );
}

function FakePage() {
  return (
    <div className="space-y-2 p-3">
      <div className="h-3 w-2/3 rounded bg-slate-300" />
      <div className="h-3 w-1/2 rounded bg-slate-200" />
      <div className="mt-3 h-16 rounded-lg bg-white shadow-sm" />
      <div className="h-10 rounded-lg bg-white shadow-sm" />
    </div>
  );
}

function SafariShareVisual() {
  return (
    <Phone>
      <FakePage />
      <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-3 pb-3 pt-2">
        <div className="mb-2 rounded-lg bg-slate-100 px-2 py-1 text-center text-[10px] text-slate-500">backstageproapp.com</div>
        <div className="flex items-center justify-between px-1 text-slate-400">
          <ArrowLeft className="h-4 w-4" />
          <ArrowRight className="h-4 w-4" />
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
            <Share className="h-4 w-4" />
            <Pulse className="inset-0" />
          </span>
          <span className="h-4 w-4 rounded border-2 border-slate-300" />
          <span className="h-4 w-4 rounded border-2 border-slate-300" />
        </div>
      </div>
    </Phone>
  );
}

function ShareSheetVisual() {
  return (
    <Phone>
      <div className="absolute inset-0 bg-slate-900/30" />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-3 space-y-1.5">
        {["Copiar", "Adicionar aos Favoritos"].map((label) => (
          <div key={label} className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] text-slate-500">{label}</div>
        ))}
        <div className="relative flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-[11px] font-semibold text-primary ring-2 ring-primary">
          Adicionar à Tela de Início
          <PlusSquare className="h-4 w-4" />
        </div>
        <div className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] text-slate-500">Imprimir</div>
      </div>
    </Phone>
  );
}

function ConfirmVisual() {
  return (
    <Phone>
      <div className="bg-white p-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-primary/70">Cancelar</span>
          <span className="font-semibold text-slate-700">Tela de Início</span>
          <span className="relative rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary ring-2 ring-primary">Adicionar</span>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-100 p-3">
          <img src={appIcon} alt="" className="h-11 w-11 rounded-xl" />
          <div>
            <p className="text-xs font-semibold text-slate-800">Backstage Pro</p>
            <p className="text-[10px] text-slate-500">backstageproapp.com</p>
          </div>
        </div>
      </div>
    </Phone>
  );
}

function HomeScreenVisual() {
  return (
    <Phone>
      <div className="grid h-full grid-cols-4 content-start gap-3 bg-gradient-to-b from-sky-500 to-indigo-600 p-4">
        {Array.from({ length: 7 }, (_, i) => <span key={i} className="aspect-square rounded-xl bg-white/25" />)}
        <span className="relative flex flex-col items-center gap-1">
          <img src={appIcon} alt="" className="aspect-square w-full rounded-xl ring-2 ring-white shadow-lg animate-bounce" />
          <span className="text-[8px] font-semibold text-white">Backstage</span>
        </span>
      </div>
    </Phone>
  );
}

function AndroidMenuVisual() {
  return (
    <Phone>
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-2 py-2">
        <div className="flex-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">backstageproapp.com</div>
        <span className="relative grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
          <MoreVertical className="h-4 w-4" />
          <Pulse className="inset-0" />
        </span>
      </div>
      <FakePage />
    </Phone>
  );
}

function AndroidInstallVisual() {
  return (
    <Phone>
      <div className="absolute right-2 top-2 w-[150px] space-y-1 rounded-xl bg-white p-2 shadow-xl">
        {["Nova guia", "Histórico", "Compartilhar"].map((label) => (
          <div key={label} className="px-2 py-1.5 text-[11px] text-slate-500">{label}</div>
        ))}
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-2 py-1.5 text-[11px] font-semibold text-primary ring-2 ring-primary">
          <Download className="h-3.5 w-3.5" />Instalar app
        </div>
      </div>
    </Phone>
  );
}

/* ---------- Dialog ---------- */

export function InstallAppDialog({ open, onOpenChange }: InstallAppDialogProps) {
  const [step, setStep] = useState(0);
  const platform = getInstallPlatform();
  const inApp = isInAppBrowser();
  const iosSafari = isIOSSafari();

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/dashboard`);
      toast.success("Link copiado. Cole no navegador e siga os passos.");
    } catch {
      toast.error("Não foi possível copiar. Copie o endereço do navegador.");
    }
  };

  const openInBrowserStep: Step = {
    title: platform === "ios" ? "Abra no Safari" : "Abra no Chrome",
    text: (
      <>
        Você está no navegador de outro app (Instagram, WhatsApp...). Toque nos <strong>três pontinhos</strong> e escolha{" "}
        <strong>{platform === "ios" ? "Abrir no Safari" : "Abrir no Chrome"}</strong>, ou copie o link abaixo.
      </>
    ),
    visual: (
      <div className="flex justify-center py-6">
        <Button variant="outline" onClick={copyLink} className="gap-2"><Copy className="h-4 w-4" />Copiar link do app</Button>
      </div>
    ),
  };

  const iosSteps: Step[] = [
    ...(inApp ? [openInBrowserStep] : []),
    {
      title: "Toque em Compartilhar",
      text: iosSafari ? (
        <>No Safari, toque no ícone <Share className="inline h-4 w-4 align-text-bottom" /> na barra de baixo. No iPad ele fica no topo.</>
      ) : (
        <>Toque no ícone <Share className="inline h-4 w-4 align-text-bottom" /> ao lado da barra de endereço. Se não aparecer, abra este site no <strong>Safari</strong>.</>
      ),
      visual: <SafariShareVisual />,
    },
    {
      title: "Adicionar à Tela de Início",
      text: <>Role a lista para baixo e toque em <strong>Adicionar à Tela de Início</strong> <PlusSquare className="inline h-4 w-4 align-text-bottom" />.</>,
      visual: <ShareSheetVisual />,
    },
    {
      title: "Confirme em Adicionar",
      text: <>Toque em <strong>Adicionar</strong>, no canto superior direito.</>,
      visual: <ConfirmVisual />,
    },
    {
      title: "Pronto!",
      text: <>O ícone do Backstage Pro aparece na sua tela inicial. Abra por ele para usar em tela cheia.</>,
      visual: <HomeScreenVisual />,
    },
  ];

  const androidSteps: Step[] = [
    ...(inApp ? [openInBrowserStep] : []),
    {
      title: "Abra o menu do navegador",
      text: <>Toque nos <strong>três pontinhos</strong> <MoreVertical className="inline h-4 w-4 align-text-bottom" /> no canto superior direito.</>,
      visual: <AndroidMenuVisual />,
    },
    {
      title: "Toque em Instalar app",
      text: <>Escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong> e confirme em <strong>Instalar</strong>.</>,
      visual: <AndroidInstallVisual />,
    },
    {
      title: "Pronto!",
      text: <>O Backstage Pro aparece na sua tela inicial, junto com os outros apps.</>,
      visual: <HomeScreenVisual />,
    },
  ];

  const desktopSteps: Step[] = [
    {
      title: "Instale no computador",
      text: (
        <>
          No Chrome ou Edge, clique no ícone <Download className="inline h-4 w-4 align-text-bottom" /> no fim da barra de endereço, ou abra o
          menu <MoreVertical className="inline h-4 w-4 align-text-bottom" /> e escolha <strong>Instalar Backstage Pro</strong>.
        </>
      ),
      visual: <AndroidInstallVisual />,
    },
  ];

  const steps = platform === "ios" ? iosSteps : platform === "android" ? androidSteps : desktopSteps;
  const current = steps[Math.min(step, steps.length - 1)];
  const isLast = step >= steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden [&>button:last-child]:text-white [&>button:last-child]:opacity-90">
        <div className="bg-gradient-to-br from-primary to-sky-500 px-6 pb-5 pt-6 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20"><Smartphone className="h-6 w-6" /></span>
            <div>
              <DialogTitle className="text-lg text-white">
                Instalar no {platform === "ios" ? "iPhone" : platform === "android" ? "Android" : "computador"}
              </DialogTitle>
              <DialogDescription className="text-white/80">
                {steps.length > 1 ? `Passo ${step + 1} de ${steps.length}` : "Acesso rápido, em tela cheia"}
              </DialogDescription>
            </div>
          </div>
          {steps.length > 1 && (
            <div className="mt-4 flex gap-1.5" aria-hidden>
              {steps.map((_, i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-white" : "bg-white/30")} />
              ))}
            </div>
          )}
        </div>

        <div key={step} className="px-6 pb-2 pt-5 animate-in fade-in slide-in-from-right-4 duration-300">
          {current.visual}
          <h3 className="mt-5 text-base font-semibold text-foreground">{current.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.text}</p>
        </div>

        <div className="flex gap-2 px-6 pb-6 pt-4">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1 h-4 w-4" />Voltar
            </Button>
          )}
          {isLast ? (
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              <Check className="mr-1 h-4 w-4" />Entendi
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => setStep(step + 1)}>
              Próximo<ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
