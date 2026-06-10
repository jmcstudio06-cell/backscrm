import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAuth } from "@/lib/api";
import { toast } from "sonner";
import { User, Lock, Eye, EyeOff, LayoutDashboard, UserPlus, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Backs ZapCRM" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100),
});

const ADMIN_EMAIL = "mariooliveira.ctt@gmail.com";
const ADMIN_PASSWORD = "M@eeuteamo1";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e: React.FormEvent) => {
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

    setTimeout(() => {
      // Verificar Admin hardcoded
      if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
        const user = {
          id: "1",
          email: ADMIN_EMAIL,
          name: "Admin",
          role: "admin"
        };
        const token = "admin-token-12345";
        setAuth(token, user);
        toast.success("Bem-vindo Admin!");
        navigate({ to: "/dashboard" });
        setIsLoading(false);
        return;
      }

      // Verificar usuários no localStorage
      try {
        const storedUsers = JSON.parse(localStorage.getItem("zapcrm_users") || "[]");
        const user = storedUsers.find((u: any) => u.email === form.email && u.password === form.password);

        if (user) {
          setAuth("user-token-" + user.id, {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "user"
          });
          toast.success("Bem-vindo de volta!");
          navigate({ to: user.role === "admin" ? "/dashboard" : "/app" });
        } else {
          toast.error("E-mail ou senha incorretos.");
        }
      } catch (e) {
        toast.error("Erro ao processar login.");
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#00A3FF] p-4 font-sans">
      <div className="flex w-full max-w-[1000px] overflow-hidden rounded-2xl bg-black shadow-2xl md:flex-row">
        {/* Left Side - Login Form */}
        <div className="flex w-full flex-col p-8 md:w-1/2 md:p-12">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-white">Backs <span className="text-[#00A3FF]">ZapCRM</span></h2>
            <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A1A1A] border border-gray-800">
               <div className="text-[10px] font-bold text-white leading-tight">WHATS<br/>CRM</div>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Faça login para acessar a plataforma. Não tem uma conta? <br/>
              <Link to="/cadastro" className="text-[#00C853] hover:underline font-medium">Cadastre-se aqui.</Link>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <User size={18} />
              </div>
              <Input 
                id="email" 
                type="email" 
                autoComplete="email"
                className="h-12 border-gray-800 bg-[#1A1A1A] pl-10 text-white placeholder:text-gray-600 focus:border-[#00A3FF] focus:ring-[#00A3FF]"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@backscrm.com.br" 
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={18} />
              </div>
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                autoComplete="current-password"
                className="h-12 border-gray-800 bg-[#1A1A1A] pl-10 pr-10 text-white placeholder:text-gray-600 focus:border-[#00A3FF] focus:ring-[#00A3FF]"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <Button 
              type="submit" 
              className="h-12 w-full bg-[#00A3FF] text-white hover:bg-[#008EDB] font-bold text-base transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Carregando..." : "Logar"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-gray-800"></div>
            <span className="text-xs text-gray-600">ou</span>
            <div className="h-[1px] flex-1 bg-gray-800"></div>
          </div>

          <div className="space-y-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/dashboard" })}
              className="h-12 w-full border-[#00A3FF] bg-transparent text-[#00A3FF] hover:bg-[#00A3FF]/10 flex items-center justify-between px-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-black">
                  <div className="text-[6px] font-bold text-white">WHATS<br/>CRM</div>
                </div>
                <span>Acessar via Painel</span>
              </div>
              <ExternalLink size={16} />
            </Button>

            <Button 
              type="button"
              onClick={() => navigate({ to: "/cadastro" })}
              className="h-12 w-full bg-gradient-to-r from-[#00E5FF] to-[#1200FF] text-white hover:opacity-90 flex items-center justify-between px-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <UserPlus size={14} />
                </div>
                <span>Criar Cadastro Gratuito</span>
              </div>
              <ExternalLink size={16} />
            </Button>
          </div>

          <div className="mt-8 text-center">
            <a href="#" className="text-xs text-gray-500 hover:text-[#00A3FF]">
              Esqueceu a senha? <span className="text-[#00A3FF] hover:underline">Recuperar Acesso</span>
            </a>
          </div>
        </div>

        {/* Right Side - Branding */}
        <div className="hidden w-1/2 flex-col items-center justify-center bg-[#050505] md:flex relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00A3FF]/10 to-transparent"></div>
          <div className="z-10 flex h-[350px] w-[350px] items-center justify-center rounded-full bg-[#111111] border border-gray-900 shadow-[0_0_100px_rgba(0,163,255,0.1)]">
             <div className="text-center">
               <h1 className="text-7xl font-black text-white tracking-tighter">WHATS</h1>
               <h1 className="text-5xl font-black text-white text-right mt-[-10px]">CRM</h1>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

