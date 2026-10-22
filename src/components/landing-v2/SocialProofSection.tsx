import { Star, Quote } from "lucide-react";
import larissaGoogle from "@/assets/testimonials/larissa-google.png";
import marceloGoogle from "@/assets/testimonials/marcelo-google.png";
import fabioGoogle from "@/assets/testimonials/fabio-google.png";

const testimonials = [
  {
    name: "Larissa Santos",
    role: "Produtora • Cantora",
    image: larissaGoogle,
    text: "Organizei toda minha operação comercial em um só lugar. Agora vejo cada centavo que ganho em cada show.",
    rating: 5,
  },
  {
    name: "Marcelo Cantor",
    role: "Músico Profissional",
    image: marceloGoogle,
    text: "A forma que o app mostra os dados deixa tudo claro. Finalmente entendo meu próprio negócio.",
    rating: 5,
  },
  {
    name: "Fábio Martins",
    role: "Professor • Viverarte Violão",
    image: fabioGoogle,
    text: "Contratos automáticos? Cachês organizados? O Backstage Pro mudou como faço meu trabalho.",
    rating: 5,
  },
];

export function SocialProofSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-400 mb-4 uppercase tracking-wider">
            Confiado por artistas
          </p>
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Veja quem já está transformando sua carreira
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Centenas de artistas já usam Backstage Pro para organizar sua vida profissional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="relative p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/5 hover:border-violet-500/50 hover:bg-white/10 transition-all duration-300 group"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-violet-400/40 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/20"
                />
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-white/60">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { number: "5k+", label: "Artistas ativos" },
            { number: "4.9★", label: "Avaliação média" },
            { number: "50k+", label: "Shows organizados" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <p className="text-white/60 text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
