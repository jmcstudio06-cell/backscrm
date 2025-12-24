import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LandingVisit {
  id: string;
  visitor_id: string;
  page_path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
  converted: boolean;
  converted_at: string | null;
}

export interface LandingInsights {
  totalVisits: number;
  conversions: number;
  conversionRate: number;
  todayVisits: number;
  todayConversions: number;
  weekVisits: number;
  weekConversions: number;
  monthVisits: number;
  monthConversions: number;
}

export function useLandingInsights() {
  const [visits, setVisits] = useState<LandingVisit[]>([]);
  const [insights, setInsights] = useState<LandingInsights>({
    totalVisits: 0,
    conversions: 0,
    conversionRate: 0,
    todayVisits: 0,
    todayConversions: 0,
    weekVisits: 0,
    weekConversions: 0,
    monthVisits: 0,
    monthConversions: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_page_visits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const visitsData = data || [];
      setVisits(visitsData);

      // Calculate insights
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalVisits = visitsData.length;
      const conversions = visitsData.filter(v => v.converted).length;

      const todayVisits = visitsData.filter(v => new Date(v.created_at) >= today).length;
      const todayConversions = visitsData.filter(v => v.converted && new Date(v.created_at) >= today).length;

      const weekVisits = visitsData.filter(v => new Date(v.created_at) >= weekAgo).length;
      const weekConversions = visitsData.filter(v => v.converted && new Date(v.created_at) >= weekAgo).length;

      const monthVisits = visitsData.filter(v => new Date(v.created_at) >= monthAgo).length;
      const monthConversions = visitsData.filter(v => v.converted && new Date(v.created_at) >= monthAgo).length;

      setInsights({
        totalVisits,
        conversions,
        conversionRate: totalVisits > 0 ? (conversions / totalVisits) * 100 : 0,
        todayVisits,
        todayConversions,
        weekVisits,
        weekConversions,
        monthVisits,
        monthConversions,
      });
    } catch (error) {
      console.error("Error fetching landing insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return { visits, insights, loading, refetch: fetchInsights };
}

// Function to track a landing page visit
export async function trackLandingVisit() {
  try {
    // Generate or get visitor ID from localStorage
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitor_id", visitorId);
    }

    const { error } = await supabase.from("landing_page_visits").insert({
      visitor_id: visitorId,
      page_path: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error tracking landing visit:", error);
  }
}

// Function to mark a conversion
export async function markConversion() {
  try {
    const visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) return;

    const { error } = await supabase
      .from("landing_page_visits")
      .update({ converted: true, converted_at: new Date().toISOString() })
      .eq("visitor_id", visitorId)
      .eq("converted", false);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking conversion:", error);
  }
}
