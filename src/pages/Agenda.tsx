import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Mic2,
  Users,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NovoShowModal, ShowData } from "@/components/shows/NovoShowModal";
import { toast } from "sonner";

const initialShows = [
  {
    id: 1,
    name: "Casamento Silva & Santos",
    date: "2024-12-15",
    time: "19:00",
    venue: "Espaço Verde Garden",
    address: "Rua das Flores, 123 - SP",
    value: 8500,
    status: "confirmed",
    client: "Maria Silva",
    type: "Casamento",
  },
  {
    id: 2,
    name: "Festa Corporativa TechCorp",
    date: "2024-12-18",
    time: "20:00",
    venue: "Hotel Marriott",
    address: "Av. Paulista, 1000 - SP",
    value: 12000,
    status: "confirmed",
    client: "João Mendes",
    type: "Corporativo",
  },
  {
    id: 3,
    name: "Aniversário 50 anos",
    date: "2024-12-22",
    time: "21:00",
    venue: "Clube Municipal",
    address: "Rua do Clube, 500 - SP",
    value: 6800,
    status: "pending",
    client: "Carlos Oliveira",
    type: "Aniversário",
  },
  {
    id: 4,
    name: "Formatura Medicina USP",
    date: "2024-12-28",
    time: "22:00",
    venue: "Buffet Elegance",
    address: "Av. Brasil, 2000 - SP",
    value: 15000,
    status: "negotiation",
    client: "Ana Paula Costa",
    type: "Formatura",
  },
];

const statusConfig = {
  confirmed: { label: "Confirmado", color: "bg-success/10 text-success border-success/20" },
  pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20" },
  negotiation: { label: "Negociação", color: "bg-accent/10 text-accent border-accent/20" },
};

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState<number | null>(15);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shows, setShows] = useState(initialShows);

  const handleShowCreated = (newShow: ShowData) => {
    const show = {
      id: shows.length + 1,
      name: newShow.name,
      date: newShow.date,
      time: newShow.time,
      venue: newShow.venue,
      address: newShow.address,
      value: newShow.cachet,
      status: newShow.status,
      client: newShow.client,
      type: newShow.type,
      expenses: newShow.expenses,
      totalExpenses: newShow.totalExpenses,
      netProfit: newShow.netProfit,
    };
    setShows([...shows, show]);
    toast.success(`Show "${newShow.name}" adicionado com sucesso!`);
  };

  return (
    <Layout title="Agenda de Shows" subtitle="Gerencie seus eventos e compromissos">
      <NovoShowModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onShowCreated={handleShowCreated}
      />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold">Dezembro 2024</h2>
          <Button variant="outline" size="icon">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Show
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <ChartCard title="Calendário" className="lg:col-span-2">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center text-xs text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the 1st */}
            {[...Array(0)].map((_, i) => (
              <div key={`empty-${i}`} className="h-12" />
            ))}
            {calendarDays.map((day) => {
              const hasShow = shows.some((show) => new Date(show.date).getDate() === day);
              const isSelected = selectedDate === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-12 rounded-lg text-sm font-medium transition-all relative",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : hasShow
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  {day}
                  {hasShow && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </ChartCard>

        {/* Stats Summary */}
        <div className="space-y-4">
          <ChartCard title="Resumo do Mês">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Confirmados</span>
                </div>
                <span className="text-lg font-bold text-success">12</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <span className="text-sm text-muted-foreground">Pendentes</span>
                </div>
                <span className="text-lg font-bold text-warning">5</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-accent" />
                  <span className="text-sm text-muted-foreground">Em Negociação</span>
                </div>
                <span className="text-lg font-bold text-accent">3</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Faturamento</span>
                </div>
                <span className="text-lg font-bold text-primary">R$ 42.300</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Shows List */}
      <div className="mt-6">
        <ChartCard title="Shows do Mês" subtitle="Lista completa de eventos">
          <div className="space-y-4">
            {shows.map((show) => (
              <div
                key={show.id}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <Mic2 className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{show.name}</h3>
                    <Badge variant="outline" className={statusConfig[show.status as keyof typeof statusConfig].color}>
                      {statusConfig[show.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(show.date).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {show.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {show.venue}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-success">
                      R$ {show.value.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">{show.type}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </Layout>
  );
}
