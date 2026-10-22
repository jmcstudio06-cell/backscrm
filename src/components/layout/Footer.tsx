import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-4">Backstage Pro</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Organize sua carreira musical com ferramentas profissionais.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><Link to="/planos" className="text-white/60 hover:text-white transition-colors text-sm">Planos</Link></li>
              <li><Link to="/planilha-cantores" className="text-white/60 hover:text-white transition-colors text-sm">Planilha para Cantores</Link></li>
              <li><Link to="/kit-profissional" className="text-white/60 hover:text-white transition-colors text-sm">Kit Profissional</Link></li>
              <li><a href="https://wa.me/5512992423317" className="text-white/60 hover:text-white transition-colors text-sm">Suporte</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/terms" className="text-white/60 hover:text-white transition-colors text-sm">Termos de Uso</a></li>
              <li><a href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">Política de Privacidade</a></li>
              <li><a href="/cookies" className="text-white/60 hover:text-white transition-colors text-sm">Cookies</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Siga-nos</h4>
            <div className="flex gap-4">
              <a href="https://twitter.com" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-white/60 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://github.com" className="text-white/60 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:contato@backstagepro.online" className="text-white/60 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {currentYear} Backstage Pro. Todos os direitos reservados.
          </p>
          <p className="text-white/50 text-sm">
            Feito com ❤️ para artistas
          </p>
        </div>
      </div>
    </footer>
  );
}
