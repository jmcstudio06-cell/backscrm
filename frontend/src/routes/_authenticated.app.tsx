import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { apiFetch, getStoredUser, type User } from "@/lib/api";
import { Calendar, CreditCard, Mail, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Minha conta — Backs ZapCRM" }] }),
  component: AppPage,
});

function statusBadge(status?: string) {
  if (status === "active") return <Badge className="bg-success text-success-foreground">Ativa</Badge>;
  if (status === "trial") return <Badge className="bg-warning text-warning-foreground">Trial</Badge>;
  if (status === "expired") return <Badge variant="destructive">Expirada</Badge>;
  return <Badge variant="secondary">Indefinida</Badge>;
}

function AppPage() {
  const stored = getStoredUser();
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<{ user: User } | User>("/api/auth/me").catch(() => null),
  });
  const me: User | null =
    (data && "user" in (data as any) ? (data as any).user : (data as User)) || stored;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Minha conta</h1>
          <p className="text-muted-foreground">Acompanhe sua licença e dados de acesso.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" /> E-mail
            </div>
            <p className="font-medium">{me?.email ?? "—"}</p>
          </Card>

          <Card className="p-6">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" /> Plano
            </div>
            <p className="font-medium capitalize">{me?.plan ?? "Sem plano"}</p>
            <div className="mt-3">{statusBadge(me?.status)}</div>
          </Card>

          <Card className="p-6">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> Validade
            </div>
            <p className="font-medium">
              {me?.expiresAt ? new Date(me.expiresAt).toLocaleDateString("pt-BR") : "—"}
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Download className="h-4 w-4" /> Extensão Chrome
            </div>
            <p className="text-sm text-muted-foreground">
              Instale a extensão e faça login com o mesmo e-mail.
            </p>
            <Button asChild className="mt-3 bg-gradient-brand text-cyan hover:opacity-90">
              <a href="#" rel="noreferrer">Baixar extensão</a>
            </Button>
          </Card>
        </div>

        {isLoading && <p className="mt-6 text-sm text-muted-foreground">Atualizando dados…</p>}

        <Card className="mt-8 p-6">
          <h2 className="font-display text-lg font-semibold">Precisa fazer upgrade?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Conheça os planos e libere todos os recursos.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/" hash="planos">Ver planos</Link>
          </Button>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}

