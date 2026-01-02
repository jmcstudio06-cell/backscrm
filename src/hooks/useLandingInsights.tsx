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
      // Otimização: Buscar apenas dos últimos 30 dias e limitar a 500 registros
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from("landing_page_visits")
        .select("id, created_at, converted")
        .gte("created_at", monthAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      const visitsData = data || [];
      setVisits(visitsData as LandingVisit[]);

      // Calculate insights
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalVisits = visitsData.length;
      const conversions = visitsData.filter(v => v.converted).length;

      const todayVisits = visitsData.filter(v => new Date(v.created_at) >= today).length;
      const todayConversions = visitsData.filter(v => v.converted && new Date(v.created_at) >= today).length;

      const weekVisits = visitsData.filter(v => new Date(v.created_at) >= weekAgo).length;
      const weekConversions = visitsData.filter(v => v.converted && new Date(v.created_at) >= weekAgo).length;

      setInsights({
        totalVisits,
        conversions,
        conversionRate: totalVisits > 0 ? (conversions / totalVisits) * 100 : 0,
        todayVisits,
        todayConversions,
        weekVisits,
        weekConversions,
        monthVisits: totalVisits,
        monthConversions: conversions,
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
    
    if (!visitorId) {
      console.log("markConversion: No visitor_id found in localStorage");
      return;
    }

    console.log("markConversion: Attempting to mark conversion for visitor:", visitorId);

    // Primeiro, verificar se existe um registro para este visitante
    const { data: existingVisit, error: checkError } = await supabase
      .from("landing_page_visits")
      .select("id, converted")
      .eq("visitor_id", visitorId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (checkError) {
      console.log("markConversion: No existing visit found for this visitor_id");
      // Se não existe visita, criar uma nova já convertida
      const { error: insertError } = await supabase.from("landing_page_visits").insert({
        visitor_id: visitorId,
        page_path: "/auth",
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        converted: true,
        converted_at: new Date().toISOString(),
      });
      
      if (insertError) {
        console.error("markConversion: Error creating converted visit:", insertError);
      } else {
        console.log("markConversion: Created new converted visit");
      }
      return;
    }

    if (existingVisit.converted) {
      console.log("markConversion: Visit already converted");
      return;
    }

    // Atualizar o registro existente
    const { error: updateError } = await supabase
      .from("landing_page_visits")
      .update({ converted: true, converted_at: new Date().toISOString() })
      .eq("id", existingVisit.id);

    if (updateError) {
      console.error("markConversion: Error updating visit:", updateError);
    } else {
      console.log("markConversion: Successfully marked conversion for visit:", existingVisit.id);
    }
  } catch (error) {
    console.error("Error marking conversion:", error);
  }
}
