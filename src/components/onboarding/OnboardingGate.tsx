import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGoals } from "@/hooks/useGoals";
import { WelcomeVideoModal } from "@/components/onboarding/WelcomeVideoModal";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

/** Rotas públicas / de terceiros onde o onboarding nunca deve aparecer. */
const PUBLIC_PREFIXES = [
  "/auth",
  "/landing",
  "/reset-password",
  "/termos",
  "/privacidade",
  "/link/",
  "/artista/",
  "/orcamento/",
  "/assinar/",
  "/kit-profissional",
  "/planilha-gratuita",
  "/guia-atendimento",
];

/**
 * Onboarding obrigatório de primeiro acesso: vídeo de boas-vindas (não pode ser
 * pulado) seguido do fluxo de 4 etapas. Fica no App para valer em qualquer tela
 * em que o usuário novo entrar, não só no Dashboard.
 */
export function OnboardingGate() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { profile, loading } = useProfile();
  const { addGoal } = useGoals();
  const queryClient = useQueryClient();

  const [showVideo, setShowVideo] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  // Flag local para não reabrir o modal enquanto o banco ainda não confirmou
  const [finished, setFinished] = useState(false);

  const isPublicRoute =
    pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));

  useEffect(() => {
    if (!user || loading || !profile || isPublicRoute) return;
    if (profile.onboarding_completed || finished) return;
    if (showVideo || showFlow) return;

    const videoSeen = localStorage.getItem(`welcome_video_seen_${profile.user_id}`);
    if (videoSeen) setShowFlow(true);
    else setShowVideo(true);
  }, [user, loading, profile, isPublicRoute, showVideo, showFlow]);

  if (!user || isPublicRoute) return null;

  const now = new Date();

  return (
    <>
      <WelcomeVideoModal
        open={showVideo}
        userName={profile?.name || undefined}
        onFinished={() => {
          if (profile?.user_id) {
            localStorage.setItem(`welcome_video_seen_${profile.user_id}`, "1");
          }
          setShowVideo(false);
          setShowFlow(true);
        }}
      />

      <OnboardingFlow
        open={showFlow}
        userName={profile?.name || undefined}
        monthName={format(now, "MMMM", { locale: ptBR })}
        onFinish={async (goalTarget) => {
          // Marca localmente para não reabrir enquanto o banco confirma
          setFinished(true);
          setShowFlow(false);
          queryClient.invalidateQueries({ queryKey: ["profile"] });

          // Salva meta em background
          if (goalTarget) {
            try {
              await addGoal({
                title: `Meta de Shows - ${format(now, "MMMM yyyy", { locale: ptBR })}`,
                type: "shows",
                target_value: goalTarget,
                current_value: 0,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
              });
              queryClient.invalidateQueries({ queryKey: ["goals"] });
            } catch (e) {
              console.error("Erro ao salvar meta do onboarding:", e);
            }
          }
        }}
      />
    </>
  );
}
