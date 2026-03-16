import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Construction } from "lucide-react";

export default function FlyerDivulgacao() {
  return (
    <Layout title="Flyer Divulgação">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-primary" />
            Flyer Divulgação
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie flyers profissionais para divulgar seus shows
          </p>
        </div>

        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="p-4 rounded-full bg-muted">
              <Construction className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Em breve
            </h2>
            <p className="text-muted-foreground max-w-md">
              Estamos trabalhando em uma nova experiência para criação de flyers.
              Fique ligado para novidades!
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
