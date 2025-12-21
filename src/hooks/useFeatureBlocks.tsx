import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FeatureBlock {
  feature_key: string;
  blocked: boolean;
}

export function useFeatureBlocks() {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<FeatureBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [planExpired, setPlanExpired] = useState(false);

  useEffect(() => {
    async function fetchBlocks() {
      if (!user) {
        setBlocks([]);
        setPlanExpired(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user plan is expired
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("plan")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profile?.plan === "expirado") {
          setPlanExpired(true);
          setBlocks([]);
          setLoading(false);
          return;
        }

        setPlanExpired(false);

        const { data, error } = await supabase
          .from("user_feature_blocks")
          .select("feature_key, blocked")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching feature blocks:", error);
          setBlocks([]);
        } else {
          setBlocks(data || []);
        }
      } catch (err) {
        console.error("Error fetching feature blocks:", err);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBlocks();
  }, [user]);

  const isBlocked = (featureKey: string): boolean => {
    // If plan is expired, ALL features are blocked (except admin panel)
    if (planExpired && featureKey !== "admin") {
      return true;
    }
    
    const block = blocks.find(b => b.feature_key === featureKey);
    return block?.blocked || false;
  };

  return { blocks, loading, isBlocked, planExpired };
}
