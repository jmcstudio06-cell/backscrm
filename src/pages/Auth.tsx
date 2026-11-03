import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TermsModal } from "@/components/auth/TermsModal";
import baIconImg from "@/assets/ba-icon.png";
import appShowcase from "@/assets/auth-devices.png";
import { Helmet } from "react-helmet-async";
import { trackEvent } from "@/lib/metaPixel";
import "@/styles/auth.css";

import { ArrowRight, ArrowLeft, Eye, EyeOff, Phone, Check, Shield, Mail, Calendar, Wallet, FileText, Loader2, Circle, TriangleAlert } from "lucide-react";

type AuthView = "landing" | "login" | "register" | "forgot" | "reset-sent" | "signup-sent";

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
  const isSignupSent = view === "signup-sent";

  // Password validation — alinhado com a política do Supabase
  // (mín. 8, maiúscula, minúscula, número e caractere especial).
  const passwordHasMinLength = formData.password.length >= 8;
  const passwordHasUpper = /[A-Z]/.test(formData.password);
  const passwordHasLower = /[a-z]/.test(formData.password);
  const passwordHasNumber = /\d/.test(formData.password);
  const passwordHasSpecial = /[^A-Za-z0-9]/.test(formData.password);
  const passwordIsStrong =
    passwordHasMinLength && passwordHasUpper && passwordHasLower && passwordHasNumber && passwordHasSpecial;
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showPasswordMismatch = !isLogin && formData.confirmPassword.length > 0 && !passwordsMatch;
  const canSubmit = isLogin || (passwordIsStrong && passwordsMatch);

  const translateError = (msg: string): string => {
    const m = (msg || "").toLowerCase();
    if (m.includes("password is known to be weak") || (m.includes("weak") && m.includes("password"))) {
      return "Essa senha é muito comum e fácil de adivinhar. Use uma combinação diferente.";
    }
    if (m.includes("password should contain") || m.includes("password must contain") || m.includes("special character")) {
      return "A senha precisa ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.";
    }
    if (m.includes("password should be at least")) return "A senha deve ter pelo menos 8 caracteres.";
    if (m.includes("invalid login credentials")) return "Email ou senha incorretos.";
    if (m.includes("already registered") || m.includes("user already")) return "Este email já está cadastrado. Tente fazer login.";
    if (m.includes("email not confirmed")) return "Confirme seu email antes de entrar.";
    if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
    if (m.includes("network") || m.includes("failed to fetch")) return "Erro de conexão. Verifique sua internet.";
    return "Não foi possível concluir. Verifique os dados e tente novamente.";
  };

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

    if (!isLogin && !passwordIsStrong) {
      toast({
        title: "Senha fraca",
        description: "Use no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.",
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
        toast({ title: "Login realizado!", description: "Bem-vindo de volta ao Backstage Pro!" });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        // Cidade/estado/média de shows foram movidos para o onboarding (após o
        // vídeo de boas-vindas), para reduzir o atrito do cadastro. Aqui enviamos
        // apenas nome e WhatsApp; o restante do perfil é completado depois.
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
        trackEvent("CompleteRegistration", { content_name: "trial", status: true });
        toast({ title: "Cadastro realizado!", description: "Bem-vindo ao Backstage Pro!" });
      }
    } catch (error: unknown) {
      // Log do erro cru do Supabase para diagnóstico (a mensagem traduzida
      // esconde a causa real; aqui registramos o erro completo no console).
      console.error("Auth signup/login error:", error);
      toast({ title: "Erro", description: translateError(error instanceof Error ? error.message : ""), variant: "destructive" });
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
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "E-mail enviado!", description: "Verifique sua caixa de entrada e spam." });
      setView("reset-sent");
    } catch (error: unknown) {
      toast({ title: "Erro", description: translateError(error instanceof Error ? error.message : ""), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isResetSent) {
      setView("forgot");
    } else if (isSignupSent) {
      setView("register");
    } else if (isForgot) {
      setView("login");
    } else {
      setView("landing");
    }
  };

  const getFormTitle = () => {
    if (isForgot) return "Recuperar senha";
    if (isResetSent) return "Verifique seu e-mail";
    if (isSignupSent) return "Confirme seu email";
    if (isLogin) return "Bem-vindo de volta!";
    return "Crie sua conta grátis";
  };

  const getFormSubtitle = () => {
    if (isForgot) return "Informe seu e-mail para receber o link de recuperação";
    if (isResetSent) return "Enviamos um link de redefinição de senha para seu e-mail";
    if (isSignupSent) return "Enviamos um link de confirmação para seu email. Clique nele para ativar sua conta.";
    if (isLogin) return "Entre para acessar seu painel";
    return "Comece a gerenciar sua carreira hoje";
  };

  return (
    <div className="auth-page">
      <Helmet>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" />
      </Helmet>
      <header className="auth-header">
        <Button variant="ghost" onClick={() => navigate('/landing')} className="auth-brand"><img src={baIconImg} alt="" width={34} height={34} /><span>Backstage <span className="font-normal">Pro</span></span></Button>
        <Button variant="ghost" onClick={showForm ? handleBack : () => navigate('/landing')}><ArrowLeft className="h-4 w-4" />{showForm ? "Voltar" : "Conhecer o app"}</Button>
      </header>
      <main className="auth-layout">
        <section className="auth-intro" aria-labelledby="auth-title">
          <span className="auth-grid-bg" aria-hidden="true" />
          <span className="auth-glow auth-glow-a" aria-hidden="true" />
          <span className="auth-glow auth-glow-b" aria-hidden="true" />
          <div className="auth-intro-inner">
            <p className="auth-eyebrow"><span className="auth-eyebrow-dot" />O SEU BACKSTAGE COMEÇA AQUI</p>
            <h1 id="auth-title">{isLogin ? "Bem-vindo de volta." : "Seu talento no palco."}<span>{isLogin ? "Sua carreira continua aqui." : "Sua carreira no controle."}</span></h1>
            <p className="auth-description">Um lugar para organizar seus shows, seus cachês e os próximos passos da sua carreira.</p>
            <div className="auth-product">
              <img src={appShowcase} alt="Backstage Pro no computador, tablet e celular" width={921} height={640} />
              <div className="auth-float auth-float-a" aria-hidden="true"><span><Calendar className="h-4 w-4" /></span>Show confirmado</div>
              <div className="auth-float auth-float-b" aria-hidden="true"><span><Wallet className="h-4 w-4" /></span>Cachê recebido</div>
            </div>
            <div className="auth-tools">{[{icon: Calendar, label: "Sua agenda"}, {icon: Wallet, label: "Seus cachês"}, {icon: FileText, label: "Seus contratos"}].map(({icon: Icon,label}) => <span key={label}><Icon className="h-4 w-4" />{label}</span>)}</div>
          </div>
        </section>
        <section className="auth-form-panel" aria-labelledby="auth-form-title">
          {!showForm ? <>
            <p className="auth-eyebrow">BEM-VINDO AO SEU PRÓXIMO PASSO</p>
            <h2 id="auth-form-title">Vamos começar?</h2>
            <p className="auth-form-description">Crie sua conta e conheça o Backstage Pro no seu ritmo.</p>
            <div className="auth-trial-note"><Shield className="h-5 w-5" /><div><strong>3 horas para conhecer o app</strong><p>Teste grátis, sem cartão de crédito.</p></div></div>
            <Button size="lg" className="auth-submit w-full" onClick={() => setView("register")}>Criar minha conta grátis<ArrowRight className="h-4 w-4" /></Button>
            <div className="auth-choice-divider"><span />Já usa o Backstage Pro?<span /></div>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setView("login")}>Entrar na minha conta<ArrowRight className="h-4 w-4" /></Button>
            <p className="auth-welcome-footer">No celular ou no computador.<br />Sua carreira acompanha você.</p>
          </> : <>
            {(isLogin || view === "register") && <div className="auth-mode-switch"><Button variant={isLogin ? "secondary" : "ghost"} onClick={() => setView("login")}>Entrar</Button><Button variant={!isLogin ? "secondary" : "ghost"} onClick={() => setView("register")}>Criar conta</Button></div>}
            <div className="auth-form-heading"><h2 id="auth-form-title">{getFormTitle()}</h2><p>{getFormSubtitle()}</p>{view === "register" && <span>3 horas grátis · Sem cartão de crédito</span>}</div>
              {/* Forgot Password - Enter Email */}
              {isForgot && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail" className="text-foreground font-medium">E-mail cadastrado</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-12 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/20 rounded-lg transition-all"
                    />
                  </div>
                    <Button
                      type="button"
                      disabled={isLoading}
                      onClick={handleSendResetEmail}
                      className="auth-submit w-full h-12 font-semibold"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Enviando...</span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Enviar link de recuperação
                        </span>
                      )}
                    </Button>
                  <Button variant="link"
                    type="button"
                    onClick={() => setView("login")}
                    className="w-full text-sm text-primary hover:underline font-medium mt-2"
                  >
                    Voltar para o login
                  </Button>
                </div>
              )}

              {/* Reset Sent - Confirmation */}
              {isResetSent && (
                <div className="space-y-5">
                  <div className="p-4 bg-secondary rounded-lg border border-border">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground font-medium">Link enviado para:</p>
                        <p className="text-sm text-primary font-semibold">{resetEmail}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Clique no link enviado para seu e-mail para redefinir sua senha. Verifique também a pasta de spam.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setView("forgot"); }}
                    className="w-full h-12 rounded-lg border-input text-foreground font-medium"
                  >
                    Reenviar link
                  </Button>
                  <Button variant="link"
                    type="button"
                    onClick={() => setView("login")}
                    className="w-full text-sm text-primary hover:underline font-medium"
                  >
                    Voltar para o login
                  </Button>
                </div>
              )}

              {/* Signup Sent - Confirmation */}
              {isSignupSent && (
                <div className="space-y-5">
                  <div className="p-4 bg-secondary rounded-lg border border-border">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground font-medium">Link enviado para:</p>
                        <p className="text-sm text-primary font-semibold">{resetEmail}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Clique no link do email para confirmar sua conta e fazer login. Verifique também a pasta de spam.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="link"
                    type="button"
                    onClick={() => setView("login")}
                    className="w-full text-sm text-primary hover:underline font-medium"
                  >
                    Voltar para o login
                  </Button>
                </div>
              )}

              {/* Login / Register Form */}
              {(isLogin || view === "register") && (
                <>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-foreground font-medium">Nome completo *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome artístico"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-12 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/20 rounded-lg transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-foreground font-medium">
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
                            className="h-12 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/20 rounded-lg transition-all"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Usaremos para contato e suporte</p>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/20 rounded-lg transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="h-12 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/20 pr-12 rounded-lg transition-all"
                        />
                        <Button variant="link"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                      {!isLogin && formData.password.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex gap-1.5">
                            {[passwordHasMinLength, passwordHasUpper, passwordHasLower, passwordHasNumber, passwordHasSpecial].map((ok, i) => (
                              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${ok ? (passwordIsStrong ? "bg-primary" : "bg-primary/50") : "bg-muted"}`} />
                            ))}
                          </div>
                          {passwordIsStrong ? (
                            <p className="text-xs font-semibold text-primary"><Check className="inline h-3 w-3 mr-1" /> Senha forte</p>
                          ) : (
                            <ul className="grid grid-cols-1 gap-1 text-xs">
                              {[
                                { ok: passwordHasMinLength, label: "Pelo menos 8 caracteres" },
                                { ok: passwordHasUpper, label: "1 letra maiúscula (A-Z)" },
                                { ok: passwordHasLower, label: "1 letra minúscula (a-z)" },
                                { ok: passwordHasNumber, label: "1 número (0-9)" },
                                { ok: passwordHasSpecial, label: "1 caractere especial (!@#$...)" },
                              ].map((r, i) => (
                                <li key={i} className={`flex items-center gap-1.5 ${r.ok ? "text-primary" : "text-muted-foreground"}`}>
                                  {r.ok ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
                                  <span>{r.label}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    {!isLogin && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirmar senha</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className={`h-12 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring/20 pr-3 rounded-lg transition-all ${showPasswordMismatch ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                          />
                          {showPasswordMismatch && (
                            <p className="text-xs text-destructive font-medium flex items-center gap-1">
                              <TriangleAlert className="h-3 w-3" /> As senhas não coincidem
                            </p>
                          )}
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                          <Checkbox
                            id="terms"
                            checked={formData.acceptTerms}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, acceptTerms: checked as boolean })
                            }
                            className="mt-1 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                            Concordo com os{" "}
                            <Button variant="link" 
                              type="button"
                              onClick={() => { setTermsModalType("terms"); setTermsModalOpen(true); }}
                              className="auth-inline-link text-primary font-medium"
                            >
                              Termos de Uso
                            </Button>
                            {" "}e{" "}
                            <Button variant="link" 
                              type="button"
                              onClick={() => { setTermsModalType("privacy"); setTermsModalOpen(true); }}
                              className="auth-inline-link text-primary font-medium"
                            >
                              Política de Privacidade
                            </Button>
                          </Label>
                        </div>
                      </>
                    )}

                    {isLogin && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="remember"
                            className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label htmlFor="remember" className="text-sm text-muted-foreground">
                            Lembrar de mim
                          </Label>
                        </div>
                        <Button variant="link"
                          type="button"
                          onClick={() => setView("forgot")}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          Esqueceu a senha?
                        </Button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || !canSubmit}
                      className="auth-submit w-full h-12 font-semibold"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
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
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Shield className="w-3 h-3" />
                        <span>Dados seguros</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Check className="w-3 h-3" />
                        <span>Sem cartão</span>
                      </div>
                    </div>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground">
                      {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                      <Button variant="link"
                        type="button"
                        onClick={() => setView(isLogin ? "register" : "login")}
                        className="auth-inline-link text-primary font-semibold"
                      >
                        {isLogin ? "Criar conta grátis" : "Fazer login"}
                      </Button>
                    </p>
                  </div>
                </>
              )}
          </>}
        </section>
      </main>
      <footer className="auth-footer"><span>Backstage Pro®</span><span>Feito para quem vive de música.</span></footer>
      <TermsModal open={termsModalOpen} onOpenChange={setTermsModalOpen} type={termsModalType} />
    </div>
  );
};

export default Auth;
