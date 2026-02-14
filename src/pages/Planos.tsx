import { Users, Check, ShieldCheck, XCircle, Headphones } from "lucide-react";

export default function PricingSection() {
  const totalUsers = 77;

  const planUsage = {
    essencial: 18,
    profissional: 34,
    avancado: 25,
  };

  return (
    <section className="relative bg-black text-white py-20 overflow-hidden">
      {/* ===== OFERTA TOPO ===== */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl py-6 px-6 text-center shadow-lg">
          <h3 className="text-lg font-semibold">Oferta por tempo limitado</h3>
          <p className="text-sm opacity-90">Os valores podem voltar ao normal sem aviso prévio.</p>
        </div>
      </div>

      {/* ===== HEADER PRINCIPAL ===== */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-16">
        {/* Logo placeholder */}
        <div className="w-16 h-16 mx-auto mb-6 bg-zinc-800 rounded-2xl flex items-center justify-center">
          <span className="text-primary font-bold text-xl">BP</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-4">Organize sua carreira como uma empresa</h2>

        <p className="text-zinc-400 text-lg">Menos improviso. Mais controle. Escolha um plano e comece hoje.</p>

        <p className="text-sm text-zinc-500 mt-4">{totalUsers} artistas já utilizam a plataforma</p>
      </div>

      {/* ===== CARDS ===== */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
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
              <Check size={16} /> Agenda de Shows
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} /> Controle de Cachês
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} /> Gestão de Contratos
            </li>
          </ul>

          <button className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-medium transition">
            Escolher Plano
          </button>
        </div>

        {/* PROFISSIONAL */}
        <div className="relative bg-zinc-900 p-8 rounded-2xl border-2 border-primary scale-105 shadow-2xl">
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
              <Check size={16} /> Tudo do Essencial
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} /> Planejamento de Redes Sociais
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} /> Relatórios Financeiros
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} /> Aulas Exclusivas de Bônus
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
              <Check size={16} /> Tudo do Profissional
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} /> Suporte Prioritário
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} /> Mentoria Estratégica
            </li>
          </ul>

          <button className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-medium transition">
            Escolher Plano
          </button>
        </div>
      </div>

      {/* ===== RODAPÉ DE GARANTIA ===== */}
      <div className="max-w-5xl mx-auto mt-16 px-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl py-6 flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} />
            Pagamento 100% seguro
          </div>

          <div className="flex items-center gap-2">
            <XCircle size={18} />
            Cancele quando quiser
          </div>

          <div className="flex items-center gap-2">
            <Headphones size={18} />
            Suporte humano real
          </div>
        </div>
      </div>
    </section>
  );
}
