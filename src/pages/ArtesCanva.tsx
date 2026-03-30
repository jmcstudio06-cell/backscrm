import { ArrowLeft, Palette, ExternalLink, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Links placeholder - you can add Canva links here later
const CANVA_LINKS: { title: string; url: string }[] = [
  // { title: "Story - Divulgação de Show", url: "https://canva.com/..." },
  // { title: "Feed - Agenda Semanal", url: "https://canva.com/..." },
];

export default function ArtesCanva() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/kit-profissional")}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Artes Editáveis</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Top message */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2">
          <Gift className="w-8 h-8 text-primary mx-auto" />
          <p className="text-foreground font-semibold text-lg leading-relaxed">
            Presente do Backstage Pro para você divulgar seus shows com mais profissionalismo
          </p>
        </div>

        {/* Links list */}
        {CANVA_LINKS.length > 0 ? (
          <div className="space-y-3">
            {CANVA_LINKS.map((link, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/80 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">{link.title}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(link.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  Editar no Canva
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border border-dashed bg-secondary/30 p-10 text-center">
            <Palette className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              As artes estão sendo preparadas e serão adicionadas em breve!
            </p>
            <p className="text-muted-foreground/70 text-sm mt-1">
              Volte aqui depois para acessar os templates do Canva.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
