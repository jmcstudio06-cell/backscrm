import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getToken, getStoredUser } from "@/lib/api";

function decodeRole(token: string | null): string | undefined {
  if (!token) return;
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json).role;
  } catch { return; }
}

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: () => {
    const token = getToken();
    const user = getStoredUser();
    if (!token) throw redirect({ to: "/login" });
    const role = user?.role ?? decodeRole(token);
    if (role !== "admin") throw redirect({ to: "/app" });
  },
  component: () => <Outlet />,
});

