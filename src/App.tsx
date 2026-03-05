import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { AuthProvider } from "@/hooks/useAuth";
import { ShowsProvider } from "@/contexts/shows/ShowsProvider";
import { AppSettingsProvider } from "@/hooks/useAppSettings";

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
import NotFound from "./pages/NotFound";
import { NotificationPrompt } from "@/components/notifications/NotificationPrompt";
import { PushSubscriptionRefresher } from "@/components/notifications/PushSubscriptionRefresher";

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
            <ShowsProvider>
              <NotificationPrompt />
              <PushSubscriptionRefresher />
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                <Route path="/agenda" element={<ErrorBoundary><Agenda /></ErrorBoundary>} />
                <Route path="/bonus" element={<ErrorBoundary><Bonus /></ErrorBoundary>} />
                <Route path="/tutoriais" element={<ErrorBoundary><Tutoriais /></ErrorBoundary>} />
                <Route path="/crm" element={<ErrorBoundary><CRM /></ErrorBoundary>} />
                <Route path="/clientes" element={<ErrorBoundary><Clientes /></ErrorBoundary>} />
                <Route path="/financeiro" element={<ErrorBoundary><Financeiro /></ErrorBoundary>} />
                <Route path="/historico" element={<ErrorBoundary><Historico /></ErrorBoundary>} />
                <Route path="/checklist" element={<ErrorBoundary><Checklist /></ErrorBoundary>} />
                <Route path="/mapeamento-palco" element={<ErrorBoundary><MapeamentoPalco /></ErrorBoundary>} />
                <Route path="/precificacao" element={<ErrorBoundary><Precificacao /></ErrorBoundary>} />
                <Route path="/avancos" element={<ErrorBoundary><Avancos /></ErrorBoundary>} />
                <Route path="/indicacoes" element={<ErrorBoundary><Indicacoes /></ErrorBoundary>} />
                <Route path="/equipe" element={<ErrorBoundary><Equipe /></ErrorBoundary>} />
                <Route path="/metas" element={<ErrorBoundary><Metas /></ErrorBoundary>} />
                <Route path="/metas/anual" element={<ErrorBoundary><MetasAnuais /></ErrorBoundary>} />
                <Route path="/planos" element={<ErrorBoundary><Planos /></ErrorBoundary>} />
                <Route path="/configuracoes" element={<ErrorBoundary><Configuracoes /></ErrorBoundary>} />
                <Route path="/orcamentos" element={<ErrorBoundary><Orcamentos /></ErrorBoundary>} />
                <Route path="/contratos" element={<ErrorBoundary><Contratos /></ErrorBoundary>} />
                <Route path="/repertorio" element={<ErrorBoundary><Repertorio /></ErrorBoundary>} />
                <Route path="/admin" element={<ErrorBoundary><Admin /></ErrorBoundary>} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/guia-atendimento" element={<ErrorBoundary><GuiaAtendimento /></ErrorBoundary>} />
                <Route path="/solicitacoes" element={<ErrorBoundary><Solicitacoes /></ErrorBoundary>} />
                <Route path="/booking/:slug" element={<ErrorBoundary><Booking /></ErrorBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ShowsProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
