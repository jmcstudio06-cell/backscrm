import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Termos() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0066CC] via-[#0088DD] to-[#00B4D8]">
      <Helmet>
        <title>Termos de Uso — Backstage Pro</title>
        <meta name="description" content="Termos e condições de uso do Backstage Pro: regras de assinatura, conta, pagamentos e responsabilidades da plataforma." />
        <link rel="canonical" href="https://backstagepro.online/termos" />
        <meta property="og:title" content="Termos de Uso — Backstage Pro" />
        <meta property="og:description" content="Regras de uso, assinatura e responsabilidades do Backstage Pro." />
        <meta property="og:url" content="https://backstagepro.online/termos" />
      </Helmet>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Termos de Uso</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar o Backstage Pro, você concorda com estes Termos de Uso e nossa Política de Privacidade. 
                Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Descrição do Serviço</h2>
              <p>
                O Backstage Pro é uma plataforma de gestão para artistas e músicos que permite:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Gerenciamento de agenda de shows e eventos</li>
                <li>Controle financeiro (receitas e despesas)</li>
                <li>Gestão de clientes e leads (CRM)</li>
                <li>Organização de equipe e músicos</li>
                <li>Geração de contratos e orçamentos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Conta de Usuário</h2>
              <p>
                Para usar o serviço, você deve criar uma conta fornecendo informações precisas e completas. 
                Você é responsável por manter a confidencialidade de sua senha e por todas as atividades 
                realizadas em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Uso Aceitável</h2>
              <p>Você concorda em não:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Usar o serviço para fins ilegais</li>
                <li>Compartilhar sua conta com terceiros</li>
                <li>Tentar acessar áreas não autorizadas do sistema</li>
                <li>Enviar conteúdo malicioso ou prejudicial</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo e funcionalidades do Backstage Pro são propriedade da plataforma e 
                protegidos por leis de direitos autorais. Você retém a propriedade de todos os dados 
                que você inserir no sistema.
              </p>
              <p className="mt-2">
                A marca <strong>Backstage Pro®</strong> é uma marca registrada, com registro de marca
                mantido pela empresa, titularidade registrada por Jose Mario Campos, CNPJ 69.458.195/0001-14.
                O uso do nome, logotipo e identidade visual sem autorização expressa não é permitido.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Planos e Pagamentos</h2>
              <p>
                O Backstage Pro oferece diferentes planos de assinatura. Os preços e recursos de cada 
                plano estão disponíveis em nossa página de planos. Pagamentos são processados de forma 
                segura através de nossos parceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Cancelamento</h2>
              <p>
                Você pode cancelar sua assinatura a qualquer momento. Após o cancelamento, você terá 
                acesso ao serviço até o final do período já pago.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Limitação de Responsabilidade</h2>
              <p>
                O Backstage Pro não se responsabiliza por perdas ou danos indiretos resultantes do uso 
                do serviço. Nosso serviço é fornecido "como está" sem garantias de qualquer tipo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Alterações nos Termos</h2>
              <p>
                Podemos atualizar estes termos periodicamente. Notificaremos você sobre mudanças 
                significativas por email ou através do próprio serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Contato</h2>
              <p>
                Para dúvidas sobre estes termos, entre em contato conosco através do WhatsApp: 
                <a 
                  href="https://wa.me/5512991764910" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#0066CC] hover:underline ml-1"
                >
                  (12) 99154-5726
                </a>
              </p>
              <p className="mt-2">
                Backstage Pro — CNPJ 69.458.195/0001-14. Marca registrada, titularidade registrada por Jose Mario Campos.
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
