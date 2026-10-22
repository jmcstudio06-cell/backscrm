import { CalendarDays, Wallet, FileText, Users, MapPin, Music2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: CalendarDays,
    title: "Agenda de shows",
    description: "Datas, horários e combinados sempre à mão com sincronização em tempo real.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Wallet,
    title: "Financeiro completo",
    description: "Acompanhe cachês, despesas e rentabilidade de cada apresentação.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FileText,
    title: "Contratos automáticos",
    description: "Gere contratos e orçamentos profissionais em segundos.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Gestão de equipe",
    description: "Organize músicos, funções e pagamentos por show.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: MapPin,
    title: "Backs Radar",
    description: "Encontre oportunidades em bares, restaurantes e casas de show.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Music2,
    title: "E muito mais",
    description: "Repertório, metas, mapa de palco, links profissionais e muito mais.",
    color: "from-pink-500 to-rose-500",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-white/5 border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-400 mb-4 uppercase tracking-wider">
            Tudo que você precisa
          </p>
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Ferramentas profissionais para sua carreira
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Um conjunto completo de recursos construído especificamente para artistas que querem crescer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-2xl pointer-events-none transition-opacity" />

                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>

                <ArrowRight className="w-5 h-5 mt-4 text-white/40 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-lg text-white/60 mb-6">
            Explore todos os recursos e comece seu teste gratuito
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold">
              Comece agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
