import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const DAYS_BEFORE_FIRST_NPS = 7; // 7 dias após cadastro para primeira pesquisa
const DAYS_BETWEEN_NPS = 90; // 3 meses (90 dias) entre pesquisas
const LOCAL_STORAGE_KEY = "nps_last_shown";

export function useNPSSurvey() {
  const { user } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    checkShouldShowNPS();
  }, [user]);

  const checkShouldShowNPS = async () => {
    try {
      // Verifica quando foi a última vez que mostrou
      const lastShown = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (lastShown) {
        const daysSinceLastShown = Math.floor(
          (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24)
        );

        // Se não passou 3 meses, não mostra
        if (daysSinceLastShown < DAYS_BETWEEN_NPS) {
          setShouldShow(false);
          setLoading(false);
          return;
        }
      }

      // Busca última resposta do usuário
      const { data: lastResponse, error: responseError } = await supabase
        .from("nps_responses")
        .select("created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (responseError && responseError.code !== "PGRST116") {
        throw responseError;
      }

      // Se já respondeu alguma vez
      if (lastResponse) {
        const lastResponseDate = new Date(lastResponse.created_at);
        const daysSinceLastResponse = Math.floor(
          (Date.now() - lastResponseDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Mostra novamente após 3 meses
        if (daysSinceLastResponse >= DAYS_BETWEEN_NPS) {
          setShouldShow(true);
        } else {
          setShouldShow(false);
        }
      } else {
        // Primeira vez: verifica há quantos dias o usuário se cadastrou
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("id", user!.id)
          .single();

        if (profileError) throw profileError;

        if (profile?.created_at) {
          const createdDate = new Date(profile.created_at);
          const daysSinceCreation = Math.floor(
            (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Mostra NPS após 7 dias do cadastro
          if (daysSinceCreation >= DAYS_BEFORE_FIRST_NPS) {
            setShouldShow(true);
          } else {
            setShouldShow(false);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar NPS:", error);
      setShouldShow(false);
    } finally {
      setLoading(false);
    }
  };

  const markAsShown = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
    setShouldShow(false);
  };

  return {
    shouldShow,
    loading,
    markAsShown,
  };
}
