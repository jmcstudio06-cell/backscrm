const SHOW_STATUS_ALIASES: Record<string, string> = {
  confirmado: "confirmed",
  confirmed: "confirmed",
  pendente: "pending",
  pending: "pending",
  agendado: "scheduled",
  scheduled: "scheduled",
  negociacao: "negotiation",
  negociação: "negotiation",
  negotiation: "negotiation",
  realizado: "completed",
  finalizado: "completed",
  completed: "completed",
  parcial: "partial",
  partial: "partial",
  cancelado: "cancelled",
  cancelled: "cancelled",
};

export function normalizeShowStatus(status: string | null | undefined): string {
  if (!status) return "scheduled";
  const normalizedKey = status.trim().toLowerCase();
  return SHOW_STATUS_ALIASES[normalizedKey] || normalizedKey;
}

export const isCompletedShowStatus = (status: string | null | undefined) =>
  normalizeShowStatus(status) === "completed";

export const isProjectedShowStatus = (status: string | null | undefined) => {
  const normalized = normalizeShowStatus(status);
  return (
    normalized === "confirmed" ||
    normalized === "pending" ||
    normalized === "scheduled" ||
    normalized === "negotiation" ||
    normalized === "partial"
  );
};

export const isCancelledShowStatus = (status: string | null | undefined) =>
  normalizeShowStatus(status) === "cancelled";

export const isFinancialShowStatus = (status: string | null | undefined) => {
  const normalized = normalizeShowStatus(status);
  return normalized === "completed" || normalized === "partial";
};
