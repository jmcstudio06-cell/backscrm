import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, KeyRound, Shield } from "lucide-react";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle the hash fragment from the recovery link
    // Supabase appends #access_token=...&type=recovery to the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    if (accessToken && type === "recovery") {
      // Set the session from the URL tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      }).then(({ error }) => {
        if (!error) {
          setIsReady(true);
          // Clean the URL
          window.history.replaceState(null, "", window.location.pathname);
        } else {
          toast({ title: "Link inválido", description: "O link expirou ou é inválido. Solicite um novo.", variant: "destructive" });
        }
      });
    } else {
      // Listen for PASSWORD_RECOVERY event (fallback)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event) => {
          if (event === "PASSWORD_RECOVERY") {
            setIsReady(true);
          }
        }
      );

      // Check if already has a session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsReady(true);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const passwordHasMinLength = newPassword.length >= 8;
  const passwordHasUpper = /[A-Z]/.test(newPassword);
  const passwordHasLower = /[a-z]/.test(newPassword);
  const passwordHasNumber = /\d/.test(newPassword);
  const passwordHasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordIsStrong =
    passwordHasMinLength && passwordHasUpper && passwordHasLower && passwordHasNumber && passwordHasSpecial;
  const passwordsMatch = newPassword === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const canSubmit = passwordIsStrong && passwordsMatch;

  const translateError = (msg: string): string => {
    const m = (msg || "").toLowerCase();
    if (m.includes("password is known to be weak") || (m.includes("weak") && m.includes("password"))) {
      return "Essa senha é muito comum e fácil de adivinhar. Use uma combinação diferente.";
    }
    if (m.includes("password should contain") || m.includes("password must contain") || m.includes("special character")) {
      return "A senha precisa ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.";
    }
    if (m.includes("password should be at least")) return "A senha deve ter pelo menos 8 caracteres.";
    if (m.includes("same password")) return "A nova senha precisa ser diferente da atual.";
    if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Aguarde e tente novamente.";
    if (m.includes("network") || m.includes("failed to fetch")) return "Erro de conexão. Verifique sua internet.";
    return "Não foi possível atualizar a senha. Tente novamente.";
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordIsStrong) {
      toast({
        title: "Senha fraca",
        description: "Use no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.",
        variant: "destructive",
      });
      return;
    }
    if (!passwordsMatch) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Senha atualizada!", description: "Sua senha foi alterada com sucesso." });
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Erro", description: translateError(error?.message || ""), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0066CC] via-[#0077DD] to-[#00B4D8] flex items-center justify-center px-4">
        <div className="rounded-3xl bg-white shadow-2xl p-8 md:p-10 max-w-md w-full text-center">
          <div className="h-8 w-8 border-2 border-[#0066CC]/30 border-t-[#0066CC] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066CC] via-[#0077DD] to-[#00B4D8] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="rounded-3xl bg-white shadow-2xl p-8 md:p-10 max-w-md w-full relative z-10 animate-scale-in">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0066CC] to-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Redefinir senha — Backstage Pro</h1>
          <p className="text-slate-500 mt-2">Defina sua nova senha abaixo</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-slate-700 font-medium">Nova senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20 pr-12 rounded-xl transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1.5">
                  {[passwordHasMinLength, passwordHasUpper, passwordHasLower, passwordHasNumber, passwordHasSpecial].map((ok, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${ok ? (passwordIsStrong ? "bg-emerald-500" : "bg-amber-500") : "bg-slate-200"}`} />
                  ))}
                </div>
                {passwordIsStrong ? (
                  <p className="text-xs font-semibold text-emerald-600">✓ Senha forte</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-1 text-xs">
                    {[
                      { ok: passwordHasMinLength, label: "Pelo menos 8 caracteres" },
                      { ok: passwordHasUpper, label: "1 letra maiúscula (A-Z)" },
                      { ok: passwordHasLower, label: "1 letra minúscula (a-z)" },
                      { ok: passwordHasNumber, label: "1 número (0-9)" },
                      { ok: passwordHasSpecial, label: "1 caractere especial (!@#$...)" },
                    ].map((r, i) => (
                      <li key={i} className={`flex items-center gap-1.5 ${r.ok ? "text-emerald-600" : "text-slate-500"}`}>
                        <span>{r.ok ? "✓" : "•"}</span>
                        <span>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-[#0066CC]/20 rounded-xl transition-all ${showMismatch ? "border-red-400 focus:border-red-500" : "focus:border-[#0066CC]"}`}
            />
            {showMismatch && (
              <p className="text-xs text-red-600 font-medium">⚠ As senhas não coincidem</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !canSubmit}
            className="w-full h-14 bg-gradient-to-r from-[#0066CC] to-[#0088DD] hover:from-[#0055AA] hover:to-[#0077CC] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Salvando...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                Atualizar senha
              </span>
            )}
          </Button>
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs pt-2">
            <Shield className="w-3 h-3" />
            <span>Dados seguros</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
