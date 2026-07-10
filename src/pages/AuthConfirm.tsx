import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AuthConfirm = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      const token_hash = params.get("token_hash");
      const type = params.get("type") as any;
      const next = params.get("next") || "/dashboard";

      if (!token_hash || !type) {
        setStatus("error");
        setErrorMsg("Link de confirmação inválido.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (error) {
        setStatus("error");
        setErrorMsg(
          error.message.toLowerCase().includes("expired")
            ? "Este link expirou. Faça login novamente para receber um novo."
            : "Não foi possível confirmar seu e-mail. Tente novamente."
        );
        return;
      }

      setStatus("success");
      setTimeout(() => navigate(next, { replace: true }), 1200);
    };
    run();
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Confirmando seu e-mail...</h1>
            <p className="text-gray-600">Aguarde um instante.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">E-mail confirmado!</h1>
            <p className="text-gray-600">Redirecionando para o seu painel...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Ops!</h1>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Ir para o login
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthConfirm;
