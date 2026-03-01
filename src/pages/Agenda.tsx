import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  List,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { NovoShowModal, ShowData } from "@/components/shows/NovoShowModal";
import { toast } from "sonner";
import { useShows, type Show } from "@/contexts/shows/ShowsContext";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    const showId = searchParams.get("show");
    if (showId && shows.length > 0) {
      const showToOpen = shows.find((s) => s.id === showId);
      if (showToOpen) {
        setEditingShow(showToOpen);
        setIsModalOpen(true);
        setSearchParams({});
      }
    }
  }, [searchParams, shows, setSearchParams]);

  const handleShowCreated = (newShow: ShowData) => {
    const musicians =
      newShow.selectedMusicians?.map((m) => ({
        musicianId: m.musicianId,
        name: m.name,
        fee: m.fee,
      })) || [];

    const expenses =
      newShow.expenses?.map((e) => ({
        id: e.id,
        description: e.description,
        category: e.category,
        value: e.value,
      })) || [];

    if (editingShow) {
      updateShow(
        editingShow.id,
        {
          title: newShow.name,
          date: newShow.date,
          start_time: newShow.time || null,
          venue: newShow.venue || null,
          address: newShow.address || null,
          cachet: newShow.cachet,
          status: newShow.status,
          event_type: newShow.type || null,
          client_id: newShow.clientId || null,
        },
        musicians,
        expenses,
      );
      setEditingShow(null);
    } else {
      addShow(
        {
          title: newShow.name,
          date: newShow.date,
          start_time: newShow.time || null,
          venue: newShow.venue || null,
          address: newShow.address || null,
          cachet: newShow.cachet,
          status: newShow.status,
          event_type: newShow.type || null,
          client_id: newShow.clientId || null,
        },
        musicians,
        expenses,
        newShow.checklistTemplateId,
      );
    }
  };

  const handleDeleteShow = (showId: string) => {
    const showToDelete = shows.find((s) => s.id === showId);
    deleteShow(showId);
    toast.success(`Show "${showToDelete?.title}" excluído com sucesso!`);
  };

  const handleCancelShow = (showId: string) => {
    const showToCancel = shows.find((s) => s.id === showId);
    cancelShow(showId);
    toast.success(`Show "${showToCancel?.title}" cancelado!`);
  };

  const handleConfirmShow = (showId: string) => {
    const show = shows.find((s) => s.id === showId);
    updateShow(showId, { status: "confirmed" });
    toast.success(`Show "${show?.title}" confirmado!`);
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
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return shows.filter((show) => show.date === dateStr);
  };

  const getSelectedDayShows = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    return shows.filter((show) => show.date === dateStr);
  };

  const selectedDayShows = getSelectedDayShows();

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
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
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <Layout title="Agenda de Shows" subtitle="Organize seus eventos e apresentações">
      {/* TODO: resto do seu calendário continua exatamente igual */}

      {viewMode === "list" && (
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-base font-bold text-foreground capitalize">
              {monthNames[currentMonth.getMonth()]} de {currentMonth.getFullYear()}
            </h2>
          </div>

          <div className="divide-y divide-border">
            {(() => {
              const monthShows = shows
                .filter((show) => {
                  const showDate = parseLocalDate(show.date);
                  return (
                    showDate.getMonth() === currentMonth.getMonth() &&
                    showDate.getFullYear() === currentMonth.getFullYear()
                  );
                })
                .sort((a, b) => {
                  return parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime();
                });

              if (monthShows.length === 0) {
                return (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Nenhum show agendado para este mês
                  </div>
                );
              }

              return monthShows.map((show) => {
                const showDate = parseLocalDate(show.date);
                const dayOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][showDate.getDay()];

                return (
                  <div key={show.id} className="flex items-center gap-3 p-4">
                    <div className="w-14 text-center">
                      <div className="text-2xl font-bold">{showDate.getDate()}</div>
                      <div className="text-xs text-muted-foreground uppercase">{dayOfWeek}</div>
                    </div>
                    <div className="flex-1">{show.title}</div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </Layout>
  );
}
