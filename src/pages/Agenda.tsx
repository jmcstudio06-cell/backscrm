import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
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
  Clock,
  DollarSign,
  Target,
  Sparkles,
  ArrowRight,
  Music,
  CalendarCheck,
  FileDown,
  CopyPlus,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, parseLocalDate } from "@/lib/utils";
import { NovoShowModal, ShowData } from "@/components/shows/NovoShowModal";
import { MirrorShowDialog } from "@/components/shows/MirrorShowDialog";
import { ImportShowsModal } from "@/components/shows/ImportShowsModal";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useShows, type Show } from "@/contexts/shows/ShowsContext";
import { useGoals } from "@/hooks/useGoals";
import { useMonthlyShowLimit } from "@/hooks/useMonthlyShowLimit";

const statusColors: Record<string, string> = {
  confirmed: "bg-primary",
  pending: "bg-warning",
  negotiation: "bg-accent",
  scheduled: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-destructive",
};

const statusLabels: Record<string, string> = {
  confirmed: "Pagamento Pendente",
  pending: "Pagamento Pendente",
  negotiation: "Negociação",
  scheduled: "Pagamento Pendente",
  completed: "Pagamento Realizado",
  cancelled: "Show Cancelado",
};

const statusBadgeStyles: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  confirmed: "bg-primary/10 text-primary border-primary/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  negotiation: "bg-accent/10 text-accent border-accent/30",
  completed: "bg-green-500/10 text-green-600 border-green-500/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

