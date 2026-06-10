import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getToken, getStoredUser } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    const token = getToken();
    const user = getStoredUser();
    if (!token || !user) throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});

