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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
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
      toast({ title: "Erro", description: error.message || "Falha ao atualizar senha.", variant: "destructive" });
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-[#0066CC]/20 rounded-xl transition-all"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
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
