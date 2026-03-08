import { Layout } from "@/components/layout/Layout";
import { useContentPlan, getSuggestion } from "@/hooks/useContentPlan";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Check,
  X,
  TrendingUp,
  Calendar,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function PlanejamentoConteudo() {
  const {
    entries,
    loading,
    month,
    year,
    setMonth,
    setYear,
    daysInMonth,
    updateStatus,
    doneCount,
    skippedCount,
    pendingCount,
    consistencyPercent,
  } = useContentPlan();

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  const today = isCurrentMonth ? now.getDate() : 0;

  const navigateMonth = (dir: -1 | 1) => {
    let m = month + dir;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(m);
    setYear(y);
  };

  return (
    <Layout title="Ideias de Post">
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Ideias de Post</h1>
            <p className="text-sm text-muted-foreground">Mantenha consistência nas redes e divulgue seus shows</p>
          </div>
        </div>

        {/* Consistency Hero Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Consistência nas Redes</span>
              </div>
              <span className="text-2xl font-bold text-primary">{consistencyPercent}%</span>
            </div>
            <Progress value={consistencyPercent} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Posts feitos: <strong className="text-foreground">{doneCount}</strong> / {daysInMonth}
              </span>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {MONTH_NAMES[month - 1]} {year}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{doneCount}</div>
              <div className="text-xs text-muted-foreground">Posts feitos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-destructive">{skippedCount}</div>
              <div className="text-xs text-muted-foreground">Dias sem postar</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{consistencyPercent}%</div>
              <div className="text-xs text-muted-foreground">Consistência</div>
            </CardContent>
          </Card>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            {MONTH_NAMES[month - 1]} {year}
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Days */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const isToday = entry.day === today;
              const isPast = isCurrentMonth && entry.day < today;
              const suggestion = getSuggestion(entry.day);

              return (
                <Card
                  key={entry.day}
                  className={`transition-all ${
                    isToday
                      ? "ring-2 ring-primary/50 border-primary/30 bg-primary/5"
                      : entry.status === "done"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : entry.status === "skipped"
                      ? "border-destructive/30 bg-destructive/5"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Day Badge */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          entry.status === "done"
                            ? "bg-emerald-500 text-white"
                            : entry.status === "skipped"
                            ? "bg-destructive text-destructive-foreground"
                            : isToday
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {entry.day}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            Dia {entry.day}
                          </span>
                          {isToday && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                              HOJE
                            </Badge>
                          )}
                          {entry.status === "done" && (
                            <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">
                              FEITO
                            </Badge>
                          )}
                          {entry.status === "skipped" && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              NÃO FEZ
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{suggestion}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1.5 shrink-0">
                        <Button
                          size="icon"
                          variant={entry.status === "done" ? "default" : "outline"}
                          className={`w-9 h-9 rounded-xl ${
                            entry.status === "done"
                              ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500"
                              : "hover:bg-emerald-500/10 hover:border-emerald-500/50"
                          }`}
                          onClick={() => updateStatus(entry.day, entry.status === "done" ? "pending" : "done")}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant={entry.status === "skipped" ? "destructive" : "outline"}
                          className={`w-9 h-9 rounded-xl ${
                            entry.status !== "skipped"
                              ? "hover:bg-destructive/10 hover:border-destructive/50"
                              : ""
                          }`}
                          onClick={() => updateStatus(entry.day, entry.status === "skipped" ? "pending" : "skipped")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Monthly Summary */}
        {!loading && (
          <Card className="border-primary/20">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Resumo do Mês</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-primary">{doneCount}</div>
                  <div className="text-xs text-muted-foreground">Posts feitos</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-destructive">{skippedCount}</div>
                  <div className="text-xs text-muted-foreground">Dias sem postar</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{consistencyPercent}%</div>
                  <div className="text-xs text-muted-foreground">Consistência</div>
                </div>
              </div>
              <Progress value={consistencyPercent} className="h-2" />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
