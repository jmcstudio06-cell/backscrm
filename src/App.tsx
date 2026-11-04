import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireFeature } from "@/components/auth/RequireFeature";
import { ShowsProvider } from "@/contexts/shows/ShowsProvider";
import { AppSettingsProvider } from "@/hooks/useAppSettings";
import { CustomizationProvider } from "@/hooks/useCustomization";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { RequireOwner } from "@/components/auth/RequireOwner";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";

import LandingV3 from "./pages/LandingV3";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Ranking from "./pages/Ranking";
import BacksRadar from "./pages/BacksRadar";
import Tutoriais from "./pages/Tutoriais";
import CRM from "./pages/CRM";
import Clientes from "./pages/Clientes";
import Financeiro from "./pages/Financeiro";
import Historico from "./pages/Historico";
import Checklist from "./pages/Checklist";
import Equipe from "./pages/Equipe";
import Metas from "./pages/Metas";
import MetasAnuais from "./pages/MetasAnuais";
import Planos from "./pages/Planos";
import Configuracoes from "./pages/Configuracoes";
import Orcamentos from "./pages/Orcamentos";
import Contratos from "./pages/Contratos";
import Repertorio from "./pages/Repertorio";
import MapeamentoPalco from "./pages/MapeamentoPalco";
import Precificacao from "./pages/Precificacao";
import Cobrancas from "./pages/Cobrancas";
import Indicacoes from "./pages/Indicacoes";
import Admin from "./pages/Admin";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import ResetPassword from "./pages/ResetPassword";
import AuthConfirm from "./pages/AuthConfirm";
import GuiaAtendimento from "./pages/GuiaAtendimento";
import KitProfissional from "./pages/KitProfissional";
import BacksRadarLanding from "./pages/BacksRadarLanding";
import PlanilhaGratuita from "./pages/PlanilhaGratuita";
import PlanilhaCantoressVenda from "./pages/PlanilhaCantoressVenda";
import MensagensProntas from "./pages/MensagensProntas";
import ArtesCanva from "./pages/ArtesCanva";
import Booking from "./pages/Booking";
import LinkInstagram from "./pages/LinkInstagram";
import LinkInstagramConfig from "./pages/LinkInstagramConfig";
import LinkOrcamento from "./pages/LinkOrcamento";
import LinkOrcamentoConfig from "./pages/LinkOrcamentoConfig";
import Solicitacoes from "./pages/Solicitacoes";
import ServicosProdutos from "./pages/ServicosProdutos";
import PlanejamentoConteudo from "./pages/PlanejamentoConteudo";
import Selos from "./pages/Selos";
import Notificacoes from "./pages/Notificacoes";
import Sugestoes from "./pages/Sugestoes";
import Usuarios from "./pages/Usuarios";
// import Consultoria from "./pages/Consultoria"; // temporariamente desativado
import AssinarContrato from "./pages/AssinarContrato";
import NotFound from "./pages/NotFound";
import { NotificationPrompt } from "@/components/notifications/NotificationPrompt";
import { PushSubscriptionRefresher } from "@/components/notifications/PushSubscriptionRefresher";
import { LastSeenTracker } from "@/components/auth/LastSeenTracker";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { MetaPixelTracker } from "@/components/analytics/MetaPixelTracker";

import { PlanActivatedCelebration } from "@/components/celebrations/PlanActivatedCelebration";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { MaintenanceGate } from "@/components/layout/MaintenanceGate";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — data stays fresh, no refetch
      gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

// OneSignal handles service worker registration automatically

/** Wraps a page with ShowsProvider + RequireAuth + ErrorBoundary.
 *  ShowsProvider is now scoped here instead of wrapping the whole app,
 *  so unauthenticated/landing pages don't trigger shows queries. */
function AuthPage({ children, featureKey }: { children: ReactNode; featureKey?: string }) {
  const content = featureKey ? (
    <RequireFeature featureKey={featureKey}>{children}</RequireFeature>
  ) : (
    children
  );
  return (
    <RequireAuth>
      <ShowsProvider>
        <ErrorBoundary>{content}</ErrorBoundary>
      </ShowsProvider>
    </RequireAuth>
  );
}

