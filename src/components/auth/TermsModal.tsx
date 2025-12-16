import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "terms" | "privacy";
}

export function TermsModal({ open, onOpenChange, type }: TermsModalProps) {
  const isTerms = type === "terms";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isTerms ? "Termos de Uso" : "Política de Privacidade"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {isTerms ? (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">Última atualização: Dezembro de 2024</p>
              
              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">1. Aceitação dos Termos</h3>
                <p>Ao acessar e usar o Backstage Pro, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">2. Descrição do Serviço</h3>
                <p>O Backstage Pro é uma plataforma de gestão para artistas e músicos que oferece funcionalidades como gerenciamento de shows, controle financeiro, CRM de vendas e gestão de equipe.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">3. Conta do Usuário</h3>
                <p>Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em notificar imediatamente o Backstage Pro sobre qualquer uso não autorizado de sua conta.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">4. Uso Aceitável</h3>
                <p>Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos. É proibido usar o serviço para qualquer atividade ilegal ou não autorizada.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">5. Pagamento e Assinatura</h3>
                <p>Alguns recursos do Backstage Pro requerem uma assinatura paga. Os preços e condições de pagamento estão disponíveis na página de planos.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">6. Propriedade Intelectual</h3>
                <p>Todo o conteúdo do Backstage Pro, incluindo textos, gráficos, logos e software, é propriedade do Backstage Pro e protegido por leis de propriedade intelectual.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">7. Limitação de Responsabilidade</h3>
                <p>O Backstage Pro não será responsável por quaisquer danos indiretos, incidentais, especiais ou consequentes resultantes do uso ou incapacidade de uso do serviço.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">8. Modificações</h3>
                <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">9. Contato</h3>
                <p>Para questões sobre estes Termos de Uso, entre em contato conosco através do WhatsApp ou e-mail disponíveis no aplicativo.</p>
              </section>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">Última atualização: Dezembro de 2024</p>
              
              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">1. Informações que Coletamos</h3>
                <p>Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone e dados relacionados à sua atividade artística.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">2. Como Usamos suas Informações</h3>
                <p>Utilizamos suas informações para fornecer e melhorar nossos serviços, processar transações, enviar comunicações importantes e personalizar sua experiência.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">3. Compartilhamento de Dados</h3>
                <p>Não vendemos suas informações pessoais. Podemos compartilhar dados com prestadores de serviços que nos auxiliam na operação da plataforma, sempre sob obrigações de confidencialidade.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">4. Segurança dos Dados</h3>
                <p>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração ou destruição.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">5. Seus Direitos</h3>
                <p>Você tem direito de acessar, corrigir, excluir ou exportar seus dados pessoais. Para exercer esses direitos, entre em contato conosco.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">6. Cookies</h3>
                <p>Utilizamos cookies e tecnologias similares para melhorar a funcionalidade do site e analisar o uso do serviço.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">7. Retenção de Dados</h3>
                <p>Mantemos suas informações enquanto sua conta estiver ativa ou conforme necessário para fornecer nossos serviços e cumprir obrigações legais.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">8. Alterações nesta Política</h3>
                <p>Podemos atualizar esta política periodicamente. Notificaremos você sobre alterações significativas através do aplicativo ou por e-mail.</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-foreground">9. Contato</h3>
                <p>Para dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco através dos canais disponíveis no aplicativo.</p>
              </section>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
