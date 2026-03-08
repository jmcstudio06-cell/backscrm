import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ShowsProvider } from "@/contexts/shows/ShowsProvider";
import { AppSettingsProvider } from "@/hooks/useAppSettings";
import { CustomizationProvider } from "@/hooks/useCustomization";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Bonus from "./pages/Bonus";
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
import Booking from "./pages/Booking";
import Solicitacoes from "./pages/Solicitacoes";
import ServicosProdutos from "./pages/ServicosProdutos";
import PlanejamentoConteudo from "./pages/PlanejamentoConteudo";
import NotFound from "./pages/NotFound";
import { PlanActivatedCelebration } from "@/components/celebrations/PlanActivatedCelebration";

const queryClient = new QueryClient();

// OneSignal handles service worker registration automatically

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppSettingsProvider>
            <CustomizationProvider>
            <ShowsProvider>
              <PlanActivatedCelebration />
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<RequireAuth><ErrorBoundary><Dashboard /></ErrorBoundary></RequireAuth>} />
                <Route path="/agenda" element={<RequireAuth><ErrorBoundary><Agenda /></ErrorBoundary></RequireAuth>} />
                <Route path="/bonus" element={<RequireAuth><ErrorBoundary><Bonus /></ErrorBoundary></RequireAuth>} />
                <Route path="/tutoriais" element={<RequireAuth><ErrorBoundary><Tutoriais /></ErrorBoundary></RequireAuth>} />
                <Route path="/crm" element={<RequireAuth><ErrorBoundary><CRM /></ErrorBoundary></RequireAuth>} />
                <Route path="/clientes" element={<RequireAuth><ErrorBoundary><Clientes /></ErrorBoundary></RequireAuth>} />
                <Route path="/financeiro" element={<RequireAuth><ErrorBoundary><Financeiro /></ErrorBoundary></RequireAuth>} />
                <Route path="/historico" element={<RequireAuth><ErrorBoundary><Historico /></ErrorBoundary></RequireAuth>} />
                <Route path="/checklist" element={<RequireAuth><ErrorBoundary><Checklist /></ErrorBoundary></RequireAuth>} />
                <Route path="/mapeamento-palco" element={<RequireAuth><ErrorBoundary><MapeamentoPalco /></ErrorBoundary></RequireAuth>} />
                <Route path="/precificacao" element={<RequireAuth><ErrorBoundary><Precificacao /></ErrorBoundary></RequireAuth>} />
                <Route path="/avancos" element={<RequireAuth><ErrorBoundary><Avancos /></ErrorBoundary></RequireAuth>} />
                <Route path="/indicacoes" element={<RequireAuth><ErrorBoundary><Indicacoes /></ErrorBoundary></RequireAuth>} />
                <Route path="/equipe" element={<RequireAuth><ErrorBoundary><Equipe /></ErrorBoundary></RequireAuth>} />
                <Route path="/metas" element={<RequireAuth><ErrorBoundary><Metas /></ErrorBoundary></RequireAuth>} />
                <Route path="/metas/anual" element={<RequireAuth><ErrorBoundary><MetasAnuais /></ErrorBoundary></RequireAuth>} />
                <Route path="/planos" element={<RequireAuth><ErrorBoundary><Planos /></ErrorBoundary></RequireAuth>} />
                <Route path="/configuracoes" element={<RequireAuth><ErrorBoundary><Configuracoes /></ErrorBoundary></RequireAuth>} />
                <Route path="/orcamentos" element={<RequireAuth><ErrorBoundary><Orcamentos /></ErrorBoundary></RequireAuth>} />
                <Route path="/servicos" element={<RequireAuth><ErrorBoundary><ServicosProdutos /></ErrorBoundary></RequireAuth>} />
                <Route path="/planejamento-conteudo" element={<RequireAuth><ErrorBoundary><PlanejamentoConteudo /></ErrorBoundary></RequireAuth>} />
                <Route path="/contratos" element={<RequireAuth><ErrorBoundary><Contratos /></ErrorBoundary></RequireAuth>} />
                <Route path="/repertorio" element={<RequireAuth><ErrorBoundary><Repertorio /></ErrorBoundary></RequireAuth>} />
                <Route path="/admin" element={<RequireAuth><ErrorBoundary><Admin /></ErrorBoundary></RequireAuth>} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/guia-atendimento" element={<RequireAuth><ErrorBoundary><GuiaAtendimento /></ErrorBoundary></RequireAuth>} />
                <Route path="/solicitacoes" element={<RequireAuth><ErrorBoundary><Solicitacoes /></ErrorBoundary></RequireAuth>} />
                <Route path="/notificacoes" element={<RequireAuth><ErrorBoundary><Notificacoes /></ErrorBoundary></RequireAuth>} />
                <Route path="/booking/:slug" element={<ErrorBoundary><Booking /></ErrorBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ShowsProvider>
            </CustomizationProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
