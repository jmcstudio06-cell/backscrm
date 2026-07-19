import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicProfileSection } from "@/components/configuracoes/PublicProfileSection";
import { Copy, Check, ExternalLink, CalendarDays, Instagram, Lock, Crown, FileText } from "lucide-react";
import { toast } from "sonner";

export function LinksConfigSection() {
  const { profile } = useProfile();
  const { isBlocked } = useFeatureBlocks();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const agendaBlocked = isBlocked("link-agenda");
  const instagramBlocked = isBlocked("link-instagram");
  const orcamentoBlocked = isBlocked("link-orcamento");

  const PUBLIC_DOMAIN = "https://backstagepro.online";
  const agendaUrl = profile?.slug
    ? `${PUBLIC_DOMAIN}/artista/${profile.slug}`
    : null;
  const instagramUrl = profile?.slug
    ? `${PUBLIC_DOMAIN}/link/${profile.slug}`
    : null;
  const orcamentoUrl = profile?.slug
    ? `${PUBLIC_DOMAIN}/orcamento/${profile.slug}`
    : null;

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopied(key);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ========== HEADER ========== */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
          <h3 className="text-lg font-bold text-foreground">Seus Links Públicos</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Compartilhe com contratantes e fãs para receber shows e divulgar seu trabalho
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* LINK AGENDA */}
          <LinkCard
            icon={CalendarDays}
            title="Link Agenda"
            description="Página de agendamento — contratantes escolhem datas e produtos"
            url={agendaUrl}
            blocked={agendaBlocked}
            planName="Empresarial"
            onCopy={(u) => handleCopy(u, "agenda")}
            copied={copied === "agenda"}
            onUpgrade={() => navigate("/planos")}
            gradient="from-blue-500 to-cyan-500"
          />

          {/* LINK INSTAGRAM */}
          <LinkCard
            icon={Instagram}
            title="Link da bio"
            description="Press kit profissional com vídeo, Spotify, redes sociais e botão de agenda — perfeito para bio do Instagram"
            url={instagramUrl}
            blocked={instagramBlocked}
            planName="Profissional"
            onCopy={(u) => handleCopy(u, "instagram")}
            copied={copied === "instagram"}
            onUpgrade={() => navigate("/planos")}
            gradient="from-pink-500 via-rose-500 to-orange-400"
          />

          {/* LINK ORÇAMENTO */}
          <LinkCard
            icon={FileText}
            title="Link Orçamento"
            description="Página de apresentação com pacotes, depoimentos e botão de WhatsApp para fechar mais shows"
            url={orcamentoUrl}
            blocked={orcamentoBlocked}
            planName="Profissional"
            onCopy={(u) => handleCopy(u, "orcamento")}
            copied={copied === "orcamento"}
            onUpgrade={() => navigate("/planos")}
            gradient="from-amber-400 via-amber-500 to-orange-500"
          />

          {!profile?.slug && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Configure seu nome artístico no <span className="font-semibold">Perfil Artístico</span> para gerar seus links automaticamente.
            </p>
          )}
        </div>
      </div>

      {/* ========== CAMPOS PÚBLICOS (bio, redes, mídia kit, vídeo) ========== */}
      <PublicProfileSection />
    </div>
  );
}

interface LinkCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  url: string | null;
  blocked: boolean;
  planName: string;
  onCopy: (url: string) => void;
  copied: boolean;
  onUpgrade: () => void;
  gradient: string;
}

function LinkCard({ icon: Icon, title, description, url, blocked, planName, onCopy, copied, onUpgrade, gradient }: LinkCardProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-secondary/20 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-foreground">{title}</h4>
              {blocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-warning/15 text-warning">
                  <Crown className="w-3 h-3" />
                  {planName}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>

        {blocked ? (
          <div className="mt-4 rounded-lg bg-card border border-dashed border-border p-4 flex flex-col sm:flex-row items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
              Recurso disponível no plano <span className="font-semibold text-foreground">{planName}</span> ou superior
            </p>
            <Button size="sm" variant="gradient" onClick={onUpgrade} className="shrink-0">
              <Crown className="w-4 h-4 mr-1.5" />
              Garantir acesso
            </Button>
          </div>
        ) : url ? (
          <div className="mt-4 flex items-center gap-2 p-3 bg-card rounded-lg border border-border/50">
            <code className="flex-1 text-xs sm:text-sm text-foreground truncate">{url}</code>
            <Button size="sm" variant="outline" onClick={() => onCopy(url)} className="h-9 w-9 p-0 shrink-0">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" asChild className="h-9 w-9 p-0 shrink-0">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground italic text-center py-3 bg-card rounded-lg border border-border/50">
            Configure seu nome artístico para gerar este link
          </p>
        )}
      </div>
    </div>
  );
}
