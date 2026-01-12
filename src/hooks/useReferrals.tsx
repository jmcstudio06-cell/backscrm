import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Referral {
  id: string;
  referrer_id: string;
  referred_name: string;
  referred_phone: string;
  referred_user_id: string | null;
  status: "pending" | "valid" | "invalid";
  whatsapp_sent: boolean;
  whatsapp_sent_at: string | null;
  validated_at: string | null;
  invalidated_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralConfig {
  id: string;
  min_active_days: number;
  reward_10: number;
  reward_20: number;
  reward_30: number;
  campaign_active: boolean;
}

export interface ReferralReward {
  id: string;
  user_id: string;
  milestone: number;
  days_awarded: number;
  claimed_at: string;
}

export interface ReferralStats {
  total: number;
  valid: number;
  pending: number;
  invalid: number;
  nextMilestone: number;
  progressToNext: number;
  claimedMilestones: number[];
}

const MILESTONES = [10, 20, 30];

export function useReferrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from("referral_config")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching referral config:", error);
      return;
    }

    setConfig(data as ReferralConfig);
  }, []);

  const fetchReferrals = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching referrals:", error);
      return;
    }

    setReferrals(data as Referral[]);
  }, [user]);

  const fetchRewards = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("referral_rewards")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching rewards:", error);
      return;
    }

    setRewards(data as ReferralReward[]);
  }, [user]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchConfig(), fetchReferrals(), fetchRewards()]);
    setLoading(false);
  }, [fetchConfig, fetchReferrals, fetchRewards]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getStats = useCallback((): ReferralStats => {
    const total = referrals.length;
    const valid = referrals.filter((r) => r.status === "valid").length;
    const pending = referrals.filter((r) => r.status === "pending").length;
    const invalid = referrals.filter((r) => r.status === "invalid").length;
    const claimedMilestones = rewards.map((r) => r.milestone);

    // Find next unclaimed milestone
    const nextMilestone = MILESTONES.find((m) => !claimedMilestones.includes(m) && valid < m) || 0;
    const previousMilestone = MILESTONES.filter((m) => m < nextMilestone).pop() || 0;
    const progressToNext = nextMilestone > 0 ? ((valid - previousMilestone) / (nextMilestone - previousMilestone)) * 100 : 100;

    return {
      total,
      valid,
      pending,
      invalid,
      nextMilestone,
      progressToNext: Math.min(100, Math.max(0, progressToNext)),
      claimedMilestones,
    };
  }, [referrals, rewards]);

  const addReferral = async (referredName: string, referredPhone: string) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return { success: false };
    }

    // Normalize phone
    const normalizedPhone = referredPhone.replace(/\D/g, "");

    // Check if campaign is active
    if (!config?.campaign_active) {
      toast.error("A campanha de indicações está pausada no momento");
      return { success: false };
    }

    // Check if user is trying to refer their own number
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("user_id", user.id)
      .single();

    const userPhone = profile?.phone?.replace(/\D/g, "");
    if (userPhone && normalizedPhone === userPhone) {
      toast.error("Você não pode indicar seu próprio número");
      return { success: false };
    }

    // Check if phone already exists
    const { data: existing } = await supabase
      .from("referrals")
      .select("id")
      .eq("referred_phone", normalizedPhone)
      .maybeSingle();

    if (existing) {
      toast.error("Este número já foi indicado anteriormente");
      return { success: false };
    }

    // Create referral
    const { error } = await supabase.from("referrals").insert({
      referrer_id: user.id,
      referred_name: referredName.trim(),
      referred_phone: normalizedPhone,
    });

    if (error) {
      console.error("Error adding referral:", error);
      toast.error("Erro ao registrar indicação");
      return { success: false };
    }

    toast.success("Indicação registrada com sucesso!");
    await fetchReferrals();
    return { success: true, phone: normalizedPhone };
  };

  const claimReward = async (milestone: number) => {
    if (!user || !config) return false;

    const stats = getStats();
    if (stats.valid < milestone) {
      toast.error("Você ainda não atingiu essa meta");
      return false;
    }

    if (stats.claimedMilestones.includes(milestone)) {
      toast.error("Você já resgatou essa recompensa");
      return false;
    }

    const daysAwarded =
      milestone === 10 ? config.reward_10 : milestone === 20 ? config.reward_20 : config.reward_30;

    // Add reward record
    const { error: rewardError } = await supabase.from("referral_rewards").insert({
      user_id: user.id,
      milestone,
      days_awarded: daysAwarded,
    });

    if (rewardError) {
      console.error("Error claiming reward:", rewardError);
      toast.error("Erro ao resgatar recompensa");
      return false;
    }

    // Update user's plan expiry (add days to trial_start or current plan duration)
    const { data: profile } = await supabase
      .from("profiles")
      .select("trial_start, plan")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const currentDate = new Date(profile.trial_start || new Date());
      currentDate.setDate(currentDate.getDate() + daysAwarded);

      await supabase
        .from("profiles")
        .update({
          trial_start: currentDate.toISOString(),
        })
        .eq("user_id", user.id);
    }

    toast.success(`Parabéns! +${daysAwarded} dias adicionados ao seu plano!`);
    await fetchRewards();
    return true;
  };

  return {
    referrals,
    config,
    rewards,
    loading,
    stats: getStats(),
    addReferral,
    claimReward,
    refetch: fetchAll,
  };
}

