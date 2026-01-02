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
  // "inicial" virou "mensal" (mantemos por compatibilidade)
  mensal: 30, // 1 month
  inicial: 30, // legacy
  essencial: 90, // 3 months
  completo: 180, // 6 months
};

export function useTrialStatus() {
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
    async function fetchTrialStatus() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("plan, trial_start, trial_days, updated_at")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setLoading(false);
          return;
        }

        const plan = profile?.plan || "trial";
        const trialStart = profile?.trial_start;
        const trialDays = profile?.trial_days || 3;
        const updatedAt = profile?.updated_at;

        let daysRemaining = 0;
        let isExpired = false;
        const isTrial = plan === "trial";

        // Calculate days remaining based on plan type
        if (plan === "expirado") {
          isExpired = true;
          daysRemaining = 0;
        } else if (plan === "trial" && trialStart) {
          // Trial uses trial_start date
          const startDate = new Date(trialStart);
          const now = new Date();
          const diffTime = now.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          daysRemaining = Math.max(0, trialDays - diffDays);
          isExpired = daysRemaining <= 0;

          // Auto-expire if trial is over
          if (isExpired) {
            await supabase
              .from("profiles")
              .update({ plan: "expirado" })
              .eq("user_id", user.id);
          }
        } else if (PLAN_DURATIONS[plan] && (trialStart || updatedAt)) {
          // Paid plans use trial_start (preferred) or updated_at as start date + plan duration
          const planStartDate = new Date(trialStart || updatedAt);
          const planDuration = PLAN_DURATIONS[plan];
          const now = new Date();
          const diffTime = now.getTime() - planStartDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          daysRemaining = Math.max(0, planDuration - diffDays);
          isExpired = daysRemaining <= 0;

          // Auto-expire if plan is over
          if (isExpired) {
            await supabase
              .from("profiles")
              .update({ plan: "expirado" })
              .eq("user_id", user.id);
          }
        }

        setStatus({
          plan,
          daysRemaining,
          isExpired,
          isTrial,
          trialStart,
          trialDays,
        });
      } catch (err) {
        console.error("Error fetching trial status:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrialStatus();
  }, [user]);

  return { ...status, loading };
}
