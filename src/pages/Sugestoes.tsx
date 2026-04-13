import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lightbulb, Send, User, Phone, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Sugestoes() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Digite o título da sua sugestão");
      return;
    }
    if (!description.trim()) {
      toast.error("Descreva sua sugestão");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("improvements").insert({
      title: title.trim(),
      description: description.trim(),
      priority: "medium",
      user_id: user?.id,
      user_name: profile?.artist_name || profile?.name || "Usuário",
      user_phone: profile?.phone || null,
      user_email: profile?.email || null,
    });

    if (error) {
      console.error("Error submitting suggestion:", error);
      toast.error("Erro ao enviar sugestão. Tente novamente.");
    } else {
      setSent(true);
      setTitle("");
      setDescription("");
      toast.success("Sugestão enviada com sucesso!");
      setTimeout(() => setSent(false), 5000);
    }
    setSending(false);
  };

  return (
    <Layout title="Sugestões" subtitle="Ajude-nos a melhorar o app com suas ideias">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* User info card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Seus Dados
            </CardTitle>
            <CardDescription>Informações preenchidas automaticamente do seu cadastro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> Nome
                </Label>
                <Input
                  value={profile?.artist_name || profile?.name || ""}
                  readOnly
                  className="bg-muted/50 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Telefone
                </Label>
                <Input
                  value={profile?.phone || "Não informado"}
                  readOnly
                  className="bg-muted/50 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input
                  value={profile?.email || "Não informado"}
                  readOnly
                  className="bg-muted/50 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestion form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              Sua Sugestão
            </CardTitle>
            <CardDescription>
              Conte pra gente o que você acredita que vai melhorar o app!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da sugestão *</Label>
              <Input
                id="title"
                placeholder="Ex: Adicionar filtro por tipo de show..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descreva sua ideia *</Label>
              <Textarea
                id="description"
                placeholder="Explique com detalhes como essa melhoria ajudaria no seu dia a dia..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/2000</p>
            </div>

            {sent ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Sugestão enviada! Obrigado pela contribuição 🎉</span>
              </div>
            ) : (
              <Button onClick={handleSubmit} disabled={sending} className="w-full">
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar Sugestão
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
