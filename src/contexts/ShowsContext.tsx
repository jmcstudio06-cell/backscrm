import { createContext, useContext, ReactNode } from "react";
import { useShowsData, Show } from "@/hooks/useShows";

export type { Show };

export interface ShowTask {
  id: string;
  text: string;
  completed: boolean;
}

interface ShowsContextType {
  shows: Show[];
  loading: boolean;
  addShow: (show: Partial<Show>) => Promise<Show | undefined>;
  updateShow: (id: string, updates: Partial<Show>) => Promise<Show | undefined>;
  deleteShow: (id: string) => Promise<void>;
  cancelShow: (id: string) => Promise<void>;
  getConfirmedShows: () => Show[];
}

const ShowsContext = createContext<ShowsContextType | undefined>(undefined);

export function ShowsProvider({ children }: { children: ReactNode }) {
  const { shows, loading, addShow, updateShow, deleteShow, cancelShow, getConfirmedShows } = useShowsData();

  return (
    <ShowsContext.Provider value={{
      shows,
      loading,
      addShow,
      updateShow,
      deleteShow,
      cancelShow,
      getConfirmedShows,
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