/** Ativa o botão voltar do Android apenas quando dentro do Capacitor */
function AndroidBackButtonHandler() {
  useAndroidBackButton();
  return null;
}

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SplashScreen />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
          <AppSettingsProvider>
            <CustomizationProvider>
              <MetaPixelTracker />
              <NotificationPrompt />
              <PushSubscriptionRefresher />
              <LastSeenTracker />
              <OnboardingGate />
              <AndroidBackButtonHandler />

              <PlanActivatedCelebration />
              <MaintenanceGate>
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/landing" element={<LandingV3 />} />
                <Route path="/radar" element={<ErrorBoundary><BacksRadarLanding /></ErrorBoundary>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<AuthPage featureKey="dashboard"><Dashboard /></AuthPage>} />
                <Route path="/agenda" element={<AuthPage featureKey="agenda"><Agenda /></AuthPage>} />
                <Route path="/ranking" element={<AuthPage><Ranking /></AuthPage>} />
                <Route path="/backs-radar" element={<AuthPage><BacksRadar /></AuthPage>} />
                <Route path="/tutoriais" element={<AuthPage featureKey="tutoriais"><Tutoriais /></AuthPage>} />
                <Route path="/crm" element={<AuthPage featureKey="crm"><CRM /></AuthPage>} />
                <Route path="/clientes" element={<AuthPage featureKey="clientes"><Clientes /></AuthPage>} />
                <Route path="/financeiro" element={<AuthPage featureKey="financeiro"><Financeiro /></AuthPage>} />
                <Route path="/historico" element={<AuthPage featureKey="historico"><Historico /></AuthPage>} />
                <Route path="/checklist" element={<AuthPage featureKey="checklist"><Checklist /></AuthPage>} />
                <Route path="/mapeamento-palco" element={<AuthPage featureKey="mapeamento-palco"><MapeamentoPalco /></AuthPage>} />
                <Route path="/precificacao" element={<AuthPage featureKey="precificacao"><Precificacao /></AuthPage>} />
                <Route path="/cobrancas" element={<AuthPage featureKey="cobrancas"><Cobrancas /></AuthPage>} />
                <Route path="/indicacoes" element={<AuthPage><RequireOwner><Indicacoes /></RequireOwner></AuthPage>} />
                <Route path="/equipe" element={<AuthPage featureKey="equipe"><Equipe /></AuthPage>} />
                <Route path="/metas" element={<AuthPage featureKey="metas"><Metas /></AuthPage>} />
                <Route path="/metas/anual" element={<AuthPage featureKey="metas-anuais"><MetasAnuais /></AuthPage>} />
                <Route path="/planos" element={<AuthPage><RequireOwner><Planos /></RequireOwner></AuthPage>} />
                <Route path="/configuracoes" element={<AuthPage featureKey="configuracoes"><Configuracoes /></AuthPage>} />
                <Route path="/configuracoes/perfil-artistico" element={<AuthPage featureKey="configuracoes"><Configuracoes /></AuthPage>} />
                <Route path="/configuracoes/personalizacao" element={<AuthPage featureKey="configuracoes"><Configuracoes /></AuthPage>} />
                <Route path="/configuracoes/seguranca" element={<AuthPage featureKey="configuracoes"><Configuracoes /></AuthPage>} />
                <Route path="/orcamentos" element={<AuthPage featureKey="orcamentos"><Orcamentos /></AuthPage>} />
                <Route path="/servicos" element={<AuthPage featureKey="servicos"><ServicosProdutos /></AuthPage>} />
                <Route path="/planejamento-conteudo" element={<AuthPage featureKey="ideias-post"><PlanejamentoConteudo /></AuthPage>} />
                
                <Route path="/contratos" element={<AuthPage featureKey="contratos"><Contratos /></AuthPage>} />
                <Route path="/repertorio" element={<AuthPage featureKey="repertorio"><Repertorio /></AuthPage>} />
                <Route path="/admin" element={<AuthPage><RequireOwner><Admin /></RequireOwner></AuthPage>} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/confirm" element={<AuthConfirm />} />
                <Route path="/guia-atendimento" element={<ErrorBoundary><GuiaAtendimento /></ErrorBoundary>} />
                <Route path="/kit-profissional" element={<ErrorBoundary><KitProfissional /></ErrorBoundary>} />
                <Route path="/planilha-gratuita" element={<ErrorBoundary><PlanilhaGratuita /></ErrorBoundary>} />
                <Route path="/planilha-cantores" element={<ErrorBoundary><PlanilhaCantoressVenda /></ErrorBoundary>} />
                <Route path="/kit-profissional/mensagens" element={<ErrorBoundary><MensagensProntas /></ErrorBoundary>} />
                <Route path="/kit-profissional/artes" element={<ErrorBoundary><ArtesCanva /></ErrorBoundary>} />
                <Route path="/solicitacoes" element={<AuthPage><Solicitacoes /></AuthPage>} />
                <Route path="/notificacoes" element={<AuthPage><Notificacoes /></AuthPage>} />
                <Route path="/sugestoes" element={<AuthPage><Sugestoes /></AuthPage>} />
                <Route path="/usuarios" element={<AuthPage featureKey="usuarios"><RequireOwner><Usuarios /></RequireOwner></AuthPage>} />
                {/* <Route path="/consultoria" element={<AuthPage><Consultoria /></AuthPage>} /> */}
                <Route path="/link-instagram" element={<AuthPage featureKey="link-instagram"><LinkInstagramConfig /></AuthPage>} />
                <Route path="/link-orcamento" element={<AuthPage featureKey="link-orcamento"><LinkOrcamentoConfig /></AuthPage>} />
                
                <Route path="/artista/:slug" element={<ErrorBoundary><Booking /></ErrorBoundary>} />
                <Route path="/link/:slug" element={<ErrorBoundary><LinkInstagram /></ErrorBoundary>} />
                <Route path="/orcamento/:slug" element={<ErrorBoundary><LinkOrcamento /></ErrorBoundary>} />
                <Route path="/assinar/:token" element={<ErrorBoundary><AssinarContrato /></ErrorBoundary>} />
                <Route path="/assinar/:slug/:token" element={<ErrorBoundary><AssinarContrato /></ErrorBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </MaintenanceGate>
            </CustomizationProvider>
          </AppSettingsProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
