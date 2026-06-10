import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { apiFetch, showApiError, type User, type Plan, type LicenseStatus } from "@/lib/api";
import { toast } from "sonner";
import { Search, Users, CheckCircle2, AlertCircle, Clock, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({ meta: [{ title: "Painel Admin — Backs ZapCRM" }] }),
  component: AdminDashboard,
});

function statusBadge(s?: string) {
  if (s === "active") return <Badge className="bg-success text-success-foreground">Ativa</Badge>;
  if (s === "trial") return <Badge className="bg-warning text-warning-foreground">Trial</Badge>;
  if (s === "expired") return <Badge variant="destructive">Expirada</Badge>;
  return <Badge variant="secondary">—</Badge>;
}

const PLAN_PRICE: Record<string, number> = { mensal: 49.9, trimestral: 129.9, anual: 399.9 };

function AdminDashboard() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [editing, setEditing] = useState<User | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await apiFetch<{ success: boolean; users: User[] }>("/api/admin/users");
      return res.users ?? [];
    },
  });

  const users: User[] = data ?? [];

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (planFilter !== "all" && u.plan !== planFilter) return false;
      return true;
    });
  }, [users, search, statusFilter, planFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const expired = users.filter((u) => u.status === "expired").length;
    const trial = users.filter((u) => u.status === "trial").length;
    const revenue = users
      .filter((u) => u.status === "active" && u.plan)
      .reduce((sum, u) => sum + (PLAN_PRICE[u.plan as string] ?? 0), 0);
    return { total, active, expired, trial, revenue };
  }, [users]);

  const updateMut = useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<User> }) => {
      await apiFetch(`/api/admin/users/${vars.id}`, { method: "PATCH", body: JSON.stringify(vars.patch) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário atualizado");
      setEditing(null);
    },
    onError: (e) => showApiError(e, "Falha ao atualizar"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário removido");
    },
    onError: (e) => showApiError(e, "Falha ao remover"),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie clientes, licenças e planos.</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard icon={Users} label="Total" value={stats.total} tint="cyan" />
          <KpiCard icon={CheckCircle2} label="Ativas" value={stats.active} tint="success" />
          <KpiCard icon={Clock} label="Trial" value={stats.trial} tint="warning" />
          <KpiCard icon={AlertCircle} label="Expiradas" value={stats.expired} tint="destructive" />
          <KpiCard label="Receita ativa" value={`R$ ${stats.revenue.toFixed(2)}`} tint="cyan" />
        </div>

        <Tabs defaultValue="clientes" className="mt-8">
          <TabsList>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="licencas">Licenças</TabsTrigger>
            <TabsTrigger value="planos">Planos</TabsTrigger>
          </TabsList>

          <TabsContent value="clientes" className="mt-6">
            <Card className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Buscar por e-mail..."
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos status</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expirada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="sm:w-40"><SelectValue placeholder="Plano" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos planos</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-3 py-2 font-medium">E-mail</th>
                      <th className="px-3 py-2 font-medium">Plano</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Validade</th>
                      <th className="px-3 py-2 font-medium">Cadastro</th>
                      <th className="px-3 py-2 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Carregando...</td></tr>
                    )}
                    {error && (
                      <tr><td colSpan={6} className="px-3 py-8 text-center text-destructive">
                        Não foi possível carregar usuários. Verifique se o endpoint /api/admin/users está disponível.
                      </td></tr>
                    )}
                    {!isLoading && !error && filtered.length === 0 && (
                      <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>
                    )}
                    {filtered.map((u) => {
                      const id = u.id ?? u._id ?? u.email;
                      return (
                        <tr key={id} className="border-b last:border-0 hover:bg-muted/40">
                          <td className="px-3 py-2.5 font-medium">{u.email}</td>
                          <td className="px-3 py-2.5 capitalize">{u.plan ?? "—"}</td>
                          <td className="px-3 py-2.5">{statusBadge(u.status)}</td>
                          <td className="px-3 py-2.5">{u.expiresAt ? new Date(u.expiresAt).toLocaleDateString("pt-BR") : "—"}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "—"}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" onClick={() => setEditing(u)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => {
                                if (confirm(`Remover ${u.email}?`)) deleteMut.mutate(String(id));
                              }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="licencas" className="mt-6">
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold">Resumo de licenças</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <SummaryRow label="Ativas" value={stats.active} />
                <SummaryRow label="Em trial" value={stats.trial} />
                <SummaryRow label="Expiradas" value={stats.expired} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="planos" className="mt-6">
            <div className="grid gap-4 md:grid-cols-3">
              {(["mensal", "trimestral", "anual"] as const).map((p) => (
                <Card key={p} className="p-6">
                  <h3 className="font-display text-lg font-semibold capitalize">{p}</h3>
                  <p className="mt-1 text-2xl font-bold">R$ {PLAN_PRICE[p].toFixed(2)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {users.filter((u) => u.plan === p && u.status === "active").length} assinantes ativos
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />

      <EditDialog
        user={editing}
        onClose={() => setEditing(null)}
        onSave={(patch) => editing && updateMut.mutate({ id: String(editing.id ?? editing._id), patch })}
        saving={updateMut.isPending}
      />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tint }: { icon?: any; label: string; value: string | number; tint: string }) {
  const tintMap: Record<string, string> = {
    cyan: "bg-cyan/10 text-cyan",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tintMap[tint]}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function EditDialog({ user, onClose, onSave, saving }: {
  user: User | null;
  onClose: () => void;
  onSave: (patch: Partial<User>) => void;
  saving: boolean;
}) {
  const [plan, setPlan] = useState<Plan>(user?.plan ?? null);
  const [status, setStatus] = useState<LicenseStatus | undefined>(user?.status);
  const [expiresAt, setExpiresAt] = useState<string>(user?.expiresAt?.slice(0, 10) ?? "");

  // sync on open
  useMemo(() => {
    if (user) {
      setPlan(user.plan ?? null);
      setStatus(user.status);
      setExpiresAt(user.expiresAt?.slice(0, 10) ?? "");
    }
  }, [user]);

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input value={user.email} disabled className="mt-1" />
            </div>
            <div>
              <Label>Plano</Label>
              <Select value={plan ?? "none"} onValueChange={(v) => setPlan(v === "none" ? null : (v as Plan))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem plano</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status ?? ""} onValueChange={(v) => setStatus(v as LicenseStatus)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expirada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="exp">Validade</Label>
              <Input id="exp" type="date" className="mt-1"
                value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            className="bg-gradient-brand text-cyan hover:opacity-90"
            disabled={saving}
            onClick={() => onSave({ plan, status, expiresAt: expiresAt || null })}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

