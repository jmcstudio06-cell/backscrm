import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Lightbulb, Gift, Palette, X } from "lucide-react";
import backstageIcon from "@/assets/backstage-icon.png";

const items = [
  { icon: BookOpen, label: "Tutoriais", path: "/tutoriais", desc: "Aprenda a usar a plataforma" },
  { icon: Lightbulb, label: "Sugestões", path: "/sugestoes", desc: "Envie ideias e feedback" },
  { icon: Gift, label: "Indique e Ganhe", path: "/indicacoes", desc: "Indique amigos e ganhe" },
  { icon: Palette, label: "Brindes", path: "/kit-profissional/artes", desc: "Artes editáveis no Canva" },
];

export function HelpFab() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

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

  return (
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

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform overflow-hidden ring-2 ring-primary/30 p-0"
        aria-label="Abrir central de ajuda"
      >
        <img
          src={backstageIcon}
          alt="Backstage"
          className="w-full h-full object-cover rounded-full block"
        />
      </button>
    </div>
  );
}
