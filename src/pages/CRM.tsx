import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { id: "new", name: "Novo Lead", color: "bg-primary", count: 12 },
  { id: "contact", name: "Contato", color: "bg-accent", count: 8 },
  { id: "proposal", name: "Proposta", color: "bg-warning", count: 5 },
  { id: "negotiation", name: "Negociação", color: "bg-orange-500", count: 3 },
  { id: "closed", name: "Fechado", color: "bg-success", count: 7 },
];

const leads = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-1111",
    event: "Casamento",
    date: "2024-03-15",
    value: 8500,
    stage: "new",
    lastContact: "Há 2 horas",
    notes: "Interessada em banda completa",
  },
  {
    id: 2,
    name: "João Mendes",
    email: "joao@empresa.com",
    phone: "(11) 99999-2222",
    event: "Corporativo",
    date: "2024-02-20",
    value: 12000,
    stage: "contact",
    lastContact: "Há 1 dia",
    notes: "Aguardando retorno sobre data",
  },
  {
    id: 3,
    name: "Ana Costa",
    email: "ana@email.com",
    phone: "(11) 99999-3333",
    event: "Formatura",
    date: "2024-04-10",
    value: 15000,
    stage: "proposal",
    lastContact: "Há 3 dias",
    notes: "Proposta enviada, aguardando aprovação",
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    phone: "(11) 99999-4444",
    event: "Aniversário 50",
    date: "2024-02-28",
    value: 6800,
    stage: "negotiation",
    lastContact: "Há 5 horas",
    notes: "Negociando valor do cachê",
  },
  {
    id: 5,
    name: "Patricia Lima",
    email: "patricia@email.com",
    phone: "(11) 99999-5555",
    event: "Casamento",
    date: "2024-05-20",
    value: 9500,
    stage: "closed",
    lastContact: "Hoje",
    notes: "Contrato assinado!",
  },
];

export default function CRM() {
  const [selectedLead, setSelectedLead] = useState(leads[0]);

  return (
    <Layout title="CRM - Funil de Vendas" subtitle="Gerencie seus leads e oportunidades">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar leads..." className="pl-9 w-64 bg-secondary" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Pipeline */}
      <div className="mb-6 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="w-64 shrink-0"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                  <span className="font-medium text-foreground">{stage.name}</span>
                </div>
                <Badge variant="secondary">{stage.count}</Badge>
              </div>
              <div className="space-y-3">
                {leads
                  .filter((lead) => lead.stage === stage.id)
                  .map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl transition-all",
                        selectedLead.id === lead.id
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-secondary/50 hover:bg-secondary border border-transparent"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.event}</p>
                          </div>
                        </div>
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-success">
                          R$ {lead.value.toLocaleString("pt-BR")}
                        </span>
                        <span className="text-xs text-muted-foreground">{lead.lastContact}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Detalhes do Lead" className="lg:col-span-2">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-border">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">{selectedLead.name}</h3>
                <p className="text-muted-foreground">{selectedLead.event}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge
                    className={cn(
                      "capitalize",
                      stages.find((s) => s.id === selectedLead.stage)?.color.replace("bg-", "bg-") + "/10",
                      stages.find((s) => s.id === selectedLead.stage)?.color.replace("bg-", "text-")
                    )}
                  >
                    {stages.find((s) => s.id === selectedLead.stage)?.name}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success">
                  R$ {selectedLead.value.toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-muted-foreground">Valor estimado</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{selectedLead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Phone className="w-5 h-5 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm text-foreground">{selectedLead.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Calendar className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-xs text-muted-foreground">Data do Evento</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedLead.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="p-4 rounded-lg bg-secondary/50">
              <h4 className="text-sm font-medium text-foreground mb-2">Anotações</h4>
              <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="gradient" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Ligar
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </ChartCard>

        {/* Activity */}
        <ChartCard title="Histórico">
          <div className="space-y-4">
            {[
              { action: "Lead criado", time: "15 Dez, 10:30", icon: Plus },
              { action: "Primeiro contato", time: "15 Dez, 14:00", icon: Phone },
              { action: "Email enviado", time: "16 Dez, 09:15", icon: Mail },
              { action: "Proposta enviada", time: "17 Dez, 11:00", icon: DollarSign },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </Layout>
  );
}
