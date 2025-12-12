import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NovoShowModal, ShowData } from "@/components/shows/NovoShowModal";
import { toast } from "sonner";
import { useShows, Show } from "@/contexts/ShowsContext";

const statusColors = {
  confirmed: "bg-primary",
  pending: "bg-warning",
  negotiation: "bg-accent",
  scheduled: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-destructive",
};

const statusLabels = {
  confirmed: "Confirmado",
  pending: "Pendente",
  negotiation: "Negociação",
  scheduled: "Agendado",
  completed: "Realizado",
  cancelled: "Cancelado",
};

export default function Agenda() {
  const { shows, addShow, updateShow, deleteShow, cancelShow } = useShows();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);

  const handleShowCreated = (newShow: ShowData) => {
    if (editingShow) {
      updateShow(editingShow.id, {
        title: newShow.name,
        date: newShow.date,
        start_time: newShow.time,
        venue: newShow.venue,
        address: newShow.address,
        cachet: newShow.cachet,
        status: newShow.status,
        event_type: newShow.type,
      });
      toast.success(`Show "${newShow.name}" atualizado com sucesso!`);
      setEditingShow(null);
    } else {
      addShow({
        title: newShow.name,
        date: newShow.date,
        start_time: newShow.time,
        venue: newShow.venue,
        address: newShow.address,
        cachet: newShow.cachet,
        status: newShow.status,
        event_type: newShow.type,
      });
      toast.success(`Show "${newShow.name}" adicionado com sucesso!`);
    }
  };

  const handleDeleteShow = (showId: string) => {
    const showToDelete = shows.find(s => s.id === showId);
    deleteShow(showId);
    toast.success(`Show "${showToDelete?.title}" excluído com sucesso!`);
  };

  const handleCancelShow = (showId: string) => {
    const showToCancel = shows.find(s => s.id === showId);
    cancelShow(showId);
    toast.success(`Show "${showToCancel?.title}" cancelado!`);
  };

  const handleEditShow = (show: Show) => {
    setEditingShow(show);
    setIsModalOpen(true);
  };

  const handleOpenNewShow = () => {
    setEditingShow(null);
    setIsModalOpen(true);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  const getShowsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return shows.filter(show => show.date === dateStr);
  };

  const getSelectedDayShows = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return shows.filter(show => show.date === dateStr);
  };

  const selectedDayShows = getSelectedDayShows();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth.getMonth() && 
           today.getFullYear() === currentMonth.getFullYear();
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentMonth.getMonth() && 
           selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  return (
    <Layout title="Agenda de Shows" subtitle="Organize seus eventos e apresentações">
      <NovoShowModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onShowCreated={handleShowCreated}
      />
      
      {/* Header Actions */}
      <div className="flex justify-end mb-6">
        <Button className="bg-primary hover:bg-primary/90" onClick={handleOpenNewShow}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Show
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Reduced size */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground capitalize">
              {monthNames[currentMonth.getMonth()]} De {currentMonth.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - Smaller cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div 
                key={`empty-start-${i}`} 
                className="aspect-square rounded-lg border border-border/50 bg-muted/20 flex items-center justify-center"
              >
                <span className="text-muted-foreground/50 text-xs">
                  {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -startingDay + i + 1).getDate()}
                </span>
              </div>
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayShows = getShowsForDate(day);
              const hasShow = dayShows.length > 0;
              const hasCancelled = dayShows.some(s => s.status === "cancelled");
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                  className={cn(
                    "aspect-square rounded-lg border flex flex-col items-center justify-center text-xs font-medium transition-all relative",
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : hasCancelled
                      ? "bg-destructive/10 border-destructive/30 text-foreground hover:bg-destructive/20"
                      : hasShow
                      ? "bg-primary/10 border-primary/30 text-foreground hover:bg-primary/20"
                      : "border-border bg-card hover:bg-muted/50 text-foreground"
                  )}
                >
                  <span className={cn(today && !selected && "text-primary font-bold")}>{day}</span>
                  {hasShow && (
                    <div className="absolute bottom-0.5 flex gap-0.5">
                      {dayShows.slice(0, 3).map((show, idx) => (
                        <span 
                          key={idx}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            selected ? "bg-primary-foreground" : statusColors[show.status as keyof typeof statusColors]
                          )} 
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Empty cells for days after the last day */}
            {Array.from({ length: (7 - ((startingDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
              <div 
                key={`empty-end-${i}`} 
                className="aspect-square rounded-lg border border-border/50 bg-muted/20 flex items-center justify-center"
              >
                <span className="text-muted-foreground/50 text-xs">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Shows */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()].toLowerCase()}
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {selectedDayShows.length > 0 ? (
              selectedDayShows.map((show) => (
                <div 
                  key={show.id} 
                  className={cn(
                    "p-3 rounded-xl border",
                    show.status === "cancelled" 
                      ? "bg-destructive/10 border-destructive/30" 
                      : "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={cn(
                      "font-medium text-sm",
                      show.status === "cancelled" ? "text-destructive line-through" : "text-foreground"
                    )}>
                      {show.title}
                    </h4>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        show.status === "scheduled" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        show.status === "confirmed" && "bg-primary/10 text-primary border-primary/20",
                        show.status === "completed" && "bg-green-500/10 text-green-500 border-green-500/20",
                        show.status === "cancelled" && "bg-destructive/10 text-destructive border-destructive/20"
                      )}
                    >
                      {statusLabels[show.status as keyof typeof statusLabels] || show.status}
                    </Badge>
                  </div>
                  
                  {/* Show Details */}
                  {show.event_type && (
                    <p className="text-xs text-muted-foreground mb-1">Tipo: {show.event_type}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{show.venue || "Local não definido"}</span>
                  </div>
                  {show.start_time && (
                    <p className="text-xs text-muted-foreground mb-1">Horário: {show.start_time}</p>
                  )}
                  {show.cachet > 0 && (
                    <p className="text-xs font-medium text-primary">
                      Cachê: R${show.cachet.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                  
                  {show.status !== "cancelled" && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleEditShow(show)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 text-warning hover:text-warning hover:bg-warning/10"
                        onClick={() => handleCancelShow(show.id)}
                        title="Cancelar show"
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteShow(show.id)}
                        title="Excluir show"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum show agendado para este dia
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
