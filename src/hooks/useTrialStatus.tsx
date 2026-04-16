import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TrialStatus {
  plan: string;
  daysRemaining: number;
  isExpired: boolean;
  isTrial: boolean;
  trialStart: string | null;
  trialDays: number;
}

// Plan durations in days
const PLAN_DURATIONS: Record<string, number> = {
  trial: 3,
  mensal_starter: 30,
  mensal_profissional: 30,
  mensal_empresarial: 30,
  mensal_completo: 30,
  anual_starter: 365,
  anual_profissional: 365,
  anual_empresarial: 365,
  anual_completo: 365,
  // Legacy
  starter: 30, mensal: 30, inicial: 30, base: 30,
  essencial: 90, completo: 180, anual: 365,
};

interface ProfileLike {
  plan: string | null;
  trial_start: string | null;
  trial_days?: number | null;
  updated_at?: string;
}

/**
 * @param externalProfile - Pass profile data to avoid a duplicate DB query.
 */
export function useTrialStatus(externalProfile?: ProfileLike | null) {
  const { user } = useAuth();
  const [status, setStatus] = useState<TrialStatus>({
    plan: "trial",
    daysRemaining: 0,
    isExpired: false,
    isTrial: true,
    trialStart: null,
    trialDays: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function computeStatus(profile: ProfileLike) {
      const plan = profile.plan || "trial";
      const trialStart = profile.trial_start;
      const trialDays = profile.trial_days || 3;
      const updatedAt = profile.updated_at;

      let daysRemaining = 0;
      let isExpired = false;
      const isTrial = plan === "trial";

      if (plan === "expirado" || plan === "comprou_expirado") {
        isExpired = true;
        daysRemaining = 0;
      } else if (plan === "trial" && trialStart) {
        const startDate = new Date(trialStart);
        const now = new Date();
        const diffTime = now.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, trialDays - diffDays);
        isExpired = daysRemaining <= 0;

        if (isExpired && user) {
          await supabase
            .from("profiles")
            .update({ plan: "expirado" })
            .eq("user_id", user.id);
        }
      } else if (PLAN_DURATIONS[plan] && (trialStart || updatedAt)) {
        const planStartDate = new Date(trialStart || updatedAt!);
        const planDuration = PLAN_DURATIONS[plan];
        const now = new Date();
        const diffTime = now.getTime() - planStartDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, planDuration - diffDays);
        isExpired = daysRemaining <= 0;

        if (isExpired && user) {
          await supabase
            .from("profiles")
            .update({ plan: "comprou_expirado" })
            .eq("user_id", user.id);
        }
      }

      setStatus({ plan, daysRemaining, isExpired, isTrial, trialStart, trialDays });
      setLoading(false);
    }

    async function fetchAndCompute() {
      if (!user) {
        setLoading(false);
        return;
      }

      // Use external profile if provided
      if (externalProfile !== undefined) {
        if (externalProfile) {
          await computeStatus(externalProfile);
        } else {
          setLoading(false);
        }
        return;
      }

      // Fallback: fetch from DB (only if no external profile passed)
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("plan, trial_start, trial_days, updated_at")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setLoading(false);
          return;
        }

        await computeStatus(profile);
      } catch (err) {
        console.error("Error fetching trial status:", err);
        setLoading(false);
      }
    }

    fetchAndCompute();
  }, [user, externalProfile]);

  return { ...status, loading };
}