// ✅ Garante que SEMPRE salvamos date como "YYYY-MM-DD"
function normalizeISODate(input: unknown): string | null {
  if (!input) return null;
  if (input instanceof Date && !isNaN(input.getTime())) {
    const y = input.getFullYear();
    const m = String(input.getMonth() + 1).padStart(2, "0");
    const d = String(input.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;
    if (s.includes("T")) return s.slice(0, 10);
    const match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
      return `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  }
  return null;
}

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function Agenda() {
  const { shows, addShow, updateShow, deleteShow, cancelShow } = useShows();
  const { goals } = useGoals();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [mirrorShow, setMirrorShow] = useState<Show | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { user } = useAuth();
  
  const [financialMode, setFinancialMode] = useState<"automatic" | "manual">(() => {
    if (!user) return "automatic";
    return (localStorage.getItem(`financial_mode_${user.id}`) as "automatic" | "manual") || "automatic";
  });

  const handleFinancialModeChange = (checked: boolean) => {
    const mode = checked ? "automatic" : "manual";
    setFinancialMode(mode);
    if (user?.id) localStorage.setItem(`financial_mode_${user.id}`, mode);
    toast.success(`Lançamento financeiro ${checked ? "automático" : "manual"} ativado.`);
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
    const safeDate = normalizeISODate(newShow.date);
    if (!safeDate) {
      toast.error("Data inválida. Selecione uma data válida para salvar o show.");
      return;
    }
    const musicians = newShow.selectedMusicians?.map((m) => ({ musicianId: m.musicianId, name: m.name, fee: m.fee })) || [];
    const expenses = newShow.expenses?.map((e) => ({ id: e.id, description: e.description, category: e.category, value: e.value })) || [];

    if (editingShow) {
      updateShow(editingShow.id, {
        title: newShow.name, date: safeDate, start_time: newShow.time || null,
        end_time: newShow.endTime || null,
        duration_minutes: newShow.durationMinutes ?? null,
        performance_format: newShow.performanceFormat ?? null,
        venue: newShow.venue || null, address: newShow.address || null, cachet: newShow.cachet,
        status: newShow.status, event_type: newShow.type || null, client_id: newShow.clientId || null,
        advance_amount: newShow.advanceAmount || 0,
        advance_received_date: newShow.advanceReceivedDate ?? null,
        balance_due_date: newShow.balanceDueDate ?? null,
      } as any, musicians, expenses);
      setEditingShow(null);
    } else {
      addShow({
        title: newShow.name, date: safeDate, start_time: newShow.time || null,
        end_time: newShow.endTime || null,
        duration_minutes: newShow.durationMinutes ?? null,
        performance_format: newShow.performanceFormat ?? null,
        venue: newShow.venue || null, address: newShow.address || null, cachet: newShow.cachet,
        status: newShow.status, event_type: newShow.type || null, client_id: newShow.clientId || null,
        advance_amount: newShow.advanceAmount || 0,
        advance_received_date: newShow.advanceReceivedDate ?? null,
        balance_due_date: newShow.balanceDueDate ?? null,
      } as any, musicians, expenses, newShow.checklistTemplateId, undefined, newShow.advanceAmount || 0);
    }
  };


  const handleDeleteShow = (showId: string) => {
    const s = shows.find((s) => s.id === showId);
    deleteShow(showId);
    toast.success(`Show "${s?.title}" excluído com sucesso!`);
  };

  const handleCancelShow = (showId: string) => {
    const s = shows.find((s) => s.id === showId);
    cancelShow(showId);
    toast.success(`Show "${s?.title}" cancelado!`);
  };

  const handleConfirmShow = (showId: string) => {
    const s = shows.find((s) => s.id === showId);
    updateShow(showId, { status: "confirmed" });
    toast.success(`Show "${s?.title}" confirmado!`);
  };

  const handleEditShow = (show: Show) => {
    setEditingShow(show);
    setIsModalOpen(true);
  };

  const handleOpenNewShow = (presetDate?: Date) => {
    setEditingShow(null);
    setIsModalOpen(true);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  const sortByStartTime = (a: { start_time?: string | null }, b: { start_time?: string | null }) =>
    (a.start_time || "99:99").localeCompare(b.start_time || "99:99");

  const getShowsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return shows.filter((show) => show.date === dateStr).sort(sortByStartTime);
  };

  const getSelectedDayShows = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    return shows.filter((show) => show.date === dateStr).sort(sortByStartTime);
  };


  const selectedDayShows = getSelectedDayShows();

  // Monthly stats
  const monthShows = useMemo(() => {
    return shows.filter((show) => {
      if (!show.date || typeof show.date !== "string") return false;
      const parts = show.date.split("-");
      if (parts.length < 2) return false;
      const [y, m] = parts.map(Number);
      return m - 1 === currentMonth.getMonth() && y === currentMonth.getFullYear();
    });
  }, [shows, currentMonth]);

  const completedShowsThisMonth = useMemo(() => {
    return monthShows.filter((s) => s.status === "completed" || s.status === "confirmed").length;
  }, [monthShows]);

  const currentShowGoal = useMemo(() => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    return goals.find((g) => g.type === "shows" && g.month === month && g.year === year);
  }, [goals, currentMonth]);

  // Upcoming shows (from today forward)
  const upcomingShows = useMemo(() => {
    const todayStr = normalizeISODate(new Date()) || "";
    return shows
      .filter((s) => s.date && s.date >= todayStr && s.status !== "cancelled" && s.status !== "completed")
      .sort((a, b) => {
        const d = (a.date || "").localeCompare(b.date || "");
        if (d !== 0) return d;
        return (a.start_time || "").localeCompare(b.start_time || "");
      })
      .slice(0, 5);
  }, [shows]);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const selectedDateFormatted = `${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()].toLowerCase()} de ${selectedDate.getFullYear()}`;
  const dayOfWeekNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

  return (
    <Layout title="Agenda de Shows" subtitle="Organize seus eventos e apresentações">
      <NovoShowModal
        open={isModalOpen}
        onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingShow(null); }}
        onShowCreated={handleShowCreated}
        editingShow={editingShow}
        presetDate={selectedDate}
      />
      <ImportShowsModal open={isImportOpen} onOpenChange={setIsImportOpen} />

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-3 lg:mb-2">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
          <TabsList className="h-8">
            <TabsTrigger value="calendar" className="h-7 text-xs px-3 gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="list" className="h-7 text-xs px-3 gap-1.5">
              <List className="w-3.5 h-3.5" />
              Lista
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card border border-border/50 rounded-lg shadow-sm">
            <Label htmlFor="financial-mode" className="text-xs font-semibold cursor-pointer">
              Lançamento Automático
            </Label>
            <Switch
              id="financial-mode"
              checked={financialMode === "automatic"}
              onCheckedChange={handleFinancialModeChange}
              className="scale-90"
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsImportOpen(true)}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleOpenNewShow()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Show
          </Button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(520px,640px)_minmax(320px,1fr)] gap-4 items-start">
          {/* Calendar */}
          <div className="w-full lg:justify-self-start lg:max-w-[640px] relative overflow-hidden rounded-2xl bg-card border border-border/40 shadow-elevated">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/8 to-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

            {/* Month Header */}
            <div className="relative flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                {monthNames[currentMonth.getMonth()]} <span className="text-muted-foreground font-semibold">{currentMonth.getFullYear()}</span>
              </h2>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted/80" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs px-3 rounded-xl font-semibold border-primary/20 text-primary hover:bg-primary/10" onClick={goToToday}>
                  Hoje
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted/80" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 px-4 pb-1">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, i) => (
                <div key={day} className={cn(
                  "text-center text-xs font-semibold py-2",
                  i === 0 || i === 6 ? "text-muted-foreground/60" : "text-muted-foreground"
                )}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 px-4 pb-5">
              {/* Empty cells before month */}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-start-${i}`} className="aspect-square rounded-xl flex items-center justify-center">
                  <span className="text-muted-foreground/30 text-xs font-medium">
                    {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -startingDay + i + 1).getDate()}
                  </span>
                </div>
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayShows = getShowsForDate(day);
                const hasShow = dayShows.length > 0;
                const hasCancelled = dayShows.some((s) => s.status === "cancelled");
                const hasConfirmed = dayShows.some((s) => s.status === "confirmed");
                const selected = isSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all duration-200 relative group",
                      selected
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105 ring-2 ring-primary/20"
                        : today
                          ? "bg-primary/15 text-primary border-2 border-primary/30 font-bold"
                          : hasCancelled
                            ? "bg-destructive/8 text-foreground hover:bg-destructive/15 border border-destructive/20"
                            : hasShow
                              ? "bg-primary/8 text-foreground hover:bg-primary/15 border border-primary/20"
                              : "text-foreground hover:bg-muted/60 border border-transparent hover:border-border/50",
                    )}
                  >
                    <span className="relative z-10">{day}</span>
                    {hasShow && (
                      <div className="absolute bottom-1 sm:bottom-1.5 flex gap-0.5">
                        {dayShows.slice(0, 3).map((show, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125",
                              selected
                                ? "bg-primary-foreground"
                                : show.status === "confirmed"
                                  ? "bg-primary"
                                  : show.status === "completed"
                                    ? "bg-green-500"
                                    : show.status === "cancelled"
                                      ? "bg-destructive"
                                      : "bg-warning",
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Empty cells after month */}
              {Array.from({ length: (7 - ((startingDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
                <div key={`empty-end-${i}`} className="aspect-square rounded-xl flex items-center justify-center">
                  <span className="text-muted-foreground/30 text-xs font-medium">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== REDESIGNED SIDE PANEL ===== */}
          <div className="space-y-4">
            {/* Selected Day Header */}
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4 sm:p-5 shadow-card">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-accent/4 opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                      {dayOfWeekNames[selectedDate.getDay()]}
                    </p>
                    <p className="text-lg font-bold text-foreground">{selectedDateFormatted}</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold",
                    selectedDayShows.length > 0
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "bg-muted text-muted-foreground border border-border/50"
                  )}>
                    {selectedDayShows.length > 0
                      ? `${selectedDayShows.length} show${selectedDayShows.length > 1 ? "s" : ""}`
                      : "Livre"}
                  </div>
                </div>

                {/* Quick add button */}
                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                  onClick={() => handleOpenNewShow(selectedDate)}
                >
                  <Plus className="w-4 h-4" />
                  Agendar show neste dia
                </Button>
              </div>
            </div>

            {/* Shows for selected day */}
            {selectedDayShows.length > 0 ? (
              <div className="space-y-3">
                {selectedDayShows.map((show) => (
                  <div
                    key={show.id}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border p-4 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5",
                      show.status === "cancelled"
                        ? "bg-destructive/5 border-destructive/20"
                        : "bg-card border-border/50",
                    )}
                  >
                    {/* Status badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h4 className={cn(
                          "font-bold text-sm truncate",
                          show.status === "cancelled" ? "text-destructive line-through" : "text-foreground"
                        )}>
                          {show.title}
                        </h4>
                        {show.event_type && (
                          <p className="text-xs text-muted-foreground mt-0.5">{show.event_type}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 h-5 shrink-0 font-bold", statusBadgeStyles[show.status] || "")}>
                        {statusLabels[show.status] || show.status}
                      </Badge>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {show.venue && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                          <span className="truncate">{show.venue}</span>
                        </div>
                      )}
                      {show.start_time && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                          <span>{show.start_time}</span>
                        </div>
                      )}
                      {(show.cachet ?? 0) > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          <span>R$ {fmt(show.cachet ?? 0)}</span>
                        </div>
                      )}
                      {show.address && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                          <span className="truncate">{show.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => handleEditShow(show)}>
                        <Edit className="w-3 h-3" /> Editar
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10" onClick={() => setMirrorShow(show)} title="Espelhar data">
                        <CopyPlus className="w-3.5 h-3.5" />
                      </Button>
                      {show.status !== "cancelled" && show.status !== "completed" && show.status !== "confirmed" && (
                        <Button variant="outline" size="icon" className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => handleConfirmShow(show.id)} title="Confirmar">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {show.status !== "cancelled" && (
                        <Button variant="outline" size="icon" className="h-7 w-7 text-warning hover:text-warning hover:bg-warning/10" onClick={() => handleCancelShow(show.id)} title="Cancelar">
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteShow(show.id)} title="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/50 bg-card p-6 text-center">
                <CalendarCheck className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Nenhum show neste dia</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Clique no botão acima para agendar</p>
              </div>
            )}

            {/* Monthly Stats + Goal */}
            <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-5 shadow-card space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-md">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Shows do mês</p>
                  <p className="text-lg font-bold text-foreground leading-tight">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/30 border border-border/30 p-2.5 text-center">
                  <p className="text-lg font-bold text-foreground">{monthShows.length}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">Total</p>
                </div>
                <div className="rounded-xl bg-muted/30 border border-border/30 p-2.5 text-center">
                  <p className="text-lg font-bold text-primary">{monthShows.filter((s) => s.status === "confirmed").length}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">Confirmados</p>
                </div>
                <div className="rounded-xl bg-muted/30 border border-border/30 p-2.5 text-center">
                  <p className="text-lg font-bold text-green-500">{monthShows.filter((s) => s.status === "completed").length}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">Realizados</p>
                </div>
              </div>

              {/* Goal progress */}
              {currentShowGoal && (
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold text-foreground">Meta de Shows</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {completedShowsThisMonth}
                      <span className="text-muted-foreground font-semibold">/{currentShowGoal.target_value}</span>
                    </span>
                  </div>
                  {(() => {
                    const progress = Math.min(Math.round((completedShowsThisMonth / currentShowGoal.target_value) * 100), 100);
                    const isCompleted = completedShowsThisMonth >= currentShowGoal.target_value;
                    return (
                      <>
                        <Progress value={progress} className="h-2.5" />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground font-medium">{progress}% concluído</span>
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Meta batida!
                            </span>
                          ) : progress >= 50 ? (
                            <span className="text-[10px] font-bold text-primary">No ritmo certo!</span>
                          ) : (
                            <span className="text-[10px] font-bold text-warning">Acelere!</span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Upcoming Shows */}
            {upcomingShows.length > 0 && (
              <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-5 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Próximos Shows</h3>
                </div>
                <div className="space-y-2">
                  {upcomingShows.map((show) => {
                    const showDate = parseLocalDate(show.date);
                    const dayOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][showDate.getDay()];
                    return (
                      <button
                        key={show.id}
                        onClick={() => handleEditShow(show)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                      >
                        <div className="flex-shrink-0 text-center w-10">
                          <div className="text-base font-bold text-foreground leading-none">{showDate.getDate()}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-medium">{dayOfWeek}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{show.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {show.start_time && <span>{show.start_time}</span>}
                            {show.venue && <span className="truncate">{show.venue}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {(show.cachet ?? 0) > 0 && (
                            <span className="text-xs font-semibold text-primary">R$ {fmt(show.cachet ?? 0)}</span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ===== LIST VIEW ===== */
        <div className="bg-card rounded-2xl border border-border/50 shadow-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-base font-bold text-foreground capitalize">
              {monthNames[currentMonth.getMonth()]} de {currentMonth.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2 gap-1"
                onClick={() => {
                  const listShows = shows
                    .filter((show) => {
                      if (!show.date || typeof show.date !== "string") return false;
                      const parts = show.date.split("-");
                      if (parts.length < 2) return false;
                      const [y, m] = parts.map(Number);
                      return m - 1 === currentMonth.getMonth() && y === currentMonth.getFullYear();
                    })
                    .sort((a, b) => {
                      const d = (a.date || "").localeCompare(b.date || "");
                      if (d !== 0) return d;
                      return (a.start_time || "").localeCompare(b.start_time || "");
                    });

                  if (listShows.length === 0) {
                    toast.error("Nenhum show para exportar neste mês");
                    return;
                  }

                  const monthLabel = `${monthNames[currentMonth.getMonth()]} de ${currentMonth.getFullYear()}`;
                  const totalCachet = listShows.reduce((s, sh) => s + (sh.cachet ?? 0), 0);

                  let html = `
                    <html><head><meta charset="utf-8"><title>Agenda - ${monthLabel}</title>
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px; color: #1a1a1a; }
                      h1 { font-size: 22px; margin-bottom: 4px; }
                      .subtitle { color: #666; font-size: 13px; margin-bottom: 24px; }
                      table { width: 100%; border-collapse: collapse; font-size: 13px; }
                      th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 2px solid #ddd; }
                      td { padding: 10px 12px; border-bottom: 1px solid #eee; }
                      tr:hover { background: #fafafa; }
                      .status { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                      .status-confirmed { background: #e8f5e9; color: #2e7d32; }
                      .status-completed { background: #e8f5e9; color: #1b5e20; }
                      .status-pending { background: #fff3e0; color: #e65100; }
                      .status-cancelled { background: #ffebee; color: #c62828; text-decoration: line-through; }
                      .status-negotiation { background: #e3f2fd; color: #1565c0; }
                      .status-scheduled { background: #e3f2fd; color: #1565c0; }
                      .total-row { font-weight: 700; background: #f0f0f0; }
                      .right { text-align: right; }
                      @media print { body { padding: 16px; } }
                    </style></head><body>
                    <h1>📅 Agenda de Shows</h1>
                    <p class="subtitle">${monthLabel} — ${listShows.length} show(s)</p>
                    <table>
                      <thead><tr><th>Data</th><th>Show</th><th>Local</th><th>Horário</th><th>Status</th><th class="right">Cachê</th></tr></thead>
                      <tbody>`;

                  listShows.forEach((show) => {
                    const d = parseLocalDate(show.date);
                    const dayOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()];
                    const statusClass = `status-${show.status}`;
                    html += `<tr>
                      <td>${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} (${dayOfWeek})</td>
                      <td><strong>${show.title}</strong></td>
                      <td>${show.venue || '—'}</td>
                      <td>${show.start_time || '—'}</td>
                      <td><span class="status ${statusClass}">${statusLabels[show.status] || show.status}</span></td>
                      <td class="right">${(show.cachet ?? 0) > 0 ? `R$ ${fmt(show.cachet ?? 0)}` : '—'}</td>
                    </tr>`;
                  });

                  html += `<tr class="total-row">
                      <td colspan="5">Total do mês</td>
                      <td class="right">R$ ${fmt(totalCachet)}</td>
                    </tr></tbody></table></body></html>`;

                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(html);
                    printWindow.document.close();
                    setTimeout(() => printWindow.print(), 500);
                  }
                }}
              >
                <FileDown className="w-3 h-3" />
                PDF
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border">
            {(() => {
              const listShows = shows
                .filter((show) => {
                  if (!show.date || typeof show.date !== "string") return false;
                  const parts = show.date.split("-");
                  if (parts.length < 2) return false;
                  const [y, m] = parts.map(Number);
                  return m - 1 === currentMonth.getMonth() && y === currentMonth.getFullYear();
                })
                .sort((a, b) => {
                  const d = (a.date || "").localeCompare(b.date || "");
                  if (d !== 0) return d;
                  return (a.start_time || "").localeCompare(b.start_time || "");
                });

              if (listShows.length === 0) {
                return (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Nenhum show agendado para este mês
                  </div>
                );
              }

              return listShows.map((show) => {
                const showDate = parseLocalDate(show.date);
                const dayOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][showDate.getDay()];

                return (
                  <div
                    key={show.id}
                    className={cn(
                      "flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/50 transition-colors",
                      show.status === "cancelled" && "opacity-60",
                    )}
                  >
                    <div className="flex-shrink-0 text-center w-10 sm:w-14">
                      <div className="text-xl sm:text-2xl font-bold text-foreground">{showDate.getDate()}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase">{dayOfWeek}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-medium text-xs sm:text-sm truncate",
                        show.status === "cancelled" ? "text-destructive line-through" : "text-foreground",
                      )}>
                        {show.title}
                      </h4>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        {show.start_time && <span>{show.start_time}</span>}
                        {show.venue && (
                          <span className="flex items-center gap-1 truncate max-w-[80px] sm:max-w-none">
                            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate">{show.venue}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4 flex-shrink-0", statusBadgeStyles[show.status] || "")}>
                      {statusLabels[show.status] || show.status}
                    </Badge>
                    <div className="flex-shrink-0 w-16 sm:w-20 text-right">
                      {(show.cachet ?? 0) > 0 ? (
                        <div className="text-xs sm:text-sm font-semibold text-primary">R$ {fmt(show.cachet ?? 0)}</div>
                      ) : (
                        <div className="text-xs text-muted-foreground">-</div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleEditShow(show)}>
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-primary hover:text-primary" onClick={() => setMirrorShow(show)} title="Espelhar data">
                        <CopyPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      {show.status !== "cancelled" && show.status !== "completed" && show.status !== "confirmed" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-green-500 hover:text-green-600" onClick={() => handleConfirmShow(show.id)} title="Confirmar">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                      {show.status !== "cancelled" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-warning hover:text-warning" onClick={() => handleCancelShow(show.id)}>
                          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteShow(show.id)}>
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
      <MirrorShowDialog
        open={!!mirrorShow}
        onOpenChange={(o) => !o && setMirrorShow(null)}
        show={mirrorShow}
      />
    </Layout>
  );
}
