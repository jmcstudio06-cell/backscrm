import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { setAuth } from "@/lib/api";
import { toast } from "sonner";
import { Zap, Check } from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Cadastrar — Backs ZapCRM" }] }),
  component: SignupPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").max(100),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Senhas não conferem" });

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parsed.data.email,
          password: parsed.data.password,
          name: parsed.data.email.split("@")[0],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Erro ao criar conta.");
        return;
      }

      setAuth(data.token, {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        status: data.user.status,
        plan: data.user.plan,
        expiresAt: data.user.expiresAt,
      });

      toast.success("Conta criada! Bem-vindo ao Backs ZapCRM 🎉");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error("Falha de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const isEmbed = typeof window !== "undefined" && window.self !== window.top;

  return (
    <div className={`flex min-h-screen flex-col ${isEmbed ? "bg-transparent" : ""}`}>
      {!isEmbed && <SiteHeader />}
      <main className={`flex flex-1 items-center justify-center ${isEmbed ? "p-4" : "px-4 py-16"}`}>
        <Card className="w-full max-w-md p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-cyan glow-cyan">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <h1 className="font-display text-2xl font-bold">Criar conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Comece grátis e cancele quando quiser</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="voce@empresa.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 8 caracteres" />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input id="confirm" type="password" autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repita a senha" />
              {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
            </div>
            <ul className="space-y-1.5 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-cyan" /> Período de teste incluso</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-cyan" /> Não pedimos cartão</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-cyan" /> Acesso imediato à extensão</li>
            </ul>
            <Button type="submit" className="w-full bg-gradient-brand text-cyan hover:opacity-90" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar conta grátis"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-cyan hover:underline">Entrar</Link>
          </p>
        </Card>
      </main>
      {!isEmbed && <SiteFooter />}
    </div>
  );
}
