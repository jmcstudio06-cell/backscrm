import { useState, useEffect, createContext, useContext, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = (nextSession: Session | null) => {
      if (!isMounted) return;
      const nextUserId = nextSession?.user?.id ?? null;

      // SECURITY: se o usuário autenticado mudou (login, logout, troca de conta),
      // limpa TODO o cache do react-query para nunca exibir dados do usuário anterior.
      if (lastUserIdRef.current !== null && lastUserIdRef.current !== nextUserId) {
        queryClient.clear();
      }
      lastUserIdRef.current = nextUserId;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      handleAuthChange(nextSession);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!isMounted) return;
        if (lastUserIdRef.current === null) {
          lastUserIdRef.current = currentSession?.user?.id ?? null;
        }
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      })
      .catch((err) => {
        console.error("Erro ao buscar sessão:", err);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      // SECURITY: limpa cache e estado local antes de redirecionar para garantir
      // que nenhum dado do usuário anterior fique acessível na máquina compartilhada.
      queryClient.clear();
      try {
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("financial_mode_") ||
            key.startsWith("checklist_local_") ||
            key.startsWith("sidebar_badge_seen_")
          ) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        /* noop */
      }
      window.location.href = "/";
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
  };

  return <AuthContext.Provider value={{ user, session, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user === null) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  return { user, loading };
}
