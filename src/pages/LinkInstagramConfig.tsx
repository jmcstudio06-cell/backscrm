import { Layout } from "@/components/layout/Layout";
import { LinksConfigSection } from "@/components/configuracoes/LinksConfigSection";

export default function LinkInstagramConfig() {
  return (
    <Layout title="Links Públicos" subtitle="Configure seu Link Agenda e Link Instagram (Press Kit)">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <LinksConfigSection />
      </div>
    </Layout>
  );
}
