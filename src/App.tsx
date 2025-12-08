import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Agenda from "./pages/Agenda";
import Aulas from "./pages/Aulas";
import CRM from "./pages/CRM";
import Clientes from "./pages/Clientes";
import Tarefas from "./pages/Tarefas";
import Contratos from "./pages/Contratos";
import Financeiro from "./pages/Financeiro";
import Historico from "./pages/Historico";
import Musicos from "./pages/Musicos";
import Orcamentos from "./pages/Orcamentos";
import Repertorio from "./pages/Repertorio";
import Metas from "./pages/Metas";
import Planos from "./pages/Planos";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/aulas" element={<Aulas />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/contratos" element={<Contratos />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/musicos" element={<Musicos />} />
          <Route path="/orcamentos" element={<Orcamentos />} />
          <Route path="/repertorio" element={<Repertorio />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
