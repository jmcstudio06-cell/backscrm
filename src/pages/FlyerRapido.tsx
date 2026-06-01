import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function FlyerRapido() {
  return (
    <Layout title="Flyer rapido" subtitle="Monte artes rapidas para divulgar seus shows">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Flyer rapido</CardTitle>
            <CardDescription>
              Essa nova guia ja esta pronta no menu. Se quiser, no proximo passo eu monto a funcionalidade dela.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Aqui vai entrar a area para criar flyers de forma pratica e rapida.
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
