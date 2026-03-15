import { useState, useMemo, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { useShows } from "@/contexts/shows/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Download,
  Sparkles,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FlyerFormat = "feed" | "stories";

interface FlyerTemplate {
  id: string;
  label: string;
  desc: string;
  badge: string;
  badgeColor: string;
  agendaType: "day" | "week" | "month";
  previewGradient: string;
}

const TEMPLATES: FlyerTemplate[] = [
  {
    id: "mensal",
    label: "Flyer Mensal",
    desc: "Layout premium com todas as datas do mês",
    badge: "Mensal",
    badgeColor: "bg-blue-600",
    agendaType: "month",
    previewGradient: "from-[#0f172a] via-[#1e293b] to-[#0e7490]",
  },
  {
    id: "hoje",
    label: "Flyer Diário",
    desc: "Destaque elegante para o show de hoje",
    badge: "Diário",
    badgeColor: "bg-red-600",
    agendaType: "day",
    previewGradient: "from-[#0e7490] via-[#0891b2] to-[#155e75]",
  },
  {
    id: "classico",
    label: "Próximos Shows",
    desc: "Card dark com acentos vermelhos e grid",
    badge: "Semanal",
    badgeColor: "bg-emerald-600",
    agendaType: "week",
    previewGradient: "from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]",
  },
  {
    id: "editorial",
    label: "Flyer Editorial",
    desc: "Estilo revista musical premium",
    badge: "Semanal",
    badgeColor: "bg-purple-600",
    agendaType: "week",
    previewGradient: "from-[#111111] via-[#1a1a2e] to-[#111111]",
  },
];

const FORMATS: { id: FlyerFormat; label: string; size: string }[] = [
  { id: "feed", label: "Feed", size: "1080×1080" },
  { id: "stories", label: "Stories", size: "1080×1920" },
];

export default function FlyerDivulgacao() {
  const { shows } = useShows();
  const { profile } = useProfile();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [flyerFormat, setFlyerFormat] = useState<FlyerFormat>("stories");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const getFilteredShows = useCallback(
    (agendaType: string) => {
      const confirmed = shows.filter(
        (s) => s.status === "confirmed" || s.status === "scheduled"
      );

      if (agendaType === "day") {
        return confirmed.filter((s) => s.date === todayStr);
      }

      if (agendaType === "week") {
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        const startStr = startOfWeek.toISOString().split("T")[0];
        const endStr = endOfWeek.toISOString().split("T")[0];
        return confirmed.filter((s) => s.date >= startStr && s.date <= endStr);
      }

      const monthStr = todayStr.slice(0, 7);
      return confirmed.filter((s) => s.date.startsWith(monthStr));
    },
    [shows, todayStr]
  );

  const artistName = profile?.artist_name || profile?.name || "Artista";
  const instagram = profile?.instagram_url
    ? profile.instagram_url
        .replace(/https?:\/\/(www\.)?instagram\.com\//, "@")
        .replace(/\/$/, "")
    : null;

  const generateFlyer = useCallback(
    async (templateId: string, format: FlyerFormat) => {
      setGenerating(true);
      setSelectedTemplate(templateId);
      setGeneratedImage(null);

      try {
        const template = TEMPLATES.find((t) => t.id === templateId)!;
        const filteredShows = getFilteredShows(template.agendaType);

        const { data, error } = await supabase.functions.invoke("generate-flyer", {
          body: {
            shows: filteredShows.map((s) => ({
              date: s.date,
              title: s.title,
              venue: s.venue,
              address: s.address,
              start_time: s.start_time,
            })),
            artistName,
            instagram,
            format,
            templateType: templateId,
          },
        });

        if (error) throw error;

        if (data?.error) {
          toast.error(data.error);
          return;
        }

        if (data?.imageUrl) {
          setGeneratedImage(data.imageUrl);
          toast.success("Flyer gerado com IA! 🎨");
        } else {
          throw new Error("Nenhuma imagem retornada");
        }
      } catch (err: any) {
        console.error("Error generating flyer:", err);
        toast.error(err?.message || "Erro ao gerar flyer");
      } finally {
        setGenerating(false);
      }
    },
    [getFilteredShows, artistName, instagram]
  );

  const downloadFlyer = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.download = `flyer-${selectedTemplate}-${flyerFormat}.png`;
    link.href = generatedImage;
    link.click();
    toast.success("Flyer baixado!");
  };

  const autoGenerateWeek = () => {
    setFlyerFormat("stories");
    generateFlyer("classico", "stories");
  };

  const handleSelectTemplate = (templateId: string) => {
    generateFlyer(templateId, flyerFormat);
  };

  return (
    <Layout title="Flyer Divulgação">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ImageIcon className="w-7 h-7 text-primary" />
              Flyer Divulgação
            </h1>
            <p className="text-muted-foreground mt-1">
              Gere flyers profissionais com IA para divulgar seus shows
            </p>
          </div>
          <Button
            onClick={autoGenerateWeek}
            variant="gradient"
            size="lg"
            disabled={generating}
            className="gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Gerar flyer da semana
          </Button>
        </div>

        {/* Generated image preview */}
        {(generatedImage || generating) && (
          <Card className="border-primary/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-5">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        Gerando com IA...
                      </>
                    ) : (
                      "✨ Flyer Gerado com IA"
                    )}
                  </h3>
                  {!generating && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGeneratedImage(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {generating ? (
                  <div className="w-full max-w-[360px] aspect-[9/16] rounded-xl bg-gradient-to-br from-muted to-muted-foreground/10 flex flex-col items-center justify-center gap-4 border border-border">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground text-center px-6">
                      A IA está criando seu flyer profissional...
                      <br />
                      <span className="text-xs">Isso pode levar ~15 segundos</span>
                    </p>
                  </div>
                ) : (
                  generatedImage && (
                    <>
                      <img
                        src={generatedImage}
                        alt="Flyer gerado por IA"
                        className="w-full max-w-[360px] rounded-xl shadow-2xl border border-border"
                      />
                      <div className="flex gap-3 w-full max-w-[360px]">
                        <Button
                          onClick={downloadFlyer}
                          className="flex-1 gap-2"
                          variant="gradient"
                        >
                          <Download className="w-4 h-4" />
                          Baixar Flyer
                        </Button>
                        <Button
                          onClick={() =>
                            selectedTemplate &&
                            generateFlyer(selectedTemplate, flyerFormat)
                          }
                          variant="outline"
                          className="gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Regerar
                        </Button>
                      </div>
                      {/* Format toggle */}
                      <div className="flex gap-2">
                        {FORMATS.map((fmt) => (
                          <Button
                            key={fmt.id}
                            variant={flyerFormat === fmt.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFlyerFormat(fmt.id);
                              if (selectedTemplate)
                                generateFlyer(selectedTemplate, fmt.id);
                            }}
                          >
                            {fmt.label} ({fmt.size})
                          </Button>
                        ))}
                      </div>
                    </>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Escolha um template
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Template list */}
        <div className="space-y-3">
          {TEMPLATES.map((template) => {
            const showCount = getFilteredShows(template.agendaType).length;
            return (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                disabled={generating}
                className={cn(
                  "w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all text-left hover:shadow-md group",
                  selectedTemplate === template.id && generatedImage
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 bg-card",
                  generating && "opacity-60 cursor-not-allowed"
                )}
              >
                {/* Thumbnail preview */}
                <div
                  className={cn(
                    "w-20 h-24 rounded-lg overflow-hidden shrink-0 flex flex-col items-center justify-center gap-1 p-2 bg-gradient-to-br",
                    template.previewGradient
                  )}
                >
                  <div className="w-7 h-7 rounded-full border-2 border-white/40" />
                  <div className="w-10 h-1 rounded bg-white/40" />
                  <div className="w-8 h-0.5 rounded bg-white/25" />
                  <div className="flex gap-1 mt-0.5">
                    <div className="w-3 h-3 rounded-sm bg-white/30" />
                    <div className="w-3 h-3 rounded-sm bg-white/20" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground text-lg">
                      {template.label}
                    </h3>
                    <span
                      className={cn(
                        "text-xs text-white font-semibold px-2.5 py-0.5 rounded-full",
                        template.badgeColor
                      )}
                    >
                      {template.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.desc}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {showCount > 0
                      ? `${showCount} show${showCount > 1 ? "s" : ""} encontrado${showCount > 1 ? "s" : ""}`
                      : "Nenhum show no período"}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
