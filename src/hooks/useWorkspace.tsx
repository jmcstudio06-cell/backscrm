import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PermissionLevel = "viewer" | "editor" | "manager";

export interface WorkspaceMembership {
  id: string;
  owner_id: string;
  member_user_id: string;
  email: string;
  role_label: string | null;
  permission_level: PermissionLevel;
  allowed_features: string[];
  is_active: boolean;
  created_at: string;
}

interface WorkspaceContextValue {
  /** Owner of the data the current session should read/write (self, or the owner who invited the member). */
  ownerId: string | null;
  isMember: boolean;
  isOwner: boolean;
  membership: WorkspaceMembership | null;
  permissionLevel: PermissionLevel | null;
  roleLabel: string | null;
  allowedFeatures: string[] | null;
  loading: boolean;
  can: (action: "create" | "edit" | "delete") => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const { data: membership = null, isLoading } = useQuery({
    queryKey: ["workspace-membership", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("member_user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        allowed_features: Array.isArray(data.allowed_features) ? (data.allowed_features as string[]) : [],
      } as WorkspaceMembership;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const activeMembership = membership?.is_active ? membership : null;
  const isMember = !!activeMembership;
  const level = activeMembership?.permission_level ?? null;

  const can = (action: "create" | "edit" | "delete") => {
    if (!isMember) return true;
    if (level === "manager") return true;
    if (level === "editor") return action !== "delete";
    return false;
  };

  const value: WorkspaceContextValue = {
    ownerId: user ? (activeMembership?.owner_id ?? user.id) : null,
    isMember,
    isOwner: !!user && !isMember,
    membership: activeMembership,
    permissionLevel: level,
    roleLabel: activeMembership?.role_label ?? null,
    allowedFeatures: activeMembership?.allowed_features ?? null,
    loading: !!user && isLoading,
    can,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    // Safe fallback for trees rendered outside the provider (public pages).
    return {
      ownerId: null,
      isMember: false,
      isOwner: true,
      membership: null,
      permissionLevel: null,
      roleLabel: null,
      allowedFeatures: null,
      loading: false,
      can: () => true,
    };
  }
  return ctx;
}

/** Convenience: the user id that owns the data of the current session. */
export function useOwnerId() {
  return useWorkspace().ownerId;
}
