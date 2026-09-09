import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { toast } from "sonner";
import {
  UsersRound,
  Plus,
  Trash2,
  Pencil,
  Lock,
  Eye,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { PermissionLevel, WorkspaceMembership } from "@/hooks/useWorkspace";

const FREE_LIMIT = 1;

const FEATURE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  agenda: "Agenda de Shows",
  crm: "CRM do Artista",
  clientes: "Clientes",
  orcamentos: "Orçamento Automático",
  servicos: "Serviços e Produtos",
  contratos: "Contrato Automático",
  "assinatura-digital": "Assinatura Digital",
  financeiro: "Resumo Mensal",
  historico: "Histórico Completo",
  precificacao: "Precificação",
  checklist: "Checklist / Avanços",
  "mapeamento-palco": "Mapeamento de Palco",
  equipe: "Banda & Músicos",
  metas: "Metas Comerciais",
  "metas-anuais": "Meta Anual",
  repertorio: "Repertório",
  cobrancas: "Cobranças",
  tutoriais: "Tutoriais",
  "ideias-post": "Planejamento de Conteúdo",
  "link-agenda": "Link Agenda",
  "link-instagram": "Link da bio",
  "link-orcamento": "Link Orçamento",
  ranking: "Ranking & Selos",
};

const LEVELS: { value: PermissionLevel; label: string; description: string; icon: React.ElementType }[] = [
  { value: "viewer", label: "Visualizador", description: "Apenas visualiza as informações", icon: Eye },
  { value: "editor", label: "Editor", description: "Visualiza, cria e edita (não apaga)", icon: PencilLine },
  { value: "manager", label: "Gerente", description: "Visualiza, cria, edita e apaga", icon: ShieldCheck },
];

interface FormState {
  email: string;
  password: string;
  role_label: string;
  permission_level: PermissionLevel;
  allowed_features: string[];
}

const emptyForm: FormState = {
  email: "",
  password: "",
  role_label: "",
  permission_level: "viewer",
  allowed_features: ["dashboard"],
};

export default function Usuarios() {
  const { user } = useAuth();
  const { blocks, loading: blocksLoading } = useFeatureBlocks();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkspaceMembership | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const availableFeatures = useMemo(
    () =>
      blocks
        .filter((b) => !b.blocked && FEATURE_LABELS[b.feature_key])
        .map((b) => b.feature_key)
        .sort((a, b) => FEATURE_LABELS[a].localeCompare(FEATURE_LABELS[b], "pt-BR")),
    [blocks],
  );

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["workspace-members", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []).map((m) => ({
        ...m,
        allowed_features: Array.isArray(m.allowed_features) ? (m.allowed_features as string[]) : [],
      })) as WorkspaceMembership[];
    },
    enabled: !!user,
  });

  const limitReached = members.length >= FREE_LIMIT;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (member: WorkspaceMembership) => {
    setEditing(member);
    setForm({
      email: member.email,
      password: "",
      role_label: member.role_label ?? "",
      permission_level: member.permission_level,
      allowed_features: member.allowed_features,
    });
    setDialogOpen(true);
  };

  const toggleFeature = (key: string) => {
    setForm((prev) => ({
      ...prev,
      allowed_features: prev.allowed_features.includes(key)
        ? prev.allowed_features.filter((f) => f !== key)
        : [...prev.allowed_features, key],
    }));
  };

  const invoke = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("workspace-members", { body });
    if (error) {
      let message = error.message;
      try {
        const ctx = (error as unknown as { context?: Response }).context;
        if (ctx) {
          const parsed = await ctx.json();
          message = parsed.message || parsed.error || message;
        }
      } catch {
        /* noop */
      }
      throw new Error(message);
    }
    if (data?.error) throw new Error(data.message || data.error);
    return data;
  };

  const handleSave = async () => {
    if (form.allowed_features.length === 0) {
      toast.error("Libere ao menos uma aba para o usuário");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await invoke({
          action: "update",
          id: editing.id,
          role_label: form.role_label,
          permission_level: form.permission_level,
          allowed_features: form.allowed_features,
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success("Usuário atualizado!");
      } else {
        await invoke({
          action: "create",
          email: form.email,
          password: form.password,
          role_label: form.role_label,
          permission_level: form.permission_level,
          allowed_features: form.allowed_features,
        });
        toast.success("Usuário criado! Já pode entrar com o e-mail e senha.");
      }
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (member: WorkspaceMembership, active: boolean) => {
    try {
      await invoke({ action: "update", id: member.id, is_active: active });
      queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  const handleDelete = async (member: WorkspaceMembership) => {
    if (!confirm(`Excluir o acesso de ${member.email}? Esta ação não pode ser desfeita.`)) return;
    try {
      await invoke({ action: "delete", id: member.id });
      toast.success("Usuário removido");
      queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    }
  };

  return (
    <Layout title="Usuários">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UsersRound className="w-6 h-6 text-primary" />
              Usuários
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dê acesso para a sua equipe com função e permissões definidas por você.
            </p>
          </div>
          <Button onClick={openCreate} disabled={limitReached}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar usuário
          </Button>
        </div>

        {isLoading || blocksLoading ? (
          <Card>
            <CardContent className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </CardContent>
          </Card>
        ) : members.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-3">
              <UsersRound className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-medium">Nenhum usuário cadastrado</p>
              <p className="text-sm text-muted-foreground">
                Você tem 1 usuário gratuito. Crie o login, escolha a função e libere só as abas que quiser.
              </p>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar usuário
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {members.map((member) => {
              const level = LEVELS.find((l) => l.value === member.permission_level);
              const LevelIcon = level?.icon ?? Eye;
              return (
                <Card key={member.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{member.role_label || "Usuário"}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <LevelIcon className="w-3 h-3" />
                          {level?.label}
                        </Badge>
                        <Switch
                          checked={member.is_active}
                          onCheckedChange={(v) => handleToggleActive(member, v)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {member.allowed_features.map((f) => (
                        <Badge key={f} variant="outline" className="text-xs">
                          {FEATURE_LABELS[f] ?? f}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(member)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(member)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {limitReached && (
          <Card className="border-dashed bg-muted/40">
            <CardContent className="py-6 flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium flex items-center gap-2">
                  Usuários extras
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="w-3 h-3" /> Em breve
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Você já está usando seu usuário gratuito. Em breve será possível adicionar mais usuários como
                  recurso pago.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
            <DialogDescription>
              Defina o login, a função e exatamente o que este usuário pode ver e fazer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail de acesso</Label>
              <Input
                type="email"
                value={form.email}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="equipe@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label>{editing ? "Nova senha (opcional)" : "Senha"}</Label>
              <Input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label>Função no app</Label>
              <Input
                value={form.role_label}
                onChange={(e) => setForm({ ...form, role_label: e.target.value })}
                placeholder="Ex: Produtor, Baixista, Assistente"
              />
            </div>

            <div className="space-y-2">
              <Label>Nível de permissão</Label>
              <Select
                value={form.permission_level}
                onValueChange={(v) => setForm({ ...form, permission_level: v as PermissionLevel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label} — {l.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Abas liberadas</Label>
              <p className="text-xs text-muted-foreground">
                Só aparecem as abas que o seu plano libera.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 rounded-lg border p-3">
                {availableFeatures.map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={form.allowed_features.includes(key)}
                      onCheckedChange={() => toggleFeature(key)}
                    />
                    {FEATURE_LABELS[key]}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
