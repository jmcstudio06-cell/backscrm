import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/useWorkspace";

/** Blocks routes that only the account holder (app owner) may access. */
export function RequireOwner({ children }: { children: ReactNode }) {
  const { isMember, loading } = useWorkspace();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isMember) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
