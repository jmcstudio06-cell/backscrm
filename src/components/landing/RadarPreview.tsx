import { useEffect, useRef, useState } from "react";
import {
  Beer,
  Check,
  Hotel,
  Loader2,
  MapPin,
  MessageCircle,
  Mic2,
  Minus,
  Navigation,
  Phone,
  Plus,
  Radar,
  Search,
  Sparkles,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Demonstração do Backs Radar para a landing pública.
 * Somente apresentação: não lê nem grava dados da conta, não chama o servidor
 * e todo o conteúdo dos resultados é genérico (nenhum estabelecimento real).
 */

const CATEGORIES = [
  { key: "bares", label: "Bares", type: "bar", icon: Beer },
  { key: "restaurantes", label: "Restaurantes", type: "restaurante", icon: UtensilsCrossed },
  { key: "hoteis", label: "Hotéis", type: "hotel", icon: Hotel },
  { key: "casas_de_show", label: "Casas de show", type: "casa de show", icon: Mic2 },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

// Mesmo limite do app: até 5 cidades por pesquisa.
const MAX_CITIES = 5;

function cityLabel(index: number) {
  return index === 0 ? "Sua cidade" : `Cidade vizinha ${index}`;
}

export function RadarPreview() {
  const [selected, setSelected] = useState<CategoryKey[]>(CATEGORIES.map((c) => c.key));
  const [cityCount, setCityCount] = useState(1);
  const [status, setStatus] = useState<"idle" | "searching" | "done">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const resetResults = () => {
    window.clearTimeout(timer.current);
    setStatus("idle");
  };

  const toggleCategory = (key: CategoryKey) => {
    resetResults();
    setSelected((current) => {
      if (current.includes(key)) {
        // Como no app, ao menos uma categoria precisa ficar marcada.
        return current.length === 1 ? current : current.filter((k) => k !== key);
      }
      return [...current, key];
    });
  };

  const changeCities = (delta: number) => {
    resetResults();
    setCityCount((count) => Math.min(MAX_CITIES, Math.max(1, count + delta)));
  };

  const search = () => {
    if (status === "searching") return;
    setStatus("searching");
    timer.current = window.setTimeout(() => setStatus("done"), 700);
  };

  const chosen = CATEGORIES.filter((c) => selected.includes(c.key));

  return (
    <div className="rl-preview">
      <div className="rl-preview-bar" aria-hidden="true">
        <span className="rl-dots"><i /><i /><i /></span>
        <span className="rl-preview-title"><Radar /> Backs Radar</span>
        <span className="rl-preview-badge">Demonstração</span>
      </div>

      <div className="rl-preview-body">
        <div className="rl-controls">
          <div className="rl-controls-head">
            <span className="rl-tile"><Radar /></span>
            <div>
              <h3>Radar de contatos</h3>
              <p>Escolha as cidades e categorias, depois pesquise.</p>
            </div>
          </div>

          <div className="rl-group">
            <span className="rl-label">Seu CEP <b>✓ configurado</b></span>
            <div className="rl-fake-input"><Navigation aria-hidden="true" /> 00000-000</div>
            <p className="rl-base"><MapPin aria-hidden="true" /> Sua cidade / UF</p>
          </div>

          <div className="rl-group">
            <span className="rl-label" id="rl-cities-label">Cidades para buscar</span>
            <div className="rl-stepper" role="group" aria-labelledby="rl-cities-label">
              <button
                type="button"
                onClick={() => changeCities(-1)}
                disabled={cityCount === 1}
                aria-label="Remover uma cidade"
              >
                <Minus aria-hidden="true" />
              </button>
              <span aria-live="polite">
                <strong>{cityCount}</strong> de {MAX_CITIES} cidades
              </span>
              <button
                type="button"
                onClick={() => changeCities(1)}
                disabled={cityCount === MAX_CITIES}
                aria-label="Adicionar uma cidade"
              >
                <Plus aria-hidden="true" />
              </button>
            </div>
            <div className="rl-city-chips" aria-hidden="true">
              {Array.from({ length: cityCount }, (_, i) => (
                <span key={i} className={cn(i === 0 && "is-base")}>{cityLabel(i)}</span>
              ))}
            </div>
          </div>

          <div className="rl-group">
            <span className="rl-label" id="rl-cats-label">Categoria</span>
            <div className="rl-cats" role="group" aria-labelledby="rl-cats-label">
              {CATEGORIES.map(({ key, label, icon: Icon }) => {
                const active = selected.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCategory(key)}
                    className={cn("rl-cat", active && "is-active")}
                  >
                    <Icon aria-hidden="true" />
                    {label}
                    {active && <Check className="rl-cat-check" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" className="lp-btn lp-btn-primary rl-search" onClick={search} disabled={status === "searching"}>
            {status === "searching" ? (
              <>
                <Loader2 className="rl-spin" aria-hidden="true" /> Buscando em {cityCount} cidade{cityCount > 1 ? "s" : ""}...
              </>
            ) : (
              <>
                <Search aria-hidden="true" /> Pesquisar
              </>
            )}
          </button>
        </div>

        <div className="rl-results" aria-live="polite">
          {status !== "done" ? (
            <div className="rl-empty">
              <span className="rl-empty-radar"><Radar /></span>
              <strong>{status === "searching" ? "Procurando oportunidades..." : "Pronto para explorar!"}</strong>
              <p>
                {status === "searching"
                  ? "Estamos montando um exemplo com as suas escolhas."
                  : "Adicione cidades vizinhas, escolha as categorias e pressione Pesquisar."}
              </p>
            </div>
          ) : (
            <>
              <p className="rl-results-head">
                <Sparkles aria-hidden="true" />
                <span>
                  Exemplo ilustrativo em <b>{cityCount}</b> cidade{cityCount > 1 ? "s" : ""}
                </span>
              </p>
              <div className="rl-cards">
                {chosen.map((category, i) => {
                  const Icon = category.icon;
                  return (
                    <article key={category.key} className="rl-card">
                      <div className="rl-card-top">
                        <span className="rl-card-icon"><Icon aria-hidden="true" /></span>
                        <div>
                          <h4>Nome do estabelecimento</h4>
                          <p>
                            <span>{category.type}</span>
                            <em>{cityLabel(i % cityCount)}</em>
                          </p>
                        </div>
                      </div>
                      <ul>
                        <li><MapPin aria-hidden="true" /> Rua de exemplo, 000</li>
                        <li><Phone aria-hidden="true" /> (00) 00000-0000</li>
                      </ul>
                      <div className="rl-card-actions" aria-hidden="true">
                        <span className="is-wa"><MessageCircle /> WhatsApp</span>
                        <span className="is-map"><MapPin /> Mapa</span>
                        <span className="is-crm"><UserPlus /> Enviar ao CRM</span>
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="rl-results-note">
                Dados de demonstração, apenas para mostrar o formato. No app, os resultados vêm da sua região.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
