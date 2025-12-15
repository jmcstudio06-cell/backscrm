import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Hooks / Providers
import { AuthProvider } from "@/hooks/useAuth";
import { ShowsProvider } from "@/contexts/ShowsContext";
import { AppSettingsProvider } from "@/hooks/useAppSettings";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Aulas from "./pages/Aulas";
import CRM from "./pages/CRM";
import Clientes from "./pages/Clientes";
import Financeiro from "./pages/Financeiro";
import Historico from "./pages/Historico";
import Checklist from "./pages/Checklist";
import Equipe from "./pages/Equipe";
import Metas from "./pages/Metas";
import Planos from "./pages/Planos";
import Configuracoes from "./pages/Configuracoes";
import Orcamentos from "./pages/Orcamentos";
import Contratos from "./pages/Contratos";
import Repertorio from "./pages/Repertorio";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* **Ordem dos Providers IMPORTA!** */}
        <AuthProvider>
          <AppSettingsProvider>
            <ShowsProvider>
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/aulas" element={<Aulas />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/historico" element={<Historico />} />
                <Route path="/checklist" element={<Checklist />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/metas" element={<Metas />} />
                <Route path="/planos" element={<Planos />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/orcamentos" element={<Orcamentos />} />
                <Route path="/contratos" element={<Contratos />} />
                <Route path="/repertorio" element={<Repertorio />} />
                <Route path="/admin" element={<Admin />} />
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
