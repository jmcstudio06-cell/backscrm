import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const TRIAL_DURATION_MINUTES = 20;
const TRIAL_DURATION_MS = TRIAL_DURATION_MINUTES * 60 * 1000;

interface QuickTrialStatus {
  isActive: boolean;
  isExpired: boolean;
  timeRemaining: number; // in milliseconds
  minutesLeft: number;
  secondsLeft: number;
  startedAt: Date | null;
  expiresAt: Date | null;
}

export function useQuickTrial() {
  const { user } = useAuth();
  const [status, setStatus] = useState<QuickTrialStatus>({
    isActive: false,
    isExpired: false,
    timeRemaining: TRIAL_DURATION_MS,
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
    const minutesLeft = Math.floor(totalSecondsLeft / 60);
    const secondsLeft = totalSecondsLeft % 60;

    return {
      timeRemaining,
      minutesLeft,
      secondsLeft,
      expiresAt,
      isExpired: timeRemaining <= 0,
    };
  }, []);

  useEffect(() => {
    async function fetchTrialStatus() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("plan, trial_start, created_at")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile for quick trial:", error);
          setLoading(false);
          return;
        }

        // Only apply quick trial to trial plan users
        if (profile?.plan !== "trial") {
          setStatus({
            isActive: false,
            isExpired: false,
            timeRemaining: 0,
            minutesLeft: 0,
            secondsLeft: 0,
            startedAt: null,
            expiresAt: null,
          });
          setLoading(false);
          return;
        }

        // Use trial_start if available, otherwise created_at
        const startedAt = new Date(profile.trial_start || profile.created_at);
        const timeData = calculateTimeRemaining(startedAt);

        setStatus({
          isActive: !timeData.isExpired,
          isExpired: timeData.isExpired,
          timeRemaining: timeData.timeRemaining,
          minutesLeft: timeData.minutesLeft,
          secondsLeft: timeData.secondsLeft,
          startedAt,
          expiresAt: timeData.expiresAt,
        });

        // Auto-expire the plan if trial ended
        if (timeData.isExpired && profile?.plan === "trial") {
          await supabase
            .from("profiles")
            .update({ plan: "expirado" })
            .eq("user_id", user.id);
        }
      } catch (err) {
        console.error("Error in quick trial hook:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrialStatus();
  }, [user, calculateTimeRemaining]);

  // Countdown timer effect
  useEffect(() => {
    if (!status.startedAt || status.isExpired || !status.isActive) return;

    const interval = setInterval(() => {
      const timeData = calculateTimeRemaining(status.startedAt!);

      setStatus((prev) => ({
        ...prev,
        isActive: !timeData.isExpired,
        isExpired: timeData.isExpired,
        timeRemaining: timeData.timeRemaining,
        minutesLeft: timeData.minutesLeft,
        secondsLeft: timeData.secondsLeft,
        expiresAt: timeData.expiresAt,
      }));

      // Auto-expire and update database
      if (timeData.isExpired && user) {
        supabase
          .from("profiles")
          .update({ plan: "expirado" })
          .eq("user_id", user.id)
          .then(() => {
            // Trigger page refresh to apply blocking
            window.location.reload();
          });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status.startedAt, status.isExpired, status.isActive, user, calculateTimeRemaining]);

  return { ...status, loading };
}
