import { Layout } from "@/components/layout/Layout";
import { Clock } from "lucide-react";

export default function Solicitacoes() {
  return (
    <Layout title="Solicitações" subtitle="Gerencie pedidos de contratação recebidos pelo seu link público">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Em breve disponível</h2>
        <p className="text-muted-foreground max-w-md">
          Estamos preparando essa funcionalidade para você. Em breve você poderá receber e gerenciar solicitações de contratação diretamente por aqui.
        </p>
      </div>
    </Layout>
  );
}