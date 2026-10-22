import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-background via-violet-950/10 to-violet-950/20">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 p-12 sm:p-16 backdrop-blur-sm text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Pronto para transformar sua carreira?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Junte-se a milhares de artistas que já estão usando Backstage Pro para organizar sua vida profissional e crescer mais rápido.
          </p>

          {/* Benefits list */}
          <div className="space-y-3 mb-10 text-left inline-block">
            {[
              "7 dias de teste completamente grátis",
              "Sem cartão de crédito necessário",
              "Acesso a todas as funcionalidades",
              "Cancele a qualquer momento sem penalidades",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white/80">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-lg py-7 px-10 rounded-xl shadow-2xl hover:shadow-3xl transition-all">
              Comece seu teste gratuito
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          <p className="text-sm text-white/50 mt-6">
            Temos suporte em português. Entre em contato a qualquer momento.
          </p>
        </div>
      </div>
    </section>
  );
}
