import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["user-notifications", user?.id];

  const { data: notifications = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 min — realtime mantém novas notificações atualizado
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<AppNotification[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return [];
      return (data || []) as AppNotification[];
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Realtime — atualiza cache localmente, sem refetch ao banco
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`user-notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          queryClient.setQueryData<AppNotification[]>(queryKey, (prev = []) => [
            newNotif,
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("user_notifications")
      .update({ is_read: true, read_at: new Date().toISOString() } as never)
      .eq("id", notificationId);

    if (!error) {
      queryClient.setQueryData<AppNotification[]>(queryKey, (prev = []) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("user_notifications")
      .update({ is_read: true, read_at: new Date().toISOString() } as never)
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (!error) {
      queryClient.setQueryData<AppNotification[]>(queryKey, (prev = []) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch };
}
