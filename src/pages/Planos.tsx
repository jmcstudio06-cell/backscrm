import { Users, Check } from "lucide-react";

const totalUsers = 77;

const planUsage = {
  essencial: 18,
  profissional: 34,
  avancado: 25,
};

export default function PricingSection() {
  return (
    <section className="relative py-20 bg-black text-white overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black opacity-60" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Título */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">Escolha o plano ideal para sua carreira</h2>
          <p className="text-zinc-400">Hoje já são {totalUsers} artistas usando a plataforma</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* ESSENCIAL */}
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition">
            <h3 className="text-xl font-semibold mb-2">Essencial</h3>

            <div className="text-3xl font-bold mb-4">R$ 59,90</div>

            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
              <Users size={16} />
              <span>{planUsage.essencial} artistas usam este plano</span>
            </div>

            <ul className="space-y-3 text-sm text-zinc-300 mb-8">
              <li className="flex items-center gap-2">
                <Check size={16} />
                Agenda de Shows
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} />
                Controle de Cachês
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} />
                Gestão de Contratos
              </li>
            </ul>

            <button className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-medium transition">
              Escolher Plano
            </button>
          </div>

          {/* PROFISSIONAL */}
          <div className="bg-zinc-900 p-8 rounded-2xl border-2 border-primary relative scale-105 shadow-2xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-semibold px-4 py-1 rounded-full">
              MAIS ESCOLHIDO
            </div>

            <h3 className="text-xl font-semibold mb-2">Profissional</h3>

            <div className="text-3xl font-bold mb-4">
              R$ 49,90 <span className="text-sm font-normal">3x</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-primary font-medium mb-6">
              <Users size={16} />
              <span>{planUsage.profissional} artistas escolheram este plano</span>
            </div>

            <ul className="space-y-3 text-sm text-zinc-300 mb-8">
              <li className="flex items-center gap-2">
                <Check size={16} />
                Tudo do Essencial
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} />
                Planejamento de Redes Sociais
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} />
                Relatórios Financeiros
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} />
                Aulas Exclusivas de Bônus
              </li>
            </ul>

            <button className="w-full bg-primary text-black hover:opacity-90 py-3 rounded-xl font-semibold transition">
              Começar Agora
            </button>
          </div>

          {/* AVANÇADO */}
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition">
            <h3 className="text-xl font-semibold mb-2">Avançado</h3>

            <div className="text-3xl font-bold mb-4">
              R$ 39,90 <span className="text-sm font-normal">6x</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
              <Users size={16} />
              <span>{planUsage.avancado} artistas usam este plano</span>
            </div>

            <ul className="space-y-3 text-sm text-zinc-300 mb-8">
              <li className="flex items-center gap-2">
                <Check size={16} />
                Tudo do Profissional
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} />
                Suporte Prioritário
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} />
                Mentoria Estratégica
              </li>
            </ul>

            <button className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-medium transition">
              Escolher Plano
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
