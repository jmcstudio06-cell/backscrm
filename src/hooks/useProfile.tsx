import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  trial_start: string | null;
  plan: string | null;
  created_at: string;
  updated_at: string;
  artist_name: string | null;
  project_type: string | null;
  music_style: string | null;
  base_city: string | null;
  action_radius: number | null;
  show_duration: string | null;
  start_time_limit: string | null;
  delay_tolerance: string | null;
  has_interval: boolean | null;
  requires_food: boolean | null;
  min_fee: number | null;
  deposit_percentage: number | null;
  accepted_payment: string | null;
  payment_deadline: string | null;
  late_fee_percentage: number | null;
  slug: string | null;
  onboarding_completed: boolean | null;
  bio: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  spotify_url: string | null;
  website_url: string | null;
  media_kit_url: string | null;
  show_video_url: string | null;
  repertoire_url: string | null;
  link_bg_image_url: string | null;
  link_cover_type: string | null;
  booking_max_dates: number;
  booking_discount_percent: number;
  booking_min_dates_discount: number;
  booking_show_products: boolean;
  feature_blocks: Record<string, boolean> | null;
  trial_days: number | null;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading: loading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("profiles")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert({ user_id: user.id, ...updates });
        if (error) throw error;
      }

      toast.success("Perfil atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

  const fetchProfile = () => {
    if (user) queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  return { profile, loading, updateProfile, fetchProfile };
}
