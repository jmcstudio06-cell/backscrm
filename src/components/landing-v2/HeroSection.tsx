import { ArrowRight, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-gradient-to-b from-violet-950/30 via-background to-background">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <p className="text-sm font-semibold text-violet-400 mb-4 uppercase tracking-wider">
                ✨ Para Artistas que Querem Controle
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
                Sua carreira,{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  completamente organizada
                </span>
              </h1>
              <p className="text-xl text-white/70 max-w-xl leading-relaxed">
                Agenda, cachês, contratos e contatos. Tudo sincronizado. Do primeiro convite ao próximo sucesso.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-lg py-6 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all w-full sm:w-auto">
                  Comece grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/20 hover:bg-white/10 font-bold text-lg py-6 px-8 rounded-xl w-full sm:w-auto"
                onClick={() => {
                  // Play video modal
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm text-white/70">7 dias de teste grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm text-white/70">Sem cartão necessário</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm text-white/70">Cancelar a qualquer hora</span>
              </div>
            </div>
          </div>

          {/* Right - Visual mockup */}
          <div className="hidden lg:block relative h-full min-h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-3xl border border-violet-500/30 backdrop-blur-sm animate-pulse"></div>
            <div className="relative p-8 space-y-4">
              {/* Mock dashboard preview */}
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-lg border border-white/10"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
