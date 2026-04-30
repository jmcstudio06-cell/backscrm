import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0066CC] via-[#0088DD] to-[#00B4D8]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-2xl font-bold text-white">Backstage</span>
          <span className="text-2xl font-bold text-cyan-300">Pro</span>
        </div>
        <Button 
          variant="ghost" 
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto rounded-2xl bg-white shadow-2xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Política de Privacidade</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Informações que Coletamos</h2>
              <p>Coletamos as seguintes informações:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Dados de cadastro:</strong> nome, email, telefone, cidade</li>
                <li><strong>Dados profissionais:</strong> shows, clientes, músicos, finanças</li>
                <li><strong>Dados de uso:</strong> como você interage com nossa plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Como Usamos suas Informações</h2>
              <p>Utilizamos seus dados para:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência</li>
                <li>Enviar comunicações importantes sobre sua conta</li>
                <li>Processar pagamentos e assinaturas</li>
                <li>Garantir a segurança da plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Compartilhamento de Dados</h2>
              <p>
                Não vendemos seus dados pessoais. Podemos compartilhar informações apenas com:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Processadores de pagamento para cobranças</li>
                <li>Serviços de infraestrutura (hospedagem, banco de dados)</li>
                <li>Autoridades legais quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Segurança dos Dados</h2>
              <p>
                Implementamos medidas de segurança para proteger suas informações, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Seus Direitos (LGPD)</h2>
              <p>De acordo com a Lei Geral de Proteção de Dados, você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incorretos ou desatualizados</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar a portabilidade dos dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Cookies</h2>
              <p>
                Utilizamos cookies para melhorar sua experiência, lembrar suas preferências e 
                analisar como você usa nossa plataforma. Você pode desabilitar cookies nas 
                configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Retenção de Dados</h2>
              <p>
                Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento da conta, 
                seus dados são retidos por 30 dias para permitir reativação, após o que são 
                permanentemente excluídos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças 
                significativas por email ou através do próprio serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Contato do DPO</h2>
              <p>
                Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato 
                conosco através do WhatsApp: 
                <a 
                  href="https://wa.me/5512991764910" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#0066CC] hover:underline ml-1"
                >
                  (12) 99154-5726
                </a>
              </p>
            </section>
          </div>

          <p className="text-sm text-slate-400 mt-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </main>
    </div>
  );
}
