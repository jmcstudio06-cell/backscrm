import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TermsModal } from "@/components/auth/TermsModal";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  BarChart3, 
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft
} from "lucide-react";

const Auth = () => {
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalType, setTermsModalType] = useState<"terms" | "privacy">("terms");
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

  // Check if user is already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/dashboard");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Email ou senha incorretos.");
          }
          throw error;
        }

        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta ao Backstage Pro!",
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              name: formData.name,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("Este email já está cadastrado. Tente fazer login.");
          }
          throw error;
        }

        toast({
          title: "Conta criada!",
          description: "Sua conta foi criada com sucesso!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: "Agenda de Shows",
      description: "Gerencie todos os seus eventos e apresentações",
      color: "bg-blue-500"
    },
    {
      icon: DollarSign,
      title: "Financeiro Completo",
      description: "Controle receitas e despesas automaticamente",
      color: "bg-emerald-500"
    },
    {
      icon: BarChart3,
      title: "CRM de Vendas",
      description: "Pipeline visual para converter leads em shows",
      color: "bg-purple-500"
    },
    {
      icon: Users,
      title: "Gestão de Músicos",
      description: "Organize sua banda e pagamentos",
      color: "bg-pink-500"
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

  const handleBack = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0066CC] via-[#0088DD] to-[#00B4D8]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Backstage</span>
            <span className="text-2xl font-bold text-cyan-300">Pro</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showForm && (
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-white/10"
            onClick={handleLogin}
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span className="text-sm text-white/90">Gestão completa para artistas</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-white">
                Transforme sua{" "}
                <span className="text-cyan-300">carreira musical</span>
              </h2>
              <p className="text-lg text-white/80 max-w-lg">
                O jeito mais fácil de gerenciar shows, controlar finanças, 
                organizar sua banda e converter leads em contratos.
              </p>
            </div>

            {!showForm && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-[#0066CC] hover:bg-white/90 font-semibold px-8 h-12 rounded-full"
                  onClick={handleCreateAccount}
                >
                  Criar minha conta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-8 h-12 rounded-full"
                  onClick={handleLogin}
                >
                  Fazer login
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-white/70">
              <Users className="h-4 w-4" />
              <span>+100 artistas já estão usando</span>
            </div>
          </div>

          {/* Right Side - Feature Cards or Auth Form */}
          {!showForm ? (
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 transition-all hover:bg-white/20 hover:border-white/30"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </div>
              ))}
              
              {/* Stats Card */}
              <div className="col-span-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">Receita gerenciada</p>
                    <p className="text-3xl font-bold text-white">R$ 2.5M+</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-cyan-300" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Auth Form */
            <div className="rounded-2xl bg-white shadow-2xl p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-800">
                  {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
                </h3>
                <p className="text-slate-500 mt-2">
                  {isLogin 
                    ? "Entre para acessar seu painel" 
                    : "Comece a gerenciar sua carreira hoje"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">Nome completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome artístico"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700">Confirmar senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, acceptTerms: checked as boolean })
                        }
                        className="mt-1 border-slate-300 data-[state=checked]:bg-[#0066CC] data-[state=checked]:border-[#0066CC]"
                      />
                      <Label htmlFor="terms" className="text-sm text-slate-500 leading-relaxed">
                        Concordo com os{" "}
                        <button 
                          type="button"
                          onClick={() => { setTermsModalType("terms"); setTermsModalOpen(true); }}
                          className="text-[#0066CC] hover:underline"
                        >
                          Termos de Uso
                        </button>
                        {" "}e{" "}
                        <button 
                          type="button"
                          onClick={() => { setTermsModalType("privacy"); setTermsModalOpen(true); }}
                          className="text-[#0066CC] hover:underline"
                        >
                          Política de Privacidade
                        </button>
                      </Label>
                    </div>
                  </>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="remember"
                        className="border-slate-300 data-[state=checked]:bg-[#0066CC] data-[state=checked]:border-[#0066CC]"
                      />
                      <Label htmlFor="remember" className="text-sm text-slate-500">
                        Lembrar de mim
                      </Label>
                    </div>
                    <a 
                      href="https://wa.me/5512991545726?text=Olá! Gostaria de solicitar a troca da minha senha no Backstage Pro." 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#0066CC] hover:underline"
                    >
                      Esqueceu a senha?
                    </a>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#0066CC] hover:bg-[#0055AA] text-white font-semibold rounded-xl"
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
                <p className="text-slate-500">
                  {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[#0066CC] font-medium hover:underline"
                  >
                    {isLogin ? "Criar conta" : "Fazer login"}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
        </svg>
      </div>

      {/* Terms/Privacy Modal */}
      <TermsModal 
        open={termsModalOpen} 
        onOpenChange={setTermsModalOpen} 
        type={termsModalType} 
      />
    </div>
  );
};

export default Auth;