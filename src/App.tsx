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

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Ranking from "./pages/Ranking";
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
import Avancos from "./pages/Avancos";
import Indicacoes from "./pages/Indicacoes";
import Admin from "./pages/Admin";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import ResetPassword from "./pages/ResetPassword";
import GuiaAtendimento from "./pages/GuiaAtendimento";
import KitProfissional from "./pages/KitProfissional";
import MensagensProntas from "./pages/MensagensProntas";
import ArtesCanva from "./pages/ArtesCanva";
import Booking from "./pages/Booking";
import LinkInstagram from "./pages/LinkInstagram";
import LinkInstagramConfig from "./pages/LinkInstagramConfig";
import Solicitacoes from "./pages/Solicitacoes";
import ServicosProdutos from "./pages/ServicosProdutos";
import PlanejamentoConteudo from "./pages/PlanejamentoConteudo";
import Selos from "./pages/Selos";
import Notificacoes from "./pages/Notificacoes";
import Sugestoes from "./pages/Sugestoes";
import NotFound from "./pages/NotFound";
import { NotificationPrompt } from "@/components/notifications/NotificationPrompt";
import { PushSubscriptionRefresher } from "@/components/notifications/PushSubscriptionRefresher";
import { PlanActivatedCelebration } from "@/components/celebrations/PlanActivatedCelebration";
import { SplashScreen } from "@/components/layout/SplashScreen";
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

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SplashScreen />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppSettingsProvider>
            <CustomizationProvider>
              <NotificationPrompt />
              <PushSubscriptionRefresher />
              <PlanActivatedCelebration />
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<AuthPage featureKey="dashboard"><Dashboard /></AuthPage>} />
                <Route path="/agenda" element={<AuthPage featureKey="agenda"><Agenda /></AuthPage>} />
                <Route path="/ranking" element={<AuthPage><Ranking /></AuthPage>} />
                <Route path="/tutoriais" element={<AuthPage featureKey="tutoriais"><Tutoriais /></AuthPage>} />
                <Route path="/crm" element={<AuthPage featureKey="crm"><CRM /></AuthPage>} />
                <Route path="/clientes" element={<AuthPage featureKey="clientes"><Clientes /></AuthPage>} />
                <Route path="/financeiro" element={<AuthPage featureKey="financeiro"><Financeiro /></AuthPage>} />
                <Route path="/historico" element={<AuthPage featureKey="historico"><Historico /></AuthPage>} />
                <Route path="/checklist" element={<AuthPage featureKey="checklist"><Checklist /></AuthPage>} />
                <Route path="/mapeamento-palco" element={<AuthPage featureKey="mapeamento-palco"><MapeamentoPalco /></AuthPage>} />
                <Route path="/precificacao" element={<AuthPage featureKey="precificacao"><Precificacao /></AuthPage>} />
                <Route path="/avancos" element={<AuthPage featureKey="avancos"><Avancos /></AuthPage>} />
                <Route path="/indicacoes" element={<AuthPage><Indicacoes /></AuthPage>} />
                <Route path="/equipe" element={<AuthPage featureKey="equipe"><Equipe /></AuthPage>} />
                <Route path="/metas" element={<AuthPage featureKey="metas"><Metas /></AuthPage>} />
                <Route path="/metas/anual" element={<AuthPage featureKey="metas-anuais"><MetasAnuais /></AuthPage>} />
                <Route path="/planos" element={<AuthPage><Planos /></AuthPage>} />
                <Route path="/configuracoes" element={<AuthPage featureKey="configuracoes"><Configuracoes /></AuthPage>} />
                <Route path="/orcamentos" element={<AuthPage featureKey="orcamentos"><Orcamentos /></AuthPage>} />
                <Route path="/servicos" element={<AuthPage featureKey="servicos"><ServicosProdutos /></AuthPage>} />
                <Route path="/planejamento-conteudo" element={<AuthPage featureKey="ideias-post"><PlanejamentoConteudo /></AuthPage>} />
                
                <Route path="/contratos" element={<AuthPage featureKey="contratos"><Contratos /></AuthPage>} />
                <Route path="/repertorio" element={<AuthPage featureKey="repertorio"><Repertorio /></AuthPage>} />
                <Route path="/admin" element={<AuthPage><Admin /></AuthPage>} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/guia-atendimento" element={<ErrorBoundary><GuiaAtendimento /></ErrorBoundary>} />
                <Route path="/kit-profissional" element={<ErrorBoundary><KitProfissional /></ErrorBoundary>} />
                <Route path="/kit-profissional/mensagens" element={<ErrorBoundary><MensagensProntas /></ErrorBoundary>} />
                <Route path="/kit-profissional/artes" element={<ErrorBoundary><ArtesCanva /></ErrorBoundary>} />
                <Route path="/solicitacoes" element={<AuthPage><Solicitacoes /></AuthPage>} />
                <Route path="/notificacoes" element={<AuthPage><Notificacoes /></AuthPage>} />
                <Route path="/sugestoes" element={<AuthPage><Sugestoes /></AuthPage>} />
                <Route path="/link-instagram" element={<AuthPage featureKey="link-instagram"><LinkInstagramConfig /></AuthPage>} />
                
                <Route path="/artista/:slug" element={<ErrorBoundary><Booking /></ErrorBoundary>} />
                <Route path="/link/:slug" element={<ErrorBoundary><LinkInstagram /></ErrorBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CustomizationProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
