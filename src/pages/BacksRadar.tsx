import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useLeads } from "@/hooks/useLeads";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Radar,
  Search,
  Loader2,
  Phone,
  Globe,
  MapPin,
  Star,
  MessageCircle,
  UserPlus,
  Sparkles,
  Beer,
  UtensilsCrossed,
  Hotel,
  Disc3,
  Mic2,
  PartyPopper,
  Lock,
  Crown,
  Navigation,
  CheckCircle2,
  Info,
} from "lucide-react";

interface RadarPlace {
  place_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  rating_count: number | null;
  place_type: string | null;
  maps_uri: string | null;
}

const CATEGORIES = [
  { key: "bares", label: "Bares", icon: Beer },
  { key: "restaurantes", label: "Restaurantes", icon: UtensilsCrossed },
  { key: "hoteis", label: "Hotéis", icon: Hotel },
  { key: "casas_noturnas", label: "Casas noturnas", icon: Disc3 },
  { key: "casas_de_show", label: "Casas de show", icon: Mic2 },
  { key: "buffets", label: "Buffets e eventos", icon: PartyPopper },
];

const RADII = [
  { km: 10, label: "10 km" },
  { km: 25, label: "25 km" },
  { km: 50, label: "50 km" },
  { km: 100, label: "100 km" },
];

function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

function formatCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export default function BacksRadar() {
  const { addLead } = useLeads();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { isBlocked, loading: blocksLoading } = useFeatureBlocks();
  const navigate = useNavigate();

  const locked = !blocksLoading && isBlocked("backs-radar");

  // CEP já configurado anteriormente?
  const isConfigured = !!(profile?.radar_cep && profile?.radar_city && profile?.radar_state);

  // Estado local do CEP (só editável na primeira configuração)
  const [cepInput, setCepInput] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [savingRegion, setSavingRegion] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState<{ city: string; state: string } | null>(null);

  // Estado de busca
  const [radius, setRadius] = useState(25);
  const [category, setCategory] = useState("bares");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<RadarPlace[] | null>(null);
  const [lockedCount, setLockedCount] = useState<number | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Quando o perfil carrega e já tem região configurada, usa o CEP salvo
  useEffect(() => {
    if (isConfigured && profile) {
      setResolvedLocation({ city: profile.radar_city!, state: profile.radar_state! });
    }
  }, [isConfigured, profile]);

  // Preview automático do CEP enquanto digita (só na primeira configuração)
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isConfigured) return; // travado
    const formatted = formatCep(e.target.value);
    setCepInput(formatted);
    setResolvedLocation(null);

    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 8) {
      previewCep(digits);
    }
  };

  const previewCep = async (digits: string) => {
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data?.erro) {
        toast.error("CEP não encontrado. Verifique e tente novamente.");
        setResolvedLocation(null);
        return;
      }
      setResolvedLocation({ city: data.localidade, state: data.uf });
    } catch {
      toast.error("Não foi possível consultar o CEP");
    } finally {
      setCepLoading(false);
    }
  };

  // Salva a região no perfil (apenas uma vez)
  const saveRegion = async () => {
    if (!resolvedLocation) {
      toast.error("Aguarde o CEP ser validado");
      return;
    }
    const digits = cepInput.replace(/\D/g, "");
    if (digits.length !== 8) {
      toast.error("CEP inválido");
      return;
    }

    setSavingRegion(true);
    await updateProfile({
      radar_cep: digits,
      radar_city: resolvedLocation.city,
      radar_state: resolvedLocation.state,
      radar_configured_at: new Date().toISOString(),
    } as never);
    setSavingRegion(false);
    toast.success("Região configurada! Agora é só pesquisar.");
  };

  // Valor exibido no campo CEP
  const displayCep = isConfigured
    ? formatCep(profile?.radar_cep ?? "")
    : cepInput;

  const activeCep = isConfigured
    ? (profile?.radar_cep ?? "")
    : cepInput.replace(/\D/g, "");

  const canSearch = activeCep.length === 8 && !!resolvedLocation;

  const search = async () => {
    if (!canSearch) {
      toast.error("Configure seu CEP antes de pesquisar");
      return;
    }

    setLoading(true);
    setPlaces(null);
    setLockedCount(null);

    try {
      const { data, error } = await supabase.functions.invoke("backs-radar-search", {
        body: { cep: activeCep, radius_km: radius, category },
      });

      // Log completo para debug
      console.log("[BacksRadar] response:", { data, error });

      if (error) {
        // FunctionsHttpError traz o body real da resposta
        const context = (error as any)?.context;
        if (context) {
          try {
            const errBody = await context.json();
            console.error("[BacksRadar] edge function error body:", errBody);
            throw new Error(errBody?.error ?? error.message);
          } catch {
            throw error;
          }
        }
        throw error;
      }
      if (data?.error) throw new Error(data.error);

      const found = (data?.places ?? []) as RadarPlace[];

      if (data?.city && data?.state) {
        setResolvedLocation({ city: data.city, state: data.state });
      }

      setSource(data?.source ?? null);

      if (locked) {
        setLockedCount(found.length);
        setPlaces([]);
        return;
      }

      setPlaces(found);
      if (found.length === 0) {
        toast.info("Nenhum contato encontrado nesse raio. Tente aumentar o raio de busca.");
      }
    } catch (err: any) {
      console.error("Backs Radar search failed:", err);
      // Mostra o erro real da edge function para debug
      const msg = err?.message ?? "Não foi possível buscar os contatos agora";
      toast.error(msg, { duration: 8000 });
    } finally {
      setLoading(false);
    }
  };

  const sendToCRM = async (place: RadarPlace) => {
    setSavingId(place.place_id);
    const categoryLabel = CATEGORIES.find((c) => c.key === category)?.label ?? "";
    const notes = [
      place.address ? `Endereço: ${place.address}` : null,
      place.website ? `Site: ${place.website}` : null,
      place.maps_uri ? `Google Maps: ${place.maps_uri}` : null,
      resolvedLocation
        ? `Origem: Backs Radar (${categoryLabel} — ${resolvedLocation.city}/${resolvedLocation.state}, raio ${radius}km)`
        : `Origem: Backs Radar (${categoryLabel}, raio ${radius}km)`,
    ]
      .filter(Boolean)
      .join("\n");

    await addLead({
      name: place.name,
      phone: place.phone,
      company: place.name,
      status: "new",
      source: "Backs Radar",
      notes,
    });
    setSavingId(null);
  };

  if (profileLoading) {
    return (
      <Layout title="Backs Radar" subtitle="Carregando...">
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Backs Radar"
      subtitle="Encontre bares, restaurantes, hotéis e casas noturnas na sua região"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Painel de busca ── */}
        <div className="relative overflow-hidden rounded-3xl border bg-card/80 backdrop-blur-xl p-5 sm:p-7 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative space-y-6">
            {/* Título */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shrink-0">
                <Radar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">Radar de contatos</h2>
                <p className="text-sm text-muted-foreground">
                  {isConfigured
                    ? "Sua região está configurada. Escolha o raio e pesquise."
                    : "Configure seu CEP uma única vez para definir sua região de atuação."}
                </p>
              </div>
            </div>

            {/* CEP + Raio */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Seu CEP {isConfigured && <span className="text-emerald-500 ml-1">✓ configurado</span>}
                </Label>
                <div className="relative">
                  {isConfigured ? (
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  ) : (
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    value={displayCep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    inputMode="numeric"
                    maxLength={9}
                    readOnly={isConfigured}
                    className={`pl-10 text-base font-medium ${
                      isConfigured
                        ? "bg-muted/50 cursor-not-allowed text-muted-foreground select-none"
                        : ""
                    }`}
                  />
                  {cepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Localização resolvida */}
                {resolvedLocation && (
                  <p className="text-xs text-primary flex items-center gap-1.5 pt-0.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-semibold">{resolvedLocation.city} / {resolvedLocation.state}</span>
                  </p>
                )}

                {/* Aviso de região travada */}
                {isConfigured && (
                  <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-0.5">
                    <Info className="h-3 w-3 shrink-0 mt-0.5" />
                    Região definida. Para alterar, entre em contato com o suporte.
                  </p>
                )}

                {/* Botão salvar (só aparece na primeira configuração) */}
                {!isConfigured && resolvedLocation && (
                  <Button
                    onClick={saveRegion}
                    disabled={savingRegion}
                    size="sm"
                    variant="outline"
                    className="mt-1 gap-1.5 text-xs"
                  >
                    {savingRegion
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    Confirmar minha região
                  </Button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Raio de busca
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {RADII.map(({ km, label }) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setRadius(km)}
                      className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                        radius === km
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-secondary/40 border-border hover:bg-secondary text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Categorias */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Categoria
              </Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      category === key
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-secondary/40 border-border hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão pesquisar */}
            <Button
              onClick={search}
              disabled={loading || !canSearch}
              size="lg"
              className="w-full sm:w-auto gap-2 rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "Buscando..." : "Pesquisar"}
            </Button>
          </div>
        </div>

        {/* ── Resultados bloqueados (plano não-Executivo) ── */}
        {locked && lockedCount !== null && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {lockedCount} oportunidade{lockedCount !== 1 ? "s" : ""} encontrada{lockedCount !== 1 ? "s" : ""}
              {resolvedLocation ? ` em ${resolvedLocation.city}/${resolvedLocation.state}` : ""} — raio de {radius}km
            </p>

            <div className="relative">
              {/* Cards falsos embaçados */}
              <div className="grid gap-3 sm:grid-cols-2 select-none pointer-events-none blur-[6px] opacity-60">
                {Array.from({ length: Math.max(4, Math.min(lockedCount, 6)) }).map((_, i) => (
                  <div key={i} className="rounded-2xl border bg-card/70 p-4 space-y-3">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted/70" />
                    <div className="h-3 w-4/5 rounded bg-muted/70" />
                    <div className="h-3 w-1/2 rounded bg-muted/70" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-7 w-24 rounded-full bg-muted" />
                      <div className="h-7 w-28 rounded-full bg-muted" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Overlay de upgrade */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="max-w-md w-full rounded-3xl border bg-card/95 backdrop-blur-xl p-6 text-center shadow-2xl space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
                    <Lock className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold">Contatos disponíveis no plano Executivo</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Encontramos{" "}
                      <span className="font-bold text-foreground">
                        {lockedCount} oportunidade{lockedCount !== 1 ? "s" : ""}
                      </span>{" "}
                      {resolvedLocation
                        ? `em ${resolvedLocation.city}/${resolvedLocation.state} `
                        : ""}
                      no raio de {radius}km. Para ver nomes, telefones e enviar direto ao seu CRM, ative o plano Executivo.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/planos")}
                    size="lg"
                    className="w-full rounded-xl gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Quero o plano Executivo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Resultados visíveis (plano Executivo) ── */}
        {!locked && places && places.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                <span className="font-bold text-foreground">{places.length}</span>{" "}
                contato{places.length !== 1 ? "s" : ""}
                {resolvedLocation
                  ? ` em ${resolvedLocation.city}/${resolvedLocation.state}`
                  : ""}{" "}
                — raio de {radius}km
                {source === "cache" && (
                  <span className="ml-1.5 text-[11px] bg-muted px-1.5 py-0.5 rounded-full font-medium">
                    cache
                  </span>
                )}
              </span>
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {places.map((place) => (
                <div
                  key={place.place_id}
                  className="rounded-2xl border bg-card/70 backdrop-blur-md p-4 hover:shadow-lg transition-shadow flex flex-col gap-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{place.name}</h3>
                      {place.rating != null && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary shrink-0">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {place.rating.toFixed(1)}
                          {place.rating_count ? ` (${place.rating_count})` : ""}
                        </span>
                      )}
                    </div>
                    {place.place_type && (
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
                        {place.place_type}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {place.address && (
                      <p className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                        {place.address}
                      </p>
                    )}
                    {place.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {place.phone}
                      </p>
                    )}
                    {place.website && (
                      <p className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:text-primary transition-colors"
                        >
                          {place.website.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto pt-1">
                    {place.phone && (
                      <a
                        href={whatsappLink(place.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    )}
                    {place.maps_uri && (
                      <a
                        href={place.maps_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-500/20 transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Mapa
                      </a>
                    )}
                    <button
                      onClick={() => sendToCRM(place)}
                      disabled={savingId === place.place_id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {savingId === place.place_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      Enviar ao CRM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sem resultados após busca ── */}
        {!locked && places !== null && places.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Radar className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-muted-foreground">Nenhum resultado encontrado</p>
            <p className="text-sm text-muted-foreground/70 max-w-xs">
              Tente aumentar o raio de busca ou escolher outra categoria.
            </p>
          </div>
        )}

        {/* ── Estado inicial ── */}
        {places === null && lockedCount === null && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Radar className="h-9 w-9 text-primary" />
              </div>
            </div>
            <p className="font-semibold">
              {isConfigured ? "Pronto para explorar!" : "Configure sua região primeiro"}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {isConfigured
                ? `Sua região é ${resolvedLocation?.city ?? ""} / ${resolvedLocation?.state ?? ""}. Escolha o raio e pressione Pesquisar.`
                : "Digite seu CEP para definir sua região de atuação. Isso só precisa ser feito uma vez."}
            </p>
          </div>
        )}

      </div>
    </Layout>
  );
}
