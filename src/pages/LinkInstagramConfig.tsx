import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicProfileSection } from "@/components/configuracoes/PublicProfileSection";
import { LivePreviewFrame } from "@/components/configuracoes/LivePreviewFrame";
import { Copy, Check, ExternalLink, Instagram, Lock, Crown } from "lucide-react";
import { toast } from "sonner";

export default function LinkInstagramConfig() {
  const { profile } = useProfile();
  const { isBlocked } = useFeatureBlocks();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const blocked = isBlocked("link-instagram");
  const PUBLIC_DOMAIN = "https://backstagepro.online";
  const instagramUrl = profile?.slug ? `${PUBLIC_DOMAIN}/link/${profile.slug}` : null;

  const handleCopy = () => {
    if (!instagramUrl) return;
    navigator.clipboard.writeText(instagramUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout title="Link Mídia Kit" subtitle="Press kit profissional com vídeo, Spotify, redes e botão de agenda">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Prévia ao vivo no topo */}
        {!blocked && (
          <LivePreviewFrame
            url={instagramUrl}
            title="Sua página Mídia Kit"
            subtitle="Veja como seu press kit aparece para fãs e contratantes"
            refreshKey={(profile as any)?.updated_at}
          />
        )}


        {/* Card do Link */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 flex items-center justify-center text-white shadow-md shrink-0">
                <Instagram className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground">Link Mídia Kit</h3>
                  {blocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-warning/15 text-warning">
                      <Crown className="w-3 h-3" />
                      Profissional
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Perfeito para a bio do Instagram — gerado automaticamente a partir do seu nome artístico.
                </p>
              </div>
            </div>

            {blocked ? (
              <div className="mt-4 rounded-lg bg-secondary/30 border border-dashed border-border p-4 flex flex-col sm:flex-row items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
                  Recurso disponível no plano <span className="font-semibold text-foreground">Profissional</span> ou superior
                </p>
                <Button size="sm" variant="gradient" onClick={() => navigate("/planos")} className="shrink-0">
                  <Crown className="w-4 h-4 mr-1.5" />
                  Garantir acesso
                </Button>
              </div>
            ) : instagramUrl ? (
              <div className="mt-4 flex items-center gap-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                <code className="flex-1 text-xs sm:text-sm text-foreground truncate">{instagramUrl}</code>
                <Button size="sm" variant="outline" onClick={handleCopy} className="h-9 px-3 shrink-0">
                  {copied ? <Check className="w-4 h-4 text-success mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  Copiar
                </Button>
                <Button size="sm" variant="outline" asChild className="h-9 w-9 p-0 shrink-0">
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground italic text-center py-3 bg-secondary/30 rounded-lg border border-border/50">
                Configure seu nome artístico no Perfil Artístico para gerar este link
              </p>
            )}
          </div>
        </div>

        {/* Campos públicos: bio, redes, mídia kit, vídeo */}
        <PublicProfileSection />
      </div>
    </Layout>
  );
}
