import { createContext, useContext } from "react";
import type { Show } from "@/hooks/useShows";

export type { Show };

export interface ShowTask {
  id: string;
  text: string;
  completed: boolean;
}

interface ShowMusician {
  musicianId: string;
  name: string;
  fee: number;
}

interface ShowExpense {
  id: string;
  description: string;
  category: string;
  value: number;
}

export interface ShowsContextType {
  shows: Show[];
  loading: boolean;
  addShow: (
    show: Partial<Show>,
    musicians?: ShowMusician[],
    expenses?: ShowExpense[],
    checklistTemplateId?: string,
    userPlan?: string | null,
    advanceAmount?: number
  ) => Promise<Show | undefined>;
  updateShow: (
    id: string,
    updates: Partial<Show>,
    musicians?: ShowMusician[],
    expenses?: ShowExpense[]
  ) => Promise<Show | undefined>;
  deleteShow: (id: string) => Promise<void>;
  cancelShow: (id: string) => Promise<void>;
  getConfirmedShows: () => Show[];
  getCompletedShows: () => Show[];
  refetch: () => Promise<void>;
}

export const ShowsContext = createContext<ShowsContextType | null>(null);

export function useShows() {
  const context = useContext(ShowsContext);
  if (context === null) {
    throw new Error("useShows must be used within a ShowsProvider");
  }
  return context;
}
