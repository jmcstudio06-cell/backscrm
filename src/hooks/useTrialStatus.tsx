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
          .select("plan, trial_start, trial_days")
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

        // Calculate days remaining for trial
        let daysRemaining = 0;
        let isExpired = false;
        const isTrial = plan === "trial";

        if (isTrial && trialStart) {
          const startDate = new Date(trialStart);
          const now = new Date();
          const diffTime = now.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          daysRemaining = Math.max(0, trialDays - diffDays);
          isExpired = daysRemaining <= 0;

          // Auto-expire if trial is over
          if (isExpired && plan === "trial") {
            await supabase
              .from("profiles")
              .update({ plan: "expirado" })
              .eq("user_id", user.id);
          }
        }

        // Check expiration for other plans
        if (plan === "expirado") {
          isExpired = true;
          daysRemaining = 0;
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
