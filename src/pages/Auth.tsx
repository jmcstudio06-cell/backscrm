import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  BarChart3, 
  ArrowRight,
  Eye,
  EyeOff,
  Mic2
} from "lucide-react";

const Auth = () => {
  const [showForm, setShowForm] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !formData.acceptTerms) {
      toast({
        title: "Erro",
        description: "Você precisa aceitar os termos de uso.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulated auth - will be replaced with real auth
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: isLogin ? "Login realizado!" : "Conta criada!",
        description: isLogin 
          ? "Bem-vindo de volta ao Backstage Pro!" 
          : "Sua conta foi criada com sucesso!",
      });
      navigate("/dashboard");
    }, 1500);
  };

  const features = [
    {
      icon: Calendar,
      title: "Agenda de Shows",
      description: "Gerencie todos os seus eventos e apresentações"
    },
    {
      icon: DollarSign,
      title: "Financeiro Completo",
      description: "Controle receitas e despesas automaticamente"
    },
    {
      icon: BarChart3,
      title: "CRM de Vendas",
      description: "Pipeline visual para converter leads em shows"
    },
    {
      icon: Users,
      title: "Gestão de Músicos",
      description: "Organize sua banda e pagamentos"
    },
  ];

  const handleCreateAccount = () => {
    setShowForm(true);
    setIsLogin(false);
  };

  const handleLogin = () => {
    setShowForm(true);
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
            <Mic2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Backstage Pro</h1>
            <p className="text-xs text-emerald-400">CRM para Artistas</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="text-white hover:text-emerald-400 hover:bg-white/5"
          onClick={handleLogin}
        >
          Entrar
        </Button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-400">Gestão completa para artistas</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Transforme sua{" "}
                <span className="text-emerald-400">carreira musical</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-lg">
                O jeito mais fácil de gerenciar shows, controlar finanças, 
                organizar sua banda e converter leads em contratos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 h-12 rounded-full"
                onClick={handleCreateAccount}
              >
                Criar minha conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white font-semibold px-8 h-12 rounded-full"
                onClick={handleLogin}
              >
                Fazer login
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>+500 artistas já estão usando</span>
            </div>
          </div>

          {/* Right Side - Feature Cards or Auth Form */}
          {!showForm ? (
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group rounded-2xl bg-white/5 border border-white/10 p-6 transition-all hover:bg-white/10 hover:border-emerald-500/30"
                >
                  <feature.icon className="h-8 w-8 text-emerald-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              ))}
              
              {/* Stats Card */}
              <div className="col-span-2 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Receita gerenciada</p>
                    <p className="text-3xl font-bold text-emerald-400">R$ 2.5M+</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Auth Form */
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white">
                  {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
                </h3>
                <p className="text-gray-400 mt-2">
                  {isLogin 
                    ? "Entre para acessar seu painel" 
                    : "Comece a gerenciar sua carreira hoje"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Nome completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome artístico"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, acceptTerms: checked as boolean })
                        }
                        className="mt-1 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <Label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed">
                        Concordo com os{" "}
                        <a href="#" className="text-emerald-400 hover:underline">Termos de Uso</a>
                        {" "}e{" "}
                        <a href="#" className="text-emerald-400 hover:underline">Política de Privacidade</a>
                      </Label>
                    </div>
                  </>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="remember"
                        className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-400">
                        Lembrar de mim
                      </Label>
                    </div>
                    <a href="#" className="text-sm text-emerald-400 hover:underline">
                      Esqueceu a senha?
                    </a>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Aguarde...</span>
                    </div>
                  ) : (
                    isLogin ? "Entrar" : "Criar conta"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-emerald-400 font-medium hover:underline"
                  >
                    {isLogin ? "Criar conta" : "Fazer login"}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Auth;
