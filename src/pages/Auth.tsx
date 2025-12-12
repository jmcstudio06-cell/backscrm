import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        toast({
          title: "Erro",
          description: "Por favor, informe seu nome.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!formData.acceptTerms) {
        toast({
          title: "Erro",
          description: "Você precisa aceitar os termos de uso.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    // Simulate auth - In production, connect to Supabase
    setTimeout(() => {
      toast({
        title: isLogin ? "Bem-vindo de volta!" : "Conta criada com sucesso!",
        description: isLogin 
          ? "Redirecionando para o dashboard..." 
          : "Redirecionando para o dashboard...",
      });
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[hsl(213,80%,25%)]">
              Backstage<span className="text-cyan-500">Pro</span>
            </span>
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[hsl(213,80%,25%)] mb-2">
              {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
            </h1>
            <p className="text-gray-500">
              {isLogin 
                ? "Entre com suas credenciais para acessar o dashboard" 
                : "Comece grátis por 3 dias. Sem cartão de crédito."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-gray-700">Nome completo</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">Senha</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar senha</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            {isLogin ? (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox id="remember" />
                  <span className="text-sm text-gray-600">Lembrar de mim</span>
                </label>
                <a href="#" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                  Esqueceu a senha?
                </a>
              </div>
            ) : (
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox 
                  id="terms" 
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                  className="mt-0.5"
                />
                <span className="text-sm text-gray-600">
                  Eu concordo com os{" "}
                  <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">Termos de Uso</a>
                  {" "}e{" "}
                  <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">Política de Privacidade</a>
                </span>
              </label>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Entrar" : "Criar conta"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou continue com</span>
            </div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 border-gray-200 hover:bg-gray-50">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-12 border-gray-200 hover:bg-gray-50">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>

          {/* Toggle auth mode */}
          <p className="text-center mt-8 text-gray-600">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-600 hover:text-cyan-700 font-semibold"
            >
              {isLogin ? "Criar conta grátis" : "Fazer login"}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div 
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        style={{ background: "linear-gradient(135deg, hsl(213, 80%, 25%) 0%, hsl(199, 89%, 48%) 100%)" }}
      >
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-cyan-300" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Gerencie sua carreira<br />
            <span className="text-cyan-300">como um profissional</span>
          </h2>
          
          <p className="text-white/80 text-lg mb-8">
            Dashboard completo, CRM, financeiro, contratos e muito mais em um só lugar.
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-cyan-500/80 to-cyan-600/80 rounded-xl p-4">
                <p className="text-white/70 text-sm">Receita Mensal</p>
                <p className="text-white text-2xl font-bold">R$ 24.451</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 rounded-xl p-4">
                <p className="text-white/70 text-sm">Shows</p>
                <p className="text-white text-2xl font-bold">12</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/80 to-purple-600/80 rounded-xl p-4">
                <p className="text-white/70 text-sm">Leads</p>
                <p className="text-white text-2xl font-bold">48</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/80 to-pink-600/80 rounded-xl p-4">
                <p className="text-white/70 text-sm">Conversão</p>
                <p className="text-white text-2xl font-bold">32%</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-white/60 text-sm">
            <span>✓ 3 dias grátis</span>
            <span>✓ Sem cartão</span>
            <span>✓ Cancele quando quiser</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
