import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const TRIAL_DURATION_HOURS = 4;
const TRIAL_DURATION_DAYS = 0;
const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;
const TRIAL_DURATION_MINUTES = TRIAL_DURATION_HOURS * 60;

// Bloqueia TUDO ao expirar (mesma lógica do expire_old_trials no banco)
const ALL_BLOCKED_FEATURES: Record<string, boolean> = {
  dashboard: true, agenda: true, crm: true, clientes: true, orcamentos: true,
  servicos: true, contratos: true, financeiro: true, historico: true,
  precificacao: true, checklist: true, "mapeamento-palco": true, equipe: true,
  metas: true, repertorio: true, aulas: true, avancos: true, tutoriais: true,
  configuracoes: true, "link-agenda": true, bonus: true, "ideias-post": true,
  "metas-anuais": true,
};

interface QuickTrialStatus {
  isActive: boolean;
  isExpired: boolean;
  timeRemaining: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  startedAt: Date | null;
  expiresAt: Date | null;
}

interface ProfileLike {
  plan: string | null;
  trial_start: string | null;
  created_at: string;
}

/**
 * @param externalProfile - Pass profile data to avoid a duplicate DB query.
 */
export function useQuickTrial(externalProfile?: ProfileLike | null) {
  const { user } = useAuth();
  const [status, setStatus] = useState<QuickTrialStatus>({
    isActive: false,
    isExpired: false,
    timeRemaining: TRIAL_DURATION_MS,
    daysLeft: TRIAL_DURATION_DAYS,
    hoursLeft: 0,
    minutesLeft: TRIAL_DURATION_MINUTES,
    secondsLeft: 0,
    startedAt: null,
    expiresAt: null,
  });
  const [loading, setLoading] = useState(true);

  const calculateTimeRemaining = useCallback((startedAt: Date) => {
    const now = new Date();
    const expiresAt = new Date(startedAt.getTime() + TRIAL_DURATION_MS);
    const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());
    const totalSecondsLeft = Math.floor(timeRemaining / 1000);
    const totalMinutesLeft = Math.floor(totalSecondsLeft / 60);
    const totalHoursLeft = Math.floor(totalMinutesLeft / 60);
    const daysLeft = Math.floor(totalHoursLeft / 24);
    const hoursLeft = totalHoursLeft % 24;
    const minutesLeft = totalMinutesLeft % 60;
    const secondsLeft = totalSecondsLeft % 60;

    return {
      timeRemaining,
      daysLeft,
      hoursLeft,
      minutesLeft,
      secondsLeft,
      totalMinutesLeft,
      expiresAt,
      isExpired: timeRemaining <= 0,
    };
  }, []);

  useEffect(() => {
    async function processProfile(profile: ProfileLike) {
      if (profile.plan !== "trial") {
        setStatus({
          isActive: false, isExpired: false, timeRemaining: 0,
          daysLeft: 0, hoursLeft: 0, minutesLeft: 0, secondsLeft: 0,
          startedAt: null, expiresAt: null,
        });
        setLoading(false);
        return;
      }

      const startedAt = new Date(profile.trial_start || profile.created_at);
      const timeData = calculateTimeRemaining(startedAt);

      setStatus({
        isActive: !timeData.isExpired, isExpired: timeData.isExpired,
        timeRemaining: timeData.timeRemaining,
        daysLeft: timeData.daysLeft, hoursLeft: timeData.hoursLeft,
        minutesLeft: timeData.minutesLeft, secondsLeft: timeData.secondsLeft,
        startedAt, expiresAt: timeData.expiresAt,
      });

      if (timeData.isExpired && user) {
        await supabase.from("profiles")
          .update({ plan: "expirado", feature_blocks: ALL_BLOCKED_FEATURES })
          .eq("user_id", user.id);
      }
      setLoading(false);
    }

    async function init() {
      if (!user) { setLoading(false); return; }

      if (externalProfile !== undefined) {
        if (externalProfile) await processProfile(externalProfile);
        else setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("plan, trial_start, created_at")
          .eq("user_id", user.id)
          .single();

        if (error) { console.error("Error fetching profile for quick trial:", error); setLoading(false); return; }
        await processProfile(profile);
      } catch (err) { console.error("Error in quick trial hook:", err); setLoading(false); }
    }

    init();
  }, [user, externalProfile, calculateTimeRemaining]);

  // Countdown timer (update every minute is enough for 3-day trial)
  useEffect(() => {
    if (!status.startedAt || status.isExpired || !status.isActive) return;

    const interval = setInterval(() => {
      const timeData = calculateTimeRemaining(status.startedAt!);
      setStatus((prev) => ({
        ...prev, isActive: !timeData.isExpired, isExpired: timeData.isExpired,
        timeRemaining: timeData.timeRemaining,
        daysLeft: timeData.daysLeft, hoursLeft: timeData.hoursLeft,
        minutesLeft: timeData.minutesLeft, secondsLeft: timeData.secondsLeft,
        expiresAt: timeData.expiresAt,
      }));

      if (timeData.isExpired && user) {
        supabase.from("profiles")
          .update({ plan: "expirado", feature_blocks: ALL_BLOCKED_FEATURES })
          .eq("user_id", user.id)
          .then(() => { window.location.reload(); });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status.startedAt, status.isExpired, status.isActive, user, calculateTimeRemaining]);

  return { ...status, loading };
}
