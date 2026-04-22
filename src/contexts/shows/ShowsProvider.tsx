import type { ReactNode } from "react";
import { useShowsData } from "@/hooks/useShows";
import { ShowsContext, type ShowsContextType } from "./ShowsContext";

export function ShowsProvider({ children }: { children: ReactNode }) {
  const {
    shows,
    loading,
    addShow,
    updateShow,
    deleteShow,
    cancelShow,
    getConfirmedShows,
    getCompletedShows,
  } = useShowsData();

  const value: ShowsContextType = {
    shows,
    loading,
    addShow,
    updateShow,
    deleteShow,
    cancelShow,
    getConfirmedShows,
    getCompletedShows,
    refetch,
  };

  return <ShowsContext.Provider value={value}>{children}</ShowsContext.Provider>;
}
