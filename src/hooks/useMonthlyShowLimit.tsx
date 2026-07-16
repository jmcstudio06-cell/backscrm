import { useMemo } from "react";
import { useShows } from "@/contexts/shows/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { parseLocalDate } from "@/lib/utils";

const PARCEIROS_LIMIT = 5;

export function useMonthlyShowLimit() {
  const { profile } = useProfile();
  const { shows } = useShows();

  return useMemo(() => {
    const isParceiros = profile?.plan === "parceiros";
    if (!isParceiros) {
      return {
        isParceiros: false,
        limit: Infinity,
        used: 0,
        remaining: Infinity,
        blocked: false,
      };
    }

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    const used = (shows || []).filter((s) => {
      if (!s?.date) return false;
      if (s.status === "cancelled") return false;
      const d = parseLocalDate(s.date);
      if (!d) return false;
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;

    const remaining = Math.max(0, PARCEIROS_LIMIT - used);
    return {
      isParceiros: true,
      limit: PARCEIROS_LIMIT,
      used,
      remaining,
      blocked: used >= PARCEIROS_LIMIT,
    };
  }, [profile?.plan, shows]);
}
