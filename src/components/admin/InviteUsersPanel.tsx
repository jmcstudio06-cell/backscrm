import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Send, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface InviteResult {
  email: string;
  status: "success" | "error" | "duplicate";
  message: string;
}

export function InviteUsersPanel() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<InviteResult[]>([]);

  const sendInvite = async (targetEmail: string): Promise<InviteResult> => {
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { email: targetEmail.trim().toLowerCase() },
    });

    if (error) {
      // For non-2xx responses, try to parse the error context for our JSON body
      let errorMessage = error.message || "Erro ao enviar";
      try {
        // FunctionsHttpError has a context with the Response object
        const context = (error as any).context;
        if (context instanceof Response) {
          const body = await context.json();
          errorMessage = body?.error || errorMessage;
        } else if (typeof errorMessage === 'string' && errorMessage.includes("já está cadastrado")) {
          // fallback
        }
      } catch {
        // ignore parse errors
      }
      
      const isDuplicate = errorMessage.includes("já está cadastrado");
      return {
        email: targetEmail,
        status: isDuplicate ? "duplicate" : "error",
        message: errorMessage,
      };
    }

    if (data?.error) {
      const isDuplicate = data.error.includes("já está cadastrado");
      return {
        email: targetEmail,
        status: isDuplicate ? "duplicate" : "error",
        message: data.error,
      };
    }

    return { email: targetEmail, status: "success", message: "Convite enviado!" };
  };

  const handleSendSingle = async () => {
    if (!email.trim()) return;
    setSending(true);
    const result = await sendInvite(email.trim());
    setResults(prev => [result, ...prev]);
    if (result.status === "success") {
      toast.success(`Convite enviado para ${result.email}`);
      setEmail("");
    } else {
      toast.error(result.message);
    }
    setSending(false);
  };

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;
  const duplicateCount = results.filter(r => r.status === "duplicate").length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Enviar Convite Individual
          </CardTitle>
          <CardDescription>
            Envia um e-mail de convite para a pessoa conhecer o Backstage Pro.
            A pessoa receberá um e-mail com um link para a landing page do app (não cria conta automaticamente).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Digite o e-mail do convidado..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendSingle()}
              disabled={sending}
              className="flex-1"
            />
            <Button onClick={handleSendSingle} disabled={sending || !email.trim()}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1.5" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Histórico de Envios</CardTitle>
              <div className="flex gap-2">
                {successCount > 0 && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> {successCount} enviado{successCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {duplicateCount > 0 && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    <AlertCircle className="h-3 w-3 mr-1" /> {duplicateCount} duplicado{duplicateCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                    <XCircle className="h-3 w-3 mr-1" /> {errorCount} erro{errorCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/30 text-sm">
                  <span className="font-medium truncate mr-2">{r.email}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {r.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {r.status === "duplicate" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    {r.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                    <span className={`text-xs ${
                      r.status === "success" ? "text-green-600" :
                      r.status === "duplicate" ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {r.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
