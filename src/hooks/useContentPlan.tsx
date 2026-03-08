import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type ContentStatus = "pending" | "done" | "skipped";

export interface ContentEntry {
  day: number;
  status: ContentStatus;
}

const SUGGESTIONS: Record<number, string> = {
  1: "Poste um vídeo cantando um refrão forte.",
  2: "Mostre um trecho de ensaio.",
  3: "Divulgue seu próximo show.",
  4: "Poste um vídeo cantando uma música que você gosta muito.",
  5: "Mostre bastidores da sua rotina como músico.",
  6: "Poste um story perguntando qual música o público quer ouvir.",
  7: "Poste um vídeo cantando um trecho de música sertaneja famosa.",
  8: "Mostre seu instrumento ou equipamento.",
  9: "Poste um vídeo curto cantando no violão.",
  10: "Divulgue novamente um show da agenda.",
  11: "Mostre um momento engraçado do ensaio.",
  12: "Poste um vídeo cantando no carro ou em casa.",
  13: "Mostre um trecho de passagem de som.",
  14: "Poste uma foto sua tocando.",
  15: "Poste um vídeo cantando uma música que marcou sua carreira.",
  16: "Mostre um bastidor antes do show.",
  17: "Poste um trecho do público cantando junto.",
  18: "Mostre o palco ou o lugar onde vai tocar.",
  19: "Poste um vídeo cantando um cover.",
  20: "Divulgue agenda de shows da semana.",
  21: "Poste um vídeo curto agradecendo o público.",
  22: "Mostre bastidores depois do show.",
  23: "Poste um vídeo cantando um refrão famoso.",
  24: "Mostre sua banda ou músicos que tocam com você.",
  25: "Poste um story perguntando qual música tocar no próximo show.",
  26: "Mostre seu repertório ou preparação para o show.",
  27: "Poste um vídeo cantando uma música romântica.",
  28: "Mostre um momento do público no show.",
  29: "Poste um vídeo cantando uma música animada.",
  30: "Poste um vídeo agradecendo quem acompanha seu trabalho.",
  31: "Poste um resumo do mês de shows.",
};

export function getSuggestion(day: number): string {
  return SUGGESTIONS[day] || "Dia livre — poste o que quiser!";
}

export function useContentPlan() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const daysInMonth = new Date(year, month, 0).getDate();

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_plan_entries" as any)
        .select("day, status")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year);

      if (error) throw error;

      const map = new Map<number, ContentStatus>();
      (data as any[])?.forEach((d: any) => map.set(d.day, d.status as ContentStatus));

      const result: ContentEntry[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        result.push({ day: d, status: map.get(d) || "pending" });
      }
      setEntries(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, month, year, daysInMonth]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const updateStatus = async (day: number, status: ContentStatus) => {
    if (!user) return;
    try {
      const { data: existing } = await supabase
        .from("content_plan_entries" as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("day", day)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      if ((existing as any)?.id) {
        await supabase
          .from("content_plan_entries" as any)
          .update({ status, updated_at: new Date().toISOString() } as any)
          .eq("id", (existing as any).id);
      } else {
        await supabase
          .from("content_plan_entries" as any)
          .insert({ user_id: user.id, day, month, year, status } as any);
      }

      setEntries((prev) =>
        prev.map((e) => (e.day === day ? { ...e, status } : e))
      );

      toast.success(status === "done" ? "Marcado como feito! ✅" : "Marcado como não feito ❌");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status");
    }
  };

  const doneCount = entries.filter((e) => e.status === "done").length;
  const skippedCount = entries.filter((e) => e.status === "skipped").length;
  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const consistencyPercent = daysInMonth > 0 ? Math.round((doneCount / daysInMonth) * 100) : 0;

  return {
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
  };
}
