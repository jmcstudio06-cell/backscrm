import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-cyan">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold">Backs ZapCRM</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Backs ZapCRM. Transforme conversas em vendas.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/login" className="hover:text-foreground">Entrar</Link>
          <Link to="/cadastro" className="hover:text-foreground">Cadastrar</Link>
        </div>
      </div>
    </footer>
  );
}

