import { createContext, useContext, useState, ReactNode } from "react";

export interface ShowTask {
  id: number;
  text: string;
  completed: boolean;
}

export interface Show {
  id: number;
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  value: number;
  status: string;
  client: string;
  type: string;
  tasks: ShowTask[];
}

const defaultTasks: ShowTask[] = [
  { id: 1, text: "Confirmar equipe", completed: false },
  { id: 2, text: "Verificar equipamentos", completed: false },
  { id: 3, text: "Preparar setlist", completed: false },
  { id: 4, text: "Contatar cliente", completed: false },
  { id: 5, text: "Checar transporte", completed: false },
];

const initialShows: Show[] = [
  {
    id: 1,
    name: "Casamento Silva & Santos",
    date: "2024-12-15",
    time: "19:00",
    venue: "Espaço Verde Garden",
    address: "Rua das Flores, 123 - SP",
    value: 8500,
    status: "confirmed",
    client: "Maria Silva",
    type: "Casamento",
    tasks: [
      { id: 1, text: "Confirmar equipe", completed: true },
      { id: 2, text: "Verificar equipamentos", completed: true },
      { id: 3, text: "Preparar setlist", completed: true },
      { id: 4, text: "Contatar cliente", completed: false },
      { id: 5, text: "Checar transporte", completed: false },
    ],
  },
  {
    id: 2,
    name: "Festa Corporativa TechCorp",
    date: "2024-12-18",
    time: "20:00",
    venue: "Hotel Marriott",
    address: "Av. Paulista, 1000 - SP",
    value: 12000,
    status: "confirmed",
    client: "João Mendes",
    type: "Corporativo",
    tasks: [
      { id: 1, text: "Confirmar equipe", completed: true },
      { id: 2, text: "Verificar equipamentos", completed: true },
      { id: 3, text: "Preparar setlist", completed: true },
      { id: 4, text: "Contatar cliente", completed: true },
      { id: 5, text: "Checar transporte", completed: true },
    ],
  },
  {
    id: 3,
    name: "Aniversário 50 anos",
    date: "2024-12-22",
    time: "21:00",
    venue: "Clube Municipal",
    address: "Rua do Clube, 500 - SP",
    value: 6800,
    status: "pending",
    client: "Carlos Oliveira",
    type: "Aniversário",
    tasks: defaultTasks.map(t => ({ ...t })),
  },
  {
    id: 4,
    name: "Formatura Medicina USP",
    date: "2024-12-28",
    time: "22:00",
    venue: "Buffet Elegance",
    address: "Av. Brasil, 2000 - SP",
    value: 15000,
    status: "negotiation",
    client: "Ana Paula Costa",
    type: "Formatura",
    tasks: [
      { id: 1, text: "Confirmar equipe", completed: true },
      { id: 2, text: "Verificar equipamentos", completed: true },
      { id: 3, text: "Preparar setlist", completed: false },
      { id: 4, text: "Contatar cliente", completed: false },
      { id: 5, text: "Checar transporte", completed: false },
    ],
  },
];

interface ShowsContextType {
  shows: Show[];
  addShow: (show: Omit<Show, 'id' | 'tasks'>) => void;
  updateShow: (id: number, updates: Partial<Show>) => void;
  deleteShow: (id: number) => void;
  cancelShow: (id: number) => void;
  getConfirmedShows: () => Show[];
  updateShowTask: (showId: number, taskId: number, completed: boolean) => void;
  addShowTask: (showId: number, taskText: string) => void;
  deleteShowTask: (showId: number, taskId: number) => void;
}

const ShowsContext = createContext<ShowsContextType | undefined>(undefined);

export function ShowsProvider({ children }: { children: ReactNode }) {
  const [shows, setShows] = useState<Show[]>(initialShows);

  const addShow = (showData: Omit<Show, 'id' | 'tasks'>) => {
    const newShow: Show = {
      ...showData,
      id: Math.max(0, ...shows.map(s => s.id)) + 1,
      tasks: defaultTasks.map((t, idx) => ({ ...t, id: idx + 1 })),
    };
    setShows([...shows, newShow]);
  };

  const updateShow = (id: number, updates: Partial<Show>) => {
    setShows(shows.map(show => 
      show.id === id ? { ...show, ...updates } : show
    ));
  };

  const deleteShow = (id: number) => {
    setShows(shows.filter(show => show.id !== id));
  };

  const cancelShow = (id: number) => {
    setShows(shows.map(show => 
      show.id === id ? { ...show, status: "cancelled" } : show
    ));
  };

  const getConfirmedShows = () => {
    return shows.filter(show => show.status === "confirmed");
  };

  const updateShowTask = (showId: number, taskId: number, completed: boolean) => {
    setShows(shows.map(show => {
      if (show.id === showId) {
        const updatedTasks = show.tasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        );
        return { ...show, tasks: updatedTasks };
      }
      return show;
    }));
  };

  const addShowTask = (showId: number, taskText: string) => {
    setShows(shows.map(show => {
      if (show.id === showId) {
        const newTaskId = Math.max(0, ...show.tasks.map(t => t.id)) + 1;
        return { 
          ...show, 
          tasks: [...show.tasks, { id: newTaskId, text: taskText, completed: false }] 
        };
      }
      return show;
    }));
  };

  const deleteShowTask = (showId: number, taskId: number) => {
    setShows(shows.map(show => {
      if (show.id === showId) {
        return { ...show, tasks: show.tasks.filter(t => t.id !== taskId) };
      }
      return show;
    }));
  };

  return (
    <ShowsContext.Provider value={{
      shows,
      addShow,
      updateShow,
      deleteShow,
      cancelShow,
      getConfirmedShows,
      updateShowTask,
      addShowTask,
      deleteShowTask,
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