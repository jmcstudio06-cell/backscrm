import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TermsModal } from "@/components/auth/TermsModal";
import { markConversion } from "@/hooks/useLandingInsights";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  BarChart3, 
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  Phone,
  Star,
  Check,
  Shield,
  Zap,
  Mail
} from "lucide-react";

type AuthView = "landing" | "login" | "register" | "forgot" | "reset-sent";

const Auth = () => {
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalType, setTermsModalType] = useState<"terms" | "privacy">("terms");
  const [view, setView] = useState<AuthView>("landing");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const showForm = view !== "landing";
  const isLogin = view === "login";
  const isForgot = view === "forgot";
  const isResetSent = view === "reset-sent";

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
  }, [navigate, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" });
      return;
    }

    if (!isLogin && !formData.phone) {
      toast({ title: "Erro", description: "Por favor, informe seu WhatsApp.", variant: "destructive" });
      return;
    }

    if (!isLogin && formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        toast({ title: "Erro", description: "Informe um número de WhatsApp válido com DDD.", variant: "destructive" });
        return;
      }
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }

    if (!isLogin && !formData.acceptTerms) {
      toast({ title: "Erro", description: "Você precisa aceitar os termos de uso.", variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
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
        toast({ title: "Login realizado!", description: "Bem-vindo de volta ao Backstage Pro!" });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              name: formData.name,
              phone: formData.phone.replace(/\D/g, ''),
            },
          },
        });
        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("Este email já está cadastrado. Tente fazer login.");
          }
          throw error;
        }
        if (!localStorage.getItem("visitor_id")) {
          localStorage.setItem("visitor_id", crypto.randomUUID());
        }
        await markConversion();
        toast({ title: "Conta criada!", description: "Sua conta foi criada com sucesso!" });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Ocorreu um erro. Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!resetEmail) {
      toast({ title: "Erro", description: "Informe seu e-mail.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: "https://backstagepro.online/reset-password",
      });
      if (error) throw error;
      toast({ title: "E-mail enviado!", description: "Verifique sua caixa de entrada e spam." });
      setView("reset-sent");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Falha ao enviar e-mail.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Calendar, title: "Agenda de Shows", description: "Gerencie todos os seus eventos e apresentações", color: "bg-blue-500", delay: "0" },
    { icon: DollarSign, title: "Financeiro Completo", description: "Controle receitas e despesas automaticamente", color: "bg-emerald-500", delay: "100" },
    { icon: BarChart3, title: "CRM de Vendas", description: "Pipeline visual para converter leads em shows", color: "bg-purple-500", delay: "200" },
    { icon: Users, title: "Gestão de Músicos", description: "Organize sua banda e pagamentos", color: "bg-pink-500", delay: "300" },
  ];

  const benefits = [
    { icon: Zap, text: "Setup em 2 minutos" },
    { icon: Shield, text: "Dados seguros" },
    { icon: Star, text: "Suporte dedicado" },
  ];

  const userAvatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
  ];

  const handleBack = () => {
    if (isResetSent) {
      setView("forgot");
    } else if (isForgot) {
      setView("login");
    } else {
      setView("landing");
    }
  };

  const getFormTitle = () => {
    if (isForgot) return "Recuperar senha";
    if (isResetSent) return "Verifique seu e-mail";
    if (isLogin) return "Bem-vindo de volta!";
    return "Crie sua conta grátis";
  };

  const getFormSubtitle = () => {
    if (isForgot) return "Informe seu e-mail para receber o link de recuperação";
    if (isResetSent) return "Enviamos um link de redefinição de senha para seu e-mail";
    if (isLogin) return "Entre para acessar seu painel";
    return "Comece a gerenciar sua carreira hoje";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066CC] via-[#0077DD] to-[#00B4D8] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-blue-300/10 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white transition-transform group-hover:scale-105">Backstage</span>
            <span className="text-2xl font-bold text-cyan-300 transition-transform group-hover:scale-105">Pro</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showForm && (
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-white/10 font-medium transition-all"
            onClick={() => setView("login")}
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 md:py-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
          {/* Left Side - Hero Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/20">
              <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
              <span className="text-sm text-white/90 font-medium">Gestão completa para artistas</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-white">
                Transforme sua
              </h1>
              <h2 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-cyan-300">
                carreira musical
              </h2>
              <p className="text-lg text-white/80 max-w-lg mt-6">
                O jeito mais fácil de gerenciar shows, controlar finanças, 
                organizar sua banda e converter leads em contratos.
              </p>
            </div>

            {!showForm && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg"
                  className="bg-white text-[#0066CC] hover:bg-white/90 hover:scale-105 font-semibold px-8 h-14 rounded-full shadow-xl shadow-black/20 transition-all duration-300"
                  onClick={() => setView("register")}
                >
                  Criar minha conta grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/15 hover:text-white font-semibold px-8 h-14 rounded-full transition-all duration-300"
                  onClick={() => setView("login")}
                >
                  Já tenho conta
                </Button>
              </div>
            )}

            {/* Benefits */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 text-white/80"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <benefit.icon className="w-4 h-4 text-cyan-300" />
                  </div>
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {userAvatars.map((avatar, i) => (
                  <img 
                    key={i}
                    src={avatar}
                    alt={`Usuário ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-white/80 text-sm">+100 artistas usando</span>
              </div>
            </div>
          </div>

          {/* Right Side - Feature Cards or Auth Form */}
          {!showForm ? (
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-[1.02] hover:shadow-xl animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-110`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              ))}
              
              {/* Stats Card */}
              <div 
                className="col-span-2 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-6 animate-fade-in"
                style={{ animationDelay: "400ms" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-2">Receita gerenciada por artistas</p>
                    <p className="text-4xl font-bold text-white">R$ 2.5M+</p>
                  </div>
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                    <DollarSign className="h-10 w-10 text-cyan-300" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Auth Form */
            <div className="rounded-3xl bg-white shadow-2xl p-8 md:p-10 animate-scale-in">
              {/* Form Header */}
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0066CC] to-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {isForgot || isResetSent ? (
                    <Mail className="w-8 h-8 text-white" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{getFormTitle()}</h3>
                <p className="text-slate-500 mt-2">{getFormSubtitle()}</p>
              </div>

              {/* Forgot Password - Enter Email */}
              {isForgot && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail" className="text-slate-700 font-medium">E-mail cadastrado</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20 rounded-xl transition-all"
                    />
                  </div>
                    <Button
                      type="button"
                      disabled={isLoading}
                      onClick={handleSendResetEmail}
                      className="w-full h-14 bg-gradient-to-r from-[#0066CC] to-[#0088DD] hover:from-[#0055AA] hover:to-[#0077CC] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Enviando...</span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Enviar link de recuperação
                        </span>
                      )}
                    </Button>
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="w-full text-sm text-[#0066CC] hover:underline font-medium mt-2"
                  >
                    Voltar para o login
                  </button>
                </div>
              )}

              {/* Reset Sent - Confirmation */}
              {isResetSent && (
                <div className="space-y-5">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-[#0066CC] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-700 font-medium">Link enviado para:</p>
                        <p className="text-sm text-[#0066CC] font-semibold">{resetEmail}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Clique no link enviado para seu e-mail para redefinir sua senha. Verifique também a pasta de spam.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setView("forgot"); }}
                    className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-medium"
                  >
                    Reenviar link
                  </Button>
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="w-full text-sm text-[#0066CC] hover:underline font-medium"
                  >
                    Voltar para o login
                  </button>
                </div>
              )}

              {/* Login / Register Form */}
              {(isLogin || view === "register") && (
                <>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-700 font-medium">Nome completo *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome artístico"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20 rounded-xl transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-slate-700 font-medium">
                            <span className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              WhatsApp *
                            </span>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 11) {
                                if (value.length > 2) {
                                  value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                                }
                                if (value.length > 10) {
                                  value = value.slice(0, 10) + '-' + value.slice(10);
                                }
                              }
                              setFormData({ ...formData, phone: value });
                            }}
                            className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20 rounded-xl transition-all"
                            required
                          />
                          <p className="text-xs text-slate-400">Usaremos para contato e suporte</p>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20 rounded-xl transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 font-medium">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20 pr-12 rounded-xl transition-all"
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
                          <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirmar senha</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20 rounded-xl transition-all"
                          />
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                          <Checkbox
                            id="terms"
                            checked={formData.acceptTerms}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, acceptTerms: checked as boolean })
                            }
                            className="mt-1 border-slate-300 data-[state=checked]:bg-[#0066CC] data-[state=checked]:border-[#0066CC]"
                          />
                          <Label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                            Concordo com os{" "}
                            <button 
                              type="button"
                              onClick={() => { setTermsModalType("terms"); setTermsModalOpen(true); }}
                              className="text-[#0066CC] hover:underline font-medium"
                            >
                              Termos de Uso
                            </button>
                            {" "}e{" "}
                            <button 
                              type="button"
                              onClick={() => { setTermsModalType("privacy"); setTermsModalOpen(true); }}
                              className="text-[#0066CC] hover:underline font-medium"
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
                        <button
                          type="button"
                          onClick={() => setView("forgot")}
                          className="text-sm text-[#0066CC] hover:underline font-medium"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 bg-gradient-to-r from-[#0066CC] to-[#0088DD] hover:from-[#0055AA] hover:to-[#0077CC] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Aguarde...</span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-2">
                          {isLogin ? "Entrar" : "Criar minha conta"}
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Shield className="w-3 h-3" />
                        <span>Dados seguros</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Check className="w-3 h-3" />
                        <span>Sem cartão</span>
                      </div>
                    </div>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-slate-500">
                      {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                      <button
                        type="button"
                        onClick={() => setView(isLogin ? "register" : "login")}
                        className="text-[#0066CC] font-semibold hover:underline"
                      >
                        {isLogin ? "Criar conta grátis" : "Fazer login"}
                      </button>
                    </p>
                  </div>
                </>
              )}
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
