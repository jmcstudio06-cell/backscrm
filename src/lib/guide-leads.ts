import { supabase } from "@/integrations/supabase/client";

type GuideLeadInsert = {
  name: string;
  phone: string;
  city?: string;
  shows_per_month?: string;
  source?: string;
};

function isMissingSourceColumnError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("source") && (
    normalized.includes("column") ||
    normalized.includes("schema cache") ||
    normalized.includes("could not find")
  );
}

export async function insertGuideLeadWithFallback(payload: GuideLeadInsert) {
  const { error } = await supabase.from("guide_leads").insert(payload);

  if (!error) return;

  if (!payload.source || !isMissingSourceColumnError(error.message)) {
    throw error;
  }

  const { source: _source, ...legacyPayload } = payload;
  const fallbackResult = await supabase.from("guide_leads").insert(legacyPayload);

  if (fallbackResult.error) {
    throw fallbackResult.error;
  }
}
