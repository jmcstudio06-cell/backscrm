import { ReactNode } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";

/** Renders children only when the current session may perform the action.
 *  Account holders always can; team members depend on their permission level. */
export function Can({
  action,
  children,
  fallback = null,
}: {
  action: "create" | "edit" | "delete";
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = useWorkspace();
  return <>{can(action) ? children : fallback}</>;
}
