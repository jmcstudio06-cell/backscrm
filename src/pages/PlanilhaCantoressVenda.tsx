import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CalendarDays, Check, CircleCheck, CreditCard, FileSpreadsheet, FileText, Infinity as InfinityIcon, Loader2, Music2, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-azul.png";
import kitPlanilha from "@/assets/kit-planilha.png";

const CHECKOUT_URL = "https://checkout.infinitepay.io/backstageprooficial/Vw3hOE2C8z";
const ORIGINAL_PRICE = 39.90;
const SALE_PRICE = 14.90;
const DISCOUNT_PERCENT = Math.round(((ORIGINAL_PRICE - SALE_PRICE) / ORIGINAL_PRICE) * 100);
const brl = (value: number) => `R$${value.toFixed(2).replace(".", ",")}`;

const benefits = [
  { icon: CalendarDays, title: "Seus shows, em ordem", description: "Organize apresentações, datas e compromissos sem depender de anotações espalhadas." },
  { icon: Wallet, title: "Cachês sob controle", description: "Acompanhe o valor de cada apresentação e tenha mais clareza sobre seus ganhos." },
  { icon: BarChart3, title: "Veja seus resultados", description: "Dashboards visuais para acompanhar o financeiro e tomar decisões com mais informação." },
  { icon: CreditCard, title: "Despesas no lugar certo", description: "Registre os custos da sua rotina musical e entenda para onde vai o dinheiro." },
  { icon: FileText, title: "Relatórios prontos", description: "Consulte os resultados da sua carreira em uma visão organizada, sem começar do zero." },
  { icon: FileSpreadsheet, title: "Do seu jeito", description: "Uma planilha editável para adaptar à sua rotina, no Excel ou no Google Sheets." },
];
const faqs = [
  { question: "Preciso pagar todo mês?", answer: "Não. A planilha tem pagamento único de R$14,90 e acesso vitalício. A assinatura do aplicativo Backstage Pro é um produto separado." },
  { question: "Onde posso usar a planilha?", answer: "No Excel ou no Google Sheets. Você pode editar a planilha e adaptar os controles à sua rotina de shows." },
  { question: "Como faço a compra?", answer: "O botão de compra leva ao checkout da InfinitePay. Confira os dados e o valor na página de pagamento antes de finalizar." },
  { question: "A planilha é o aplicativo Backstage Pro?", answer: "Não. A planilha é um material para organizar shows, cachês e despesas. O Backstage Pro é o aplicativo completo, com agenda, contatos, contratos e recursos disponíveis conforme o plano." },
  { question: "Já sou cliente do Backstage Pro. Preciso comprar?", answer: "Se você já tem acesso à planilha pelo Backstage Pro, não precisa comprá-la novamente. Acesse o aplicativo para consultar seus materiais." },
];

