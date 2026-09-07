import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Wrench, Loader2, AlertTriangle } from "lucide-react";

const DEFAULT_MESSAGE =
  "Estamos realizando uma atualização rápida no aplicativo. Volte em alguns minutos.";

export function MaintenancePanel() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["maintenance_mode", "maintenance_message"]);
      data?.forEach((s) => {
        if (s.setting_key === "maintenance_mode") setEnabled(s.setting_value === "true");
        if (s.setting_key === "maintenance_message" && s.setting_value) setMessage(s.setting_value);
      });
      setLoading(false);
    })();
  }, []);

  const save = async (nextEnabled: boolean, nextMessage: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("app_settings").upsert(
        [
          { setting_key: "maintenance_mode", setting_value: nextEnabled ? "true" : "false" },
          { setting_key: "maintenance_message", setting_value: nextMessage },
        ],
        { onConflict: "setting_key" }
      );
      if (error) throw error;
      setEnabled(nextEnabled);
      toast.success(nextEnabled ? "Modo manutenção ativado" : "Modo manutenção desativado");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" /> Modo manutenção
        </CardTitle>
        <CardDescription>
          Ao ativar, todos os usuários veem a tela "Aplicativo em manutenção" e não conseguem usar o
          app. Você (admin) continua com acesso normal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
          </div>
        ) : (
          <>
            <div
              className={`flex items-center justify-between rounded-xl border p-4 ${
                enabled ? "border-destructive/40 bg-destructive/5" : ""
              }`}
            >
              <div>
                <p className="font-medium flex items-center gap-2">
                  {enabled && <AlertTriangle className="w-4 h-4 text-destructive" />}
                  {enabled ? "Manutenção ativa" : "Aplicativo liberado"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {enabled
                    ? "Ninguém consegue passar da tela de manutenção."
                    : "Todos os usuários estão com acesso normal."}
                </p>
              </div>
              <Switch
                checked={enabled}
                disabled={saving}
                onCheckedChange={(v) => save(v, message)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem exibida</Label>
              <Textarea value={message} rows={3} onChange={(e) => setMessage(e.target.value)} />
              <Button variant="outline" size="sm" disabled={saving} onClick={() => save(enabled, message)}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar mensagem
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
