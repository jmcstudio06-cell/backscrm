import { createContext, useContext, ReactNode } from "react";
import { useShowsData, Show } from "@/hooks/useShows";

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

interface ShowsContextType {
  shows: Show[];
  loading: boolean;
  addShow: (show: Partial<Show>, musicians?: ShowMusician[], expenses?: ShowExpense[], checklistTemplateId?: string) => Promise<Show | undefined>;
  updateShow: (id: string, updates: Partial<Show>, musicians?: ShowMusician[], expenses?: ShowExpense[]) => Promise<Show | undefined>;
  deleteShow: (id: string) => Promise<void>;
  cancelShow: (id: string) => Promise<void>;
  getConfirmedShows: () => Show[];
  getCompletedShows: () => Show[];
}

const ShowsContext = createContext<ShowsContextType | undefined>(undefined);

export function ShowsProvider({ children }: { children: ReactNode }) {
  const { shows, loading, addShow, updateShow, deleteShow, cancelShow, getConfirmedShows, getCompletedShows } = useShowsData();

  return (
    <ShowsContext.Provider value={{
      shows,
      loading,
      addShow,
      updateShow,
      deleteShow,
      cancelShow,
      getConfirmedShows,
      getCompletedShows,
    }}>
      {children}
    </ShowsContext.Provider>
  );
}

export function useShows() {
  const context = useContext(ShowsContext);
  if (context === undefined) {
    throw new Error("useShows must be used within a ShowsProvider");
  }
  return context;
}