export default function PlanilhaCantoressVenda() {
  const { user, loading: authLoading } = useAuth();
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    if (authLoading) return;
    setLoading(true);
    setUserPlan(null);
    if (!user) { setLoading(false); return; }
    const fetchPlan = async () => {
      try {
        const { data } = await supabase.from("profiles").select("plan").eq("user_id", user.id).single();
        if (active) setUserPlan(data?.plan || null);
      } catch (error) { console.error("Erro ao buscar plano:", error); }
      finally { if (active) setLoading(false); }
    };
    void fetchPlan();
    return () => { active = false; };
  }, [user, authLoading]);
  const hasPlan = Boolean(userPlan && userPlan !== "free");
  const checking = loading || authLoading;
  const purchaseButton = () => hasPlan ? (
    <Button asChild className="sheet-buy"><Link to="/dashboard"><CircleCheck /> Acessar meu Backstage Pro <ArrowRight /></Link></Button>
  ) : (
    <Button className="sheet-buy" disabled={checking} onClick={() => { window.location.href = CHECKOUT_URL; }}>
      {checking ? <><Loader2 className="animate-spin" /> Carregando…</> : <><FileSpreadsheet /> Quero minha planilha <ArrowRight /></>}
    </Button>
  );

  return (
    <div className="spreadsheet-sales min-h-screen">
      <header className="sheet-header">
        <div className="sheet-container flex items-center justify-between gap-4">
          <Link to="/landing" aria-label="Backstage Pro — página inicial"><img src={logo} alt="Backstage Pro" className="w-36 sm:w-44 h-auto" /></Link>
          <Button asChild variant="ghost" className="text-primary"><a href="#oferta">Ver oferta <ArrowRight /></a></Button>
        </div>
      </header>
      <main>
        <section className="sheet-hero" id="oferta">
          <div className="sheet-container sheet-hero-grid">
            <div>
              <p className="sheet-eyebrow"><Music2 className="size-4" /> Um novo ritmo para sua organização</p>
              <h1 className="sheet-title">Planilha de controle <span>do artista.</span></h1>
              <p className="text-lg text-muted-foreground max-w-lg">Shows, cachês e despesas no mesmo lugar. Menos contas soltas, mais clareza para cuidar da sua carreira.</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-6 mb-7 text-sm font-semibold">
                {["Pronta para usar", "100% editável", "Pagamento único"].map(item => <li key={item} className="flex items-center gap-2"><Check className="size-4 text-primary" />{item}</li>)}
              </ul>
              <div className="max-w-md border-t border-border pt-6">
                {hasPlan ? <p className="font-semibold mb-4">Você já tem acesso ao Backstage Pro.</p> : <>
                  <div className="flex flex-wrap gap-3 items-center mb-2"><span className="text-muted-foreground">De <s>{brl(ORIGINAL_PRICE)}</s> por</span><span className="bg-secondary text-primary font-bold text-sm px-3 py-1 rounded-md">{DISCOUNT_PERCENT}% de desconto</span></div>
                  <p className="sheet-price">{brl(SALE_PRICE)}</p>
                  <p className="text-muted-foreground text-sm mt-2 mb-5">Uma única compra. Acesso vitalício.</p>
                </>}
                {purchaseButton()}
                <p className="flex justify-center items-center gap-2 text-sm text-muted-foreground mt-3"><ShieldCheck className="size-4" />{hasPlan ? "Consulte seus materiais no aplicativo" : "Pagamento pelo checkout da InfinitePay"}</p>
              </div>
            </div>
            <div>
              <img src={kitPlanilha} alt="Planilha de controle do artista: shows, gestão financeira, dashboards e relatórios" className="sheet-art" />
              <p className="sheet-image-caption"><FileSpreadsheet className="size-4" /> Excel e Google Sheets · Edite e faça do seu jeito</p>
            </div>
          </div>
        </section>
        <div className="border-y border-border bg-card">
          <div className="sheet-container grid grid-cols-1 sm:grid-cols-3 gap-5 py-6">
            {[{ icon: InfinityIcon, title: "Sua, sem mensalidade", text: "Pague uma vez, use sempre." }, { icon: FileSpreadsheet, title: "Sem começar do zero", text: "Controles prontos para sua rotina." }, { icon: Music2, title: "Feita para artistas", text: "O financeiro acompanha seus shows." }].map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3"><Icon className="size-6 text-primary shrink-0" /><div><p className="font-bold">{title}</p><p className="text-sm text-muted-foreground">{text}</p></div></div>)}
          </div>
        </div>
        <section className="sheet-section">
          <div className="sheet-container">
            <p className="sheet-eyebrow mb-3"><Sparkles className="size-4" /> Mais controle. Menos improviso.</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"><h2 className="sheet-heading max-w-lg">A organização que sua<br className="hidden sm:block" /> carreira merece.</h2><p className="text-muted-foreground max-w-sm">Você cuida do palco. A planilha ajuda a colocar os bastidores em ordem.</p></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{benefits.map(({ icon: Icon, title, description }) => <article key={title} className="sheet-benefit"><div className="sheet-icon"><Icon className="size-5" /></div><h3 className="font-bold text-lg mt-4 mb-2">{title}</h3><p className="text-muted-foreground">{description}</p></article>)}</div>
          </div>
        </section>
        <section className="bg-secondary sheet-section">
          <div className="sheet-container">
            <h2 className="sheet-heading mb-8">Seu próximo show, mais organizado.</h2>
            <div className="grid md:grid-cols-3 gap-8">{[{ title: "Garanta sua planilha", text: "Finalize sua compra pelo checkout da InfinitePay." }, { title: "Prepare seus controles", text: "Abra no Excel ou no Google Sheets e adapte à sua rotina." }, { title: "Acompanhe sua carreira", text: "Registre shows, cachês e despesas para visualizar seus resultados." }].map((step, index) => <div key={step.title} className="border-t border-border pt-5"><span className="text-primary font-bold text-sm">0{index + 1}</span><h3 className="font-bold text-xl my-2">{step.title}</h3><p className="text-muted-foreground">{step.text}</p></div>)}</div>
          </div>
        </section>
        <section className="sheet-upsell">
          <div className="sheet-container grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div><p className="sheet-eyebrow mb-4"><Sparkles className="size-4" /> Quer ir além da planilha?</p><h2 className="sheet-heading">Seu escritório de artista.<br />Isso é Backstage Pro.</h2><p className="mt-5 text-lg opacity-90 max-w-lg">Transforme a organização em gestão de carreira: agenda, financeiro, contatos e contratos conectados em um só aplicativo.</p><div className="flex flex-wrap gap-3 mt-7"><Button asChild className="sheet-trial"><Link to="/auth">Testar grátis <ArrowRight /></Link></Button><Button asChild variant="link" className="text-primary-foreground"><Link to="/planos">Conhecer os planos <ArrowRight /></Link></Button></div></div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">{[{ icon: CalendarDays, title: "Agenda de shows", text: "Compromissos e status organizados." }, { icon: Wallet, title: "Gestão financeira", text: "Cachês e despesas acompanhados." }, { icon: FileText, title: "Contratos e orçamentos", text: "Mais profissionalismo na negociação." }, { icon: Music2, title: "Backs Radar", text: "Oportunidades no plano Executivo." }].map(({ icon: Icon, title, text }) => <div key={title}><Icon className="size-6 mb-3" /><h3 className="font-bold text-lg">{title}</h3><p className="opacity-90 text-sm mt-1">{text}</p></div>)}</div>
          </div>
        </section>
        <section className="sheet-section">
          <div className="sheet-container grid md:grid-cols-[.8fr_1.2fr] gap-8 md:gap-16"><div><p className="sheet-eyebrow mb-3">Antes de começar</p><h2 className="sheet-heading">Tudo certo?<br />Tire suas dúvidas.</h2></div><Accordion type="single" collapsible>{faqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`} className="sheet-faq-item"><AccordionTrigger className="text-left text-base font-semibold py-5 hover:text-primary hover:no-underline">{faq.question}</AccordionTrigger><AccordionContent className="text-muted-foreground text-base leading-relaxed">{faq.answer}</AccordionContent></AccordionItem>)}</Accordion></div>
        </section>
        <section className="bg-secondary border-y border-border py-12">
          <div className="sheet-container flex flex-col md:flex-row items-start md:items-center justify-between gap-6"><div><h2 className="text-2xl font-bold">Mais música. Menos contas espalhadas.</h2><p className="text-muted-foreground mt-2">{hasPlan ? "Continue organizando sua carreira no Backstage Pro." : `Comece com sua planilha por ${brl(SALE_PRICE)}, sem mensalidade.`}</p></div><div className="w-full md:w-80 shrink-0">{purchaseButton()}</div></div>
        </section>
      </main>
      <footer className="sheet-container flex flex-col sm:flex-row justify-between gap-4 py-8 text-sm text-muted-foreground"><p>Backstage Pro · Feito para artistas.</p><nav className="flex gap-5"><Link to="/termos" className="hover:text-primary">Termos de uso</Link><Link to="/privacidade" className="hover:text-primary">Privacidade</Link></nav></footer>
    </div>
  );
}
