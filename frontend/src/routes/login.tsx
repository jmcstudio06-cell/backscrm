import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { setAuth } from "@/lib/api";
import { toast } from "sonner";
import { Zap, Eye, EyeOff } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Backs ZapCRM" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(4, "Senha deve ter no mínimo 4 caracteres").max(100),
});

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "E-mail ou senha incorretos.");
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

      toast.success(data.user.role === "admin" ? "Bem-vindo Admin!" : "Bem-vindo de volta!");
      navigate({ to: data.user.role === "admin" ? "/dashboard" : "/app" });
    } catch {
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
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-cyan glow-cyan">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <h1 className="font-display text-2xl font-bold">Entrar</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acesse sua conta Backs ZapCRM</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="voce@empresa.com"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full bg-gradient-brand text-cyan hover:opacity-90" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro" className="font-medium text-cyan hover:underline">Criar agora</Link>
          </p>
        </Card>
      </main>
      {!isEmbed && <SiteFooter />}
    </div>
  );
}
