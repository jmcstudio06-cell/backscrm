import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Target, Plus, Sparkles } from "lucide-react";
import { useAdvances } from "@/hooks/useAdvances";
import { AdvanceModal } from "@/components/avancos/AdvanceModal";
import { AdvanceCard } from "@/components/avancos/AdvanceCard";
import { isToday, isThisWeek, parseISO, startOfDay } from "date-fns";

const motivationalPhrases = [
  "Qual vai ser seu próximo avanço hoje?",
  "Um passo hoje muda seu próximo mês.",
  "Cada avanço te aproxima do sucesso.",
  "Pequenas ações, grandes resultados.",
  "Sua carreira é construída um avanço por vez.",
];

export default function Avancos() {
  const [modalOpen, setModalOpen] = useState(false);
  const { advances, loading, addAdvance, completeAdvance, deleteAdvance } = useAdvances();

  const phrase = useMemo(
    () => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)],
    []
  );

  const handleSave = async (data: {
    title: string;
    category: string;
    due_type: string;
    due_date: string | null;
    priority: string;
  }) => {
    await addAdvance(data);
  };

  // Separate advances by due type
  const { todayAdvances, weekAdvances, otherAdvances, completedAdvances } = useMemo(() => {
    const today: typeof advances = [];
    const week: typeof advances = [];
    const other: typeof advances = [];
    const completed: typeof advances = [];

    const now = startOfDay(new Date());

    advances.forEach((adv) => {
      if (adv.completed) {
        completed.push(adv);
        return;
      }

      if (adv.due_type === "hoje") {
        today.push(adv);
      } else if (adv.due_type === "semana") {
        week.push(adv);
      } else if (adv.due_type === "data" && adv.due_date) {
        const date = parseISO(adv.due_date);
        if (isToday(date)) {
          today.push(adv);
        } else if (isThisWeek(date, { weekStartsOn: 0 })) {
          week.push(adv);
        } else {
          other.push(adv);
        }
      } else {
        other.push(adv);
      }
    });

    return {
      todayAdvances: today,
      weekAdvances: week,
      otherAdvances: other,
      completedAdvances: completed.slice(0, 5), // Show only last 5 completed
    };
  }, [advances]);

  const pendingCount = todayAdvances.length + weekAdvances.length + otherAdvances.length;

  return (
    <Layout title="Avanços" subtitle="Tudo que você faz pra ir mais longe na sua carreira">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Avanços
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tudo que você faz pra ir mais longe na sua carreira
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Avanço
          </Button>
        </div>

        {/* Motivational phrase */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">{phrase}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando avanços...
          </div>
        ) : pendingCount === 0 && completedAdvances.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhum avanço ainda. Que tal criar o primeiro?
            </p>
            <Button onClick={() => setModalOpen(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeiro Avanço
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today */}
            {todayAdvances.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Hoje ({todayAdvances.length})
                </h2>
                <div className="space-y-2">
                  {todayAdvances.map((adv) => (
                    <AdvanceCard
                      key={adv.id}
                      advance={adv}
                      onComplete={completeAdvance}
                      onDelete={deleteAdvance}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* This week */}
            {weekAdvances.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-amber-500 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Essa semana ({weekAdvances.length})
                </h2>
                <div className="space-y-2">
                  {weekAdvances.map((adv) => (
                    <AdvanceCard
                      key={adv.id}
                      advance={adv}
                      onComplete={completeAdvance}
                      onDelete={deleteAdvance}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Others */}
            {otherAdvances.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Sem data ({otherAdvances.length})
                </h2>
                <div className="space-y-2">
                  {otherAdvances.map((adv) => (
                    <AdvanceCard
                      key={adv.id}
                      advance={adv}
                      onComplete={completeAdvance}
                      onDelete={deleteAdvance}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Completed (collapsed) */}
            {completedAdvances.length > 0 && (
              <section className="opacity-70">
                <h2 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Concluídos recentes
                </h2>
                <div className="space-y-2">
                  {completedAdvances.map((adv) => (
                    <AdvanceCard
                      key={adv.id}
                      advance={adv}
                      onComplete={completeAdvance}
                      onDelete={deleteAdvance}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AdvanceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
      />
    </Layout>
  );
}
