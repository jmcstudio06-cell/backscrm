import { Layout } from "@/components/layout/Layout";
import { LinksConfigSection } from "@/components/configuracoes/LinksConfigSection";
import { Instagram } from "lucide-react";

export default function LinkInstagramConfig() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 flex items-center justify-center text-white shadow-md">
            <Instagram className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Links Públicos</h1>
            <p className="text-sm text-muted-foreground">
              Configure seu Link Agenda e Link Instagram (Press Kit)
            </p>
          </div>
        </div>

        <LinksConfigSection />
      </div>
    </Layout>
  );
}
