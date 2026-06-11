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

// #region debug-point E:debug-reporter
const debugReport = (hypothesisId: string, msg: string, data: Record<string, unknown>) =>
  fetch("http://127.0.0.1:7777/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "planilha-liberar-erro",
      runId: "pre-fix",
      hypothesisId,
      location: "src/lib/guide-leads.ts",
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
// #endregion

export async function insertGuideLeadWithFallback(payload: GuideLeadInsert) {
  const { error } = await supabase.from("guide_leads").insert(payload);
  // #region debug-point E:first-insert-result
  debugReport("E", "resultado do primeiro insert", {
    hasError: !!error,
    errorMessage:
      error && typeof error === "object" && "message" in error ? String(error.message) : null,
    errorCode:
      error && typeof error === "object" && "code" in error ? String(error.code) : null,
    errorDetails:
      error && typeof error === "object" && "details" in error ? String(error.details) : null,
    errorHint:
      error && typeof error === "object" && "hint" in error ? String(error.hint) : null,
  });
  // #endregion

  if (!error) return;

  if (!payload.source || !isMissingSourceColumnError(error.message)) {
    // #region debug-point F:fallback-skipped
    debugReport("F", "fallback nao aplicado", {
      hasSource: !!payload.source,
      errorMessage: error.message,
      errorCode: "code" in error ? String(error.code) : null,
    });
    // #endregion
    throw error;
  }

  const { source: _source, ...legacyPayload } = payload;
  const fallbackResult = await supabase.from("guide_leads").insert(legacyPayload);
  // #region debug-point G:fallback-result
  debugReport("G", "resultado do fallback", {
    hasError: !!fallbackResult.error,
    errorMessage:
      fallbackResult.error &&
      typeof fallbackResult.error === "object" &&
      "message" in fallbackResult.error
        ? String(fallbackResult.error.message)
        : null,
    payloadKeys: Object.keys(legacyPayload),
  });
  // #endregion

  if (fallbackResult.error) {
    throw fallbackResult.error;
  }
}
