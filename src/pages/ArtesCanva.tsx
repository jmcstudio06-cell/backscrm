import { ArrowLeft, Palette, ExternalLink, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import canvaArte1 from "@/assets/canva-arte-1.png";
import canvaArte2 from "@/assets/canva-arte-2.png";
import canvaArte3 from "@/assets/canva-arte-3.png";
import canvaArte4 from "@/assets/canva-arte-4.png";
import canvaArte5 from "@/assets/canva-arte-5.png";
import canvaArte6 from "@/assets/canva-arte-6.png";
import canvaArte7 from "@/assets/canva-arte-7.png";
import canvaArte8 from "@/assets/canva-arte-8.png";
import canvaArte9 from "@/assets/canva-arte-9.png";

const CANVA_LINKS = [
  {
    title: "Agenda do Mês",
    description: "Divulgue sua agenda mensal de shows com estilo profissional",
    image: canvaArte1,
    url: "https://www.canva.com/design/DAG_uJwm0Wk/oQ7HAnbbjoIYd0RA8NoTNg/view?utm_content=DAG_uJwm0Wk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  },
  {
    title: "Flyer de Evento",
    description: "Arte pronta para divulgar shows e eventos com lineup",
    image: canvaArte2,
    url: "https://www.canva.com/design/DAGgN_mxb_w/3xSla0etzavLbISum_sRlQ/view?utm_content=DAGgN_mxb_w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  },
  {
    title: "Próximos Shows",
    description: "Modelo para divulgar suas próximas datas e cidades",
    image: canvaArte3,
    url: "https://www.canva.com/design/DAGJP5Pf8D4/OeeCIRL912-e6N9N7UCoBA/view?utm_content=DAGJP5Pf8D4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  },
  {
    title: "Cartaz de Show",
    description: "Cartaz profissional para divulgação de eventos",
    image: canvaArte4,
    url: "https://www.canva.com/design/DAFwV5Z7gA8/lTdvPvTKsXM76jjQVT74Vw/view?utm_content=DAFwV5Z7gA8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  },
  {
    title: "Carnaval / Festival",
    description: "Arte para divulgar festivais e eventos de grande porte",
    image: canvaArte5,
    url: "https://www.canva.com/design/DAF6vHMgct0/lPLuoXSOxMscjhZdwmgJdg/view?utm_content=DAF6vHMgct0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  },
  {
    title: "Save the Date",
    description: "Anuncie suas próximas datas com visual moderno e impactante",
    image: canvaArte6,
    url: "https://www.canva.com/design/DAGvUes2uog/cphyxJ3UbkDf5OOPiJVhnA/view?utm_content=DAGvUes2uog&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  },
  {
    title: "Show com Convidados",
    description: "Modelo vibrante para divulgar shows com artistas convidados",
    image: canvaArte7,
    url: "https://www.canva.com/design/DAGeQNpKjqg/2gkZarkInz7YPATDc6MeGw/view?utm_content=DAGeQNpKjqg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  },
  {
    title: "Show Sertanejo",
    description: "Arte rústica perfeita para shows e eventos sertanejos",
    image: canvaArte8,
    url: "https://www.canva.com/design/DAGDXT_pVK4/I8J-MZvqEVxyptKMMrmGkQ/view?utm_content=DAGDXT_pVK4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  },
  {
    title: "Data do Show",
    description: "Layout moderno e neon para destacar a data do seu próximo show",
    image: canvaArte9,
    url: "https://www.canva.com/design/DAF9di9KJTc/WGJb_uYhJ8J20QnEy7l9fw/view?utm_content=DAF9di9KJTc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  },
];

export default function ArtesCanva() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/kit-profissional")}
            aria-label="Voltar ao Kit Profissional"
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

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Present banner */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2">
          <Gift className="w-8 h-8 text-primary mx-auto" />
          <p className="text-foreground font-semibold text-lg leading-relaxed">
            Presente do Backstage Pro para você divulgar seus shows com mais profissionalismo
          </p>
          <p className="text-muted-foreground text-sm">
            Clique em qualquer arte para editar no Canva gratuitamente
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {CANVA_LINKS.map((link, i) => (
            <button
              key={i}
              onClick={() => window.open(link.url, "_blank")}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300 bg-card border border-border flex flex-col hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 hover:scale-[1.03]"
            >
              {/* Cover image */}
              <div className="relative aspect-[3/2] overflow-hidden">
                <img
                  src={link.image}
                  alt={link.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4 flex flex-col flex-1">
                <h3 className="font-bold text-foreground text-sm sm:text-base leading-tight line-clamp-2">
                  {link.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2 mt-1.5">
                  {link.description}
                </p>
                <div className="mt-auto pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary">
                    Editar no Canva
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
