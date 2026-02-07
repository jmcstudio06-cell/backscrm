import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

 // Register service worker for push notifications
 if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
     navigator.serviceWorker.register('/sw.js')
       .then((registration) => {
         console.log('ServiceWorker registered:', registration.scope);
       })
       .catch((error) => {
         console.log('ServiceWorker registration failed:', error);
       });
   });
 }

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppSettingsProvider>
            <ShowsProvider>
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/bonus" element={<Bonus />} />
                <Route path="/tutoriais" element={<Tutoriais />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/historico" element={<Historico />} />
                <Route path="/checklist" element={<Checklist />} />
                <Route path="/mapeamento-palco" element={<MapeamentoPalco />} />
                <Route path="/precificacao" element={<Precificacao />} />
                <Route path="/avancos" element={<Avancos />} />
                <Route path="/indicacoes" element={<Indicacoes />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/metas" element={<Metas />} />
                <Route path="/metas/anual" element={<MetasAnuais />} />
                <Route path="/planos" element={<Planos />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/orcamentos" element={<Orcamentos />} />
                <Route path="/contratos" element={<Contratos />} />
                <Route path="/repertorio" element={<Repertorio />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ShowsProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
