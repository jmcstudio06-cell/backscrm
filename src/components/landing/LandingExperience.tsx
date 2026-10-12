import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, CircleCheck, FileText, LayoutDashboard, MapPin, Music2, Plus, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import appShowcase from "@/assets/landing-app-showcase.png";
import bookingPreview from "@/assets/mockups/link-agenda-mockup-v2.png";
import brandIcon from "@/assets/ba-icon.png";

const modules = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard, title: "A carreira inteira, na mesma tela.", description: "Shows, resultados e próximos passos. Acesse no computador ou leve no celular." },
  { id: "agenda", label: "Agenda", icon: CalendarDays, title: "Cada data. Cada combinado.", description: "Organize shows, acompanhe o status e mantenha os detalhes de cada apresentação juntos." },
  { id: "finance", label: "Financeiro", icon: Wallet, title: "Clareza sobre o seu cachê.", description: "Acompanhe recebimentos, despesas e pagamentos da equipe, conectados à sua agenda." },
  { id: "crm", label: "Contatos", icon: Users, title: "Uma boa conversa pode virar show.", description: "Organize contratantes e acompanhe as oportunidades, do primeiro contato ao fechamento." },
  { id: "links", label: "Link Agenda", icon: Music2, title: "Seu próximo show pode começar num link.", description: "Apresente seus serviços, disponibilize datas e receba pedidos de contratação." },
];

export function LandingExperience() {
  const [active, setActive] = useState("overview");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = month.getDay();
  const moveMonth = (direction: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + direction, 1));
    setSelectedDay(null);
  };

  return (
    <Tabs value={active} onValueChange={setActive} className="landing-experience">
      <TabsList className="landing-module-tabs" aria-label="Áreas do Backstage Pro">
        {modules.map(({ id, label, icon: Icon }) => (
          <TabsTrigger key={id} value={id} className="landing-module-tab"><Icon className="h-4 w-4" />{label}</TabsTrigger>
        ))}
      </TabsList>
      <div className="landing-app-window">
        <aside className="landing-app-sidebar">
          <div className="flex items-center gap-2.5"><img src={brandIcon} alt="" width={32} height={32} className="rounded-lg" /><span className="font-semibold text-sidebar-primary">Backstage Pro</span></div>
          <p className="mt-8 mb-3 text-[10px] font-semibold uppercase">Sua carreira</p>
          {modules.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => setActive(id)} className={`landing-sidebar-item ${active === id ? "is-active" : ""}`}><Icon className="h-4 w-4" />{label}</Button>)}
          <div className="mt-auto border-t border-sidebar-border pt-5 text-xs leading-relaxed">Seu talento no palco.<br />Seu controle aqui.</div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="landing-window-bar"><span className="inline-flex items-center gap-2"><CircleCheck className="h-3.5 w-3.5 text-primary" />Backstage Pro</span><span>Prévia do app</span></div>
          {modules.map((module) => (
            <TabsContent key={module.id} value={module.id} className="landing-app-content">
              <div className="landing-preview-heading"><div><h3>{module.title}</h3><p>{module.description}</p></div><Button asChild size="sm" className="shrink-0"><Link to="/auth">Testar grátis<ArrowRight /></Link></Button></div>
              {module.id === "overview" && <div className="landing-overview-image"><img src={appShowcase} alt="Backstage Pro aberto em notebook, tablet e celular" width={1024} height={1024} loading="lazy" /></div>}
              {module.id === "agenda" && <div className="landing-calendar-preview">
                <div className="flex items-center justify-between gap-2 pb-4"><h4 className="font-semibold capitalize">{month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h4><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => moveMonth(-1)}><ChevronLeft /></Button><Button variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => moveMonth(1)}><ChevronRight /></Button></div></div>
                <div className="landing-calendar-grid">{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => <span key={day} className="landing-weekday">{day}</span>)}{Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />)}{Array.from({ length: days }, (_, index) => <Button key={index} variant="ghost" aria-label={`Selecionar dia ${index + 1}`} aria-pressed={selectedDay === index + 1} onClick={() => setSelectedDay(index + 1)} className={`landing-calendar-day ${selectedDay === index + 1 ? "is-selected" : ""}`}>{index + 1}</Button>)}</div>
                <div className="landing-calendar-bottom"><span>{selectedDay ? `Dia ${selectedDay} · Nenhum show cadastrado` : "Sua agenda começa com o primeiro show."}</span><Button asChild size="sm" variant="outline"><Link to="/auth"><Plus />Novo show</Link></Button></div>
              </div>}
              {module.id === "finance" && <div className="landing-finance-preview"><div className="grid grid-cols-3 gap-2 border-b border-border pb-6">{["Recebido", "A receber", "Despesas"].map((label, index) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-2 text-xl sm:text-2xl font-bold ${index === 0 ? "text-primary" : "text-foreground"}`}>R$0,00</p></div>)}</div><div className="landing-empty-chart"><Wallet className="h-8 w-8 text-primary" /><h4>O seu trabalho merece clareza.</h4><p>Seus resultados aparecem aqui conforme você cadastra seus shows e pagamentos.</p></div><div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-2"><CircleCheck className="h-4 w-4 text-primary" />Cachês e despesas</span><span className="flex items-center gap-2"><CircleCheck className="h-4 w-4 text-primary" />Histórico financeiro</span><span className="flex items-center gap-2"><CircleCheck className="h-4 w-4 text-primary" />Pagamentos da equipe</span></div></div>}
              {module.id === "crm" && <div className="landing-crm-preview">{["Primeiro contato", "Em negociação", "Show fechado"].map(label => <div key={label} className="landing-crm-column"><div className="flex items-center justify-between text-xs font-semibold"><span>{label}</span><span className="text-muted-foreground">0</span></div><div className="landing-crm-empty"><Users className="h-6 w-6" /><p>Nenhum contato</p></div><Button variant="ghost" asChild className="w-full justify-start text-xs"><Link to="/auth"><Plus />Adicionar contato</Link></Button></div>)}</div>}
              {module.id === "links" && <div className="landing-links-preview"><div className="space-y-5">{[{ icon: Music2, label: "Seus serviços, bem apresentados" }, { icon: CalendarDays, label: "Datas disponíveis para contratar" }, { icon: FileText, label: "Pedidos organizados no painel" }].map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-3 text-sm"><Icon className="h-5 w-5 text-primary" /><span>{label}</span></div>)}<p className="text-xs text-muted-foreground">Disponível a partir do Empresarial.</p></div><img src={bookingPreview} alt="Página de contratação pelo Link Agenda" width={754} height={1152} loading="lazy" /></div>}
            </TabsContent>
          ))}
        </div>
      </div>
      <div className="landing-module-footnote"><span><MapPin className="h-4 w-4" />Backs Radar no Executivo</span><span><FileText className="h-4 w-4" />Contratos e orçamentos</span><span><Users className="h-4 w-4" />Equipe e freelancers</span></div>
    </Tabs>
  );
}