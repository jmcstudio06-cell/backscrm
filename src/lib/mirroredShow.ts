import type { Show } from "@/hooks/useShows";

/** A new date starts unpaid, using the same status as the show's Pendente option. */
export function prepareMirroredShow(show: Partial<Show>): Partial<Show> {
  return {
    ...show,
    status: "confirmed",
    advance_amount: 0,
    advance_received_date: null,
    balance_due_date: null,
  };
}