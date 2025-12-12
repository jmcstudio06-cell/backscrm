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
  List,
  Grid3X3,
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

type ViewMode = "calendar" | "list" | "grid";

export default function Agenda() {
  const { shows, addShow, updateShow, deleteShow, cancelShow } = useShows();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2024, 11, 15));
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 11, 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [editingShow, setEditingShow] = useState<Show | null>(null);

  const handleShowCreated = (newShow: ShowData) => {
    if (editingShow) {
      updateShow(editingShow.id, {
        name: newShow.name,
        date: newShow.date,
        time: newShow.time,
        venue: newShow.venue,
        address: newShow.address,
        value: newShow.cachet,
        status: newShow.status,
        client: newShow.client,
        type: newShow.type,
      });
      toast.success(`Show "${newShow.name}" atualizado com sucesso!`);
      setEditingShow(null);
    } else {
      addShow({
        name: newShow.name,
        date: newShow.date,
        time: newShow.time,
        venue: newShow.venue,
        address: newShow.address,
        value: newShow.cachet,
        status: newShow.status,
        client: newShow.client,
        type: newShow.type,
      });
      toast.success(`Show "${newShow.name}" adicionado com sucesso!`);
    }
  };

  const handleDeleteShow = (showId: number) => {
    const showToDelete = shows.find(s => s.id === showId);
    deleteShow(showId);
    toast.success(`Show "${showToDelete?.name}" excluído com sucesso!`);
  };

  const handleCancelShow = (showId: number) => {
    const showToCancel = shows.find(s => s.id === showId);
    cancelShow(showId);
    toast.success(`Show "${showToCancel?.name}" cancelado!`);
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
    return shows.filter(show => show.date === dateStr && show.status !== "cancelled");
  };

  const selectedDayShows = getShowsForDate(selectedDate.getDate());

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div></div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "calendar" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("calendar")}
            className={viewMode === "calendar" ? "bg-primary text-primary-foreground" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendário
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4 mr-2" />
            Lista
          </Button>
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Grade
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleOpenNewShow}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Show
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-6">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground capitalize">
              {monthNames[currentMonth.getMonth()]} De {currentMonth.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div 
                key={`empty-start-${i}`} 
                className="aspect-square rounded-xl border border-border/50 bg-muted/20 flex items-center justify-center"
              >
                <span className="text-muted-foreground/50 text-sm">
                  {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -startingDay + i + 1).getDate()}
                </span>
              </div>
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayShows = getShowsForDate(day);
              const hasShow = dayShows.length > 0;
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                  className={cn(
                    "aspect-square rounded-xl border flex flex-col items-center justify-center text-sm font-medium transition-all relative",
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : hasShow
                      ? "bg-primary/10 border-primary/30 text-foreground hover:bg-primary/20"
                      : "border-border bg-card hover:bg-muted/50 text-foreground"
                  )}
                >
                  <span className={cn(today && !selected && "text-primary font-bold")}>{day}</span>
                  {hasShow && (
                    <div className="absolute bottom-1.5 flex gap-0.5">
                      {dayShows.slice(0, 3).map((show, idx) => (
                        <span 
                          key={idx}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
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
                className="aspect-square rounded-xl border border-border/50 bg-muted/20 flex items-center justify-center"
              >
                <span className="text-muted-foreground/50 text-sm">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Shows */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()].toLowerCase()}
          </h3>

          <div className="space-y-4">
            {selectedDayShows.length > 0 ? (
              selectedDayShows.map((show) => (
                <div key={show.id} className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground">{show.name}</h4>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        show.status === "confirmed" && "bg-primary/10 text-primary border-primary/20",
                        show.status === "pending" && "bg-warning/10 text-warning border-warning/20",
                        show.status === "negotiation" && "bg-accent/10 text-accent border-accent/20"
                      )}
                    >
                      {statusLabels[show.status as keyof typeof statusLabels] || show.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Cliente: {show.client}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{show.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditShow(show)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-warning hover:text-warning hover:bg-warning/10"
                      onClick={() => handleCancelShow(show.id)}
                      title="Cancelar show"
                    >
                      <XCircle className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteShow(show.id)}
                      title="Excluir show"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
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