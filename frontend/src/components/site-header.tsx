import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Zap, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";

export function SiteHeader() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-cyan">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Backs <span className="text-gradient-brand">ZapCRM</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="/#recursos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Recursos</a>
          <a href="/#como-funciona" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Como funciona</a>
          <a href="/#planos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Planos</a>
          <a href="/#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
                  <LayoutDashboard className="mr-1.5 h-4 w-4" /> Painel
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/app" })}>
                <UserIcon className="mr-1.5 h-4 w-4" /> {user?.email?.split("@")[0]}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { logout(); navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>Entrar</Button>
              <Button size="sm" className="bg-gradient-brand text-cyan hover:opacity-90" onClick={() => navigate({ to: "/cadastro" })}>
                Começar grátis
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

