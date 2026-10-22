import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/landing-v2/HeroSection";
import { FeaturesSection } from "@/components/landing-v2/FeaturesSection";
import { SocialProofSection } from "@/components/landing-v2/SocialProofSection";
import { PlansSection } from "@/components/landing-v2/PlansSection";
import { FAQSection } from "@/components/landing-v2/FAQSection";
import { CTASection } from "@/components/landing-v2/CTASection";
import { Footer } from "@/components/layout/Footer";

export default function LandingV2() {
  return (
    <>
      <Helmet>
        <title>Backstage Pro - Organize sua carreira musical</title>
        <meta
          name="description"
          content="Agenda, cachês, contratos e contatos em um só lugar. Tudo sincronizado para sua carreira musical."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="Backstage Pro - Organize sua carreira musical" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
      </Helmet>

      <div className="min-h-screen bg-background overflow-hidden">
        {/* Navigation - sticky header */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-xl">
              <img src="/favicon.png" alt="Backstage Pro" className="w-8 h-8" />
              <span>Backstage Pro</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-white/60 hover:text-white transition-colors">Recursos</a>
              <a href="#social" className="text-white/60 hover:text-white transition-colors">Depoimentos</a>
              <a href="#planos" className="text-white/60 hover:text-white transition-colors">Planos</a>
              <a href="#faq" className="text-white/60 hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="pt-20">
          <HeroSection />
          <FeaturesSection />
          <SocialProofSection />
          <PlansSection />
          <FAQSection />
          <CTASection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
