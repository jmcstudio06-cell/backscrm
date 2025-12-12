import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
  Phone,
  MapPin,
  DollarSign,
  Eye,
  Trash2,
  MessageCircle,
  CalendarDays,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { id: "new", name: "Leads Novos", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", icon: Users },
  { id: "proposal", name: "Com Proposta", color: "bg-yellow-500", textColor: "text-yellow-600", bgLight: "bg-yellow-50", icon: Target },
  { id: "closed", name: "Fechados", color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50", icon: TrendingUp },
  { id: "lost", name: "Não Fechados", color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50", icon: AlertCircle },
  { id: "repeat", name: "Já Comprou", color: "bg-purple-500", textColor: "text-purple-600", bgLight: "bg-purple-50", icon: Users },
  { id: "never", name: "Nunca Comprou", color: "bg-gray-500", textColor: "text-gray-600", bgLight: "bg-gray-50", icon: Clock },
];

const leads = [
  {
    id: 1,
    name: "Wesley",
    phone: "121212",
    location: "Bar XXXX",
    value: 1000,
    stage: "new",
    daysInStage: 12,
    daysAgo: 24,
  },
  {
    id: 2,
    name: "Teste",
    phone: "12121212",
    location: "teste",
    value: 0,
    stage: "new",
    daysInStage: 12,
    daysAgo: 12,
  },
  {
    id: 3,
    name: "oi",
    phone: "45454524",
    location: "",
    value: 0,
    stage: "closed",
    daysInStage: 7,
    daysAgo: 8,
  },
  {
    id: 4,
    name: "teste 2",
    phone: "12",
    location: "",
    value: 500,
    stage: "never",
    daysInStage: 23,
    daysAgo: 31,
  },
  {
    id: 5,
    name: "Wesley",
    phone: "121212",
    location: "Bar XXXX",
    value: 0,
    stage: "new",
    daysInStage: 12,
    daysAgo: 0,
  },
];

const statCards = [
  { value: 0, label: "Leads Quentes", sublabel: "Últimos 3 dias", icon: TrendingUp, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
  { value: 4, label: "Leads Frios", sublabel: "+7 dias sem contato", icon: Clock, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { value: 0, label: "Alto Valor", sublabel: "R$ 5mil+", icon: Target, color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" },
  { value: 0, label: "Urgentes", sublabel: "Com proposta aberta", icon: AlertCircle, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
];

export default function CRM() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const getLeadsByStage = (stageId: string) => leads.filter(lead => lead.stage === stageId);
  
  const getStageValue = (stageId: string) => {
    return getLeadsByStage(stageId).reduce((sum, lead) => sum + lead.value, 0);
  };

  return (
    <Layout title="CRM - Funil de Vendas" subtitle="Gerencie seus contatos e oportunidades">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div></div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Ver Todos os Contatos
          </Button>
          <Button variant="outline">
            <CalendarDays className="w-4 h-4 mr-2" />
            Virada de Mês
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            className={cn(
              "p-4 rounded-xl border flex items-center gap-4",
              stat.bgColor,
              stat.borderColor
            )}
          >
            <div className={cn("p-2 rounded-full", stat.bgColor)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className={cn("text-sm font-medium", stat.color)}>{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30">
          <Trash2 className="w-4 h-4 mr-2" />
          Descartados (0)
        </Button>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar leads..." className="pl-9 bg-card" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Data Início (contato)</span>
          <Input type="date" className="w-40 bg-card" placeholder="dd/mm/aaaa" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Data Fim (contato)</span>
          <Input type="date" className="w-40 bg-card" placeholder="dd/mm/aaaa" />
        </div>
      </div>

      {/* Pipeline Stages Header */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stages.map((stage) => {
          const count = getLeadsByStage(stage.id).length;
          const value = getStageValue(stage.id);
          
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
              className={cn(
                "p-3 rounded-xl text-left transition-all",
                stage.color,
                "text-white"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <stage.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{stage.name}</span>
                </div>
                <span className="text-lg font-bold">{count}</span>
              </div>
              <p className="text-xs opacity-80">
                $ R$ {(value / 1000).toFixed(1)}k em propostas
              </p>
            </button>
          );
        })}
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {leads
          .filter(lead => !selectedStage || lead.stage === selectedStage)
          .map((lead) => {
            const stage = stages.find(s => s.id === lead.stage);
            
            return (
              <div 
                key={lead.id} 
                className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{lead.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {lead.daysAgo > 0 ? `Há ${lead.daysAgo} dias` : "Hoje"}
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mb-3",
                  stage?.bgLight,
                  stage?.textColor
                )}>
                  <Clock className="w-3 h-3" />
                  {lead.daysInStage} dias nesta etapa
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{lead.phone}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                  
                  {lead.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{lead.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      R$ {lead.value.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Perfil
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
      </div>
    </Layout>
  );
}