// Hook for admin to manage all referrals
export function useReferralsAdmin() {
  const [allReferrals, setAllReferrals] = useState<(Referral & { referrer_name?: string })[]>([]);
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllReferrals = async () => {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all referrals:", error);
      return;
    }

    // Fetch referrer names
    const referrerIds = [...new Set(data.map((r) => r.referrer_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, name, artist_name")
      .in("user_id", referrerIds);

    const profileMap = new Map(
      profiles?.map((p) => [p.user_id, p.artist_name || p.name || "Usuário"])
    );

    const enriched = data.map((r) => ({
      ...r,
      referrer_name: profileMap.get(r.referrer_id) || "Usuário",
    }));

    setAllReferrals(enriched as (Referral & { referrer_name?: string })[]);
  };

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from("referral_config")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching referral config:", error);
      return;
    }

    setConfig(data as ReferralConfig);
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchAllReferrals(), fetchConfig()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateConfig = async (updates: Partial<ReferralConfig>) => {
    if (!config) return;

    const { error } = await supabase
      .from("referral_config")
      .update(updates)
      .eq("id", config.id);

    if (error) {
      console.error("Error updating config:", error);
      toast.error("Erro ao atualizar configurações");
      return;
    }

    toast.success("Configurações atualizadas!");
    await fetchConfig();
  };

  const updateReferralStatus = async (
    referralId: string,
    status: "pending" | "valid" | "invalid",
    reason?: string
  ) => {
    const updates: Record<string, unknown> = { status };

    if (status === "valid") {
      updates.validated_at = new Date().toISOString();
    } else if (status === "invalid") {
      updates.invalidated_reason = reason || null;
    }

    const { error } = await supabase
      .from("referrals")
      .update(updates)
      .eq("id", referralId);

    if (error) {
      console.error("Error updating referral:", error);
      toast.error("Erro ao atualizar indicação");
      return;
    }

    toast.success("Indicação atualizada!");
    await fetchAllReferrals();
  };

  const deleteReferral = async (referralId: string) => {
    const { error } = await supabase
      .from("referrals")
      .delete()
      .eq("id", referralId);

    if (error) {
      console.error("Error deleting referral:", error);
      toast.error("Erro ao excluir indicação");
      return;
    }

    toast.success("Indicação excluída!");
    await fetchAllReferrals();
  };

  return {
    allReferrals,
    config,
    loading,
    updateConfig,
    updateReferralStatus,
    deleteReferral,
    refetch: fetchAll,
  };
}
