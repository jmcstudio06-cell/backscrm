import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLeads } from "@/hooks/useLeads";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Radar, Search, Loader2, Phone, Globe, MapPin, Star,
  MessageCircle, UserPlus, Sparkles, Beer, UtensilsCrossed,
  Hotel, Mic2, Lock, Crown,
  Navigation, CheckCircle2, Info, Building2, X,
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
  city?: string;
}

const CATEGORIES = [
  { key: "bares",          label: "Bares",             icon: Beer },
  { key: "restaurantes",   label: "Restaurantes",      icon: UtensilsCrossed },
  { key: "hoteis",         label: "Hotéis",            icon: Hotel },
  { key: "casas_de_show",  label: "Casas de show",     icon: Mic2 },
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
  const { addLead }                                           = useLeads();
  const { profile, loading: profileLoading, updateProfile }  = useProfile();
  const { isBlocked, loading: blocksLoading }                 = useFeatureBlocks();
  const navigate                                              = useNavigate();

  const locked      = !blocksLoading && isBlocked("backs-radar");
  const isConfigured = !!(profile?.radar_cep && profile?.radar_city && profile?.radar_state);

  // ── CEP ─────────────────────────────────────────────────
  const [cepInput, setCepInput]           = useState("");
  const [cepLoading, setCepLoading]       = useState(false);
  const [savingRegion, setSavingRegion]   = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState<{ city: string; state: string } | null>(null);

  // ── Cidades ──────────────────────────────────────────────
  const [stateCities, setStateCities]         = useState<string[]>([]);
  const [loadingCities, setLoadingCities]     = useState(false);
  const [selectedCities, setSelectedCities]   = useState<string[]>([]);
  const [citySearch, setCitySearch]           = useState("");

  const normalizeCity = (value: string) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  // ── Busca ────────────────────────────────────────────────
  const [categories, setCategories]         = useState<string[]>(CATEGORIES.map(c => c.key));
  const [loading, setLoading]               = useState(false);
  const [places, setPlaces]                 = useState<RadarPlace[] | null>(null);
  const [lockedCount, setLockedCount]       = useState<number | null>(null);
  const [savingId, setSavingId]             = useState<string | null>(null);
  const [searchedCities, setSearchedCities] = useState<string[]>([]);

  useEffect(() => {
    if (isConfigured && profile) {
      setResolvedLocation({ city: profile.radar_city!, state: profile.radar_state! });
    }
  }, [isConfigured, profile]);

  useEffect(() => {
    if (!resolvedLocation) return;
    if (selectedCities.length === 0) setSelectedCities([resolvedLocation.city]);
  }, [resolvedLocation?.city, resolvedLocation?.state]);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isConfigured) return;
    const formatted = formatCep(e.target.value);
    setCepInput(formatted);
    setResolvedLocation(null);
    if (formatted.replace(/\D/g, "").length === 8) previewCep(formatted.replace(/\D/g, ""));
  };

  const previewCep = async (digits: string) => {
    setCepLoading(true);
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data?.erro) { toast.error("CEP não encontrado."); return; }
      setResolvedLocation({ city: data.localidade, state: data.uf });
    } catch { toast.error("Não foi possível consultar o CEP"); }
    finally   { setCepLoading(false); }
  };

  const saveRegion = async () => {
    if (!resolvedLocation) return;
    const digits = cepInput.replace(/\D/g, "");
    if (digits.length !== 8) { toast.error("CEP inválido"); return; }
    setSavingRegion(true);
    await updateProfile({
      radar_cep: digits,
      radar_city: resolvedLocation.city,
      radar_state: resolvedLocation.state,
      radar_configured_at: new Date().toISOString(),
    } as never);
    setSavingRegion(false);
    toast.success("Região configurada!");
  };

  const displayCep = isConfigured ? formatCep(profile?.radar_cep ?? "") : cepInput;
  const activeCep  = isConfigured ? (profile?.radar_cep ?? "") : cepInput.replace(/\D/g, "");
  const canSearch  = activeCep.length === 8 && !!resolvedLocation
                     && selectedCities.length > 0 && categories.length > 0;

  useEffect(() => {
    if (!resolvedLocation?.state) return;

    let cancelled = false;
    setLoadingCities(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${resolvedLocation.state}/municipios`)
      .then((response) => {
        if (!response.ok) throw new Error("IBGE request failed");
        return response.json() as Promise<Array<{ nome: string }>>;
      })
      .then((cities) => {
        if (!cancelled) {
          setStateCities(cities.map(({ nome }) => nome).sort((a, b) => a.localeCompare(b, "pt-BR")));
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Não foi possível carregar as cidades do estado.");
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });

    return () => { cancelled = true; };
  }, [resolvedLocation?.state]);

  const filteredCities = stateCities.filter((city) =>
    normalizeCity(city).includes(normalizeCity(citySearch))
  );

  const toggleCity = (city: string) =>
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.length > 1 ? prev.filter(c => c !== city) : prev
        : [...prev, city]
    );

  // ── Pesquisar por cidade ──────────────────────────────────
  const search = async () => {
    if (!canSearch) { toast.error("Selecione ao menos uma cidade."); return; }
    setLoading(true);
    setPlaces(null);
    setLockedCount(null);

    try {
      const { data, error } = await supabase.functions.invoke("backs-radar-search", {
        body: {
          cep: activeCep,
          city: resolvedLocation?.city ?? "",
          state: resolvedLocation?.state ?? "",
          radius_km: 100,
          categories,
          selected_cities: selectedCities,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error ?? "Não foi possível concluir a pesquisa.");
      }

      const allResults = (data?.places ?? []) as RadarPlace[];
      setSearchedCities([...selectedCities]);

      if (locked) { setLockedCount(allResults.length); setPlaces([]); return; }

      setPlaces(allResults);
      if (allResults.length === 0) toast.info("Nenhum contato encontrado. Adicione mais cidades ou categorias.");

    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao buscar contatos");
    } finally {
      setLoading(false);
    }
  };

  const sendToCRM = async (place: RadarPlace) => {
    setSavingId(place.place_id);
    const catLabels = categories.map(c => CATEGORIES.find(x => x.key === c)?.label ?? c).join(", ");
    const notes = [
      place.address  ? `Endereço: ${place.address}` : null,
      place.website  ? `Site: ${place.website}` : null,
      place.maps_uri ? `Google Maps: ${place.maps_uri}` : null,
      place.city     ? `Cidade: ${place.city}` : null,
      `Origem: Backs Radar (${catLabels})`,
    ].filter(Boolean).join("\n");
    await addLead({ name: place.name, phone: place.phone, company: place.name, status: "new", source: "Backs Radar", notes });
    setSavingId(null);
  };

  if (profileLoading) return (
    <Layout title="Backs Radar" subtitle="Carregando...">
      <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    </Layout>
  );

  return (
    <Layout title="Backs Radar" subtitle="Encontre locais com oportunidade real para música ao vivo">
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
                  {isConfigured ? "Escolha as cidades e categorias, depois pesquise." : "Configure seu CEP para definir sua cidade base."}
                </p>
              </div>
            </div>

            {/* CEP */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Seu CEP {isConfigured && <span className="text-emerald-500 ml-1">✓ configurado</span>}
              </Label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-xs">
                  {isConfigured
                    ? <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    : <Navigation  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  }
                  <Input
                    value={displayCep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    inputMode="numeric"
                    maxLength={9}
                    readOnly={isConfigured}
                    className={`pl-10 text-base font-medium ${isConfigured ? "bg-muted/50 cursor-not-allowed text-muted-foreground" : ""}`}
                  />
                  {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {resolvedLocation && (
                  <p className="text-sm text-primary font-semibold flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {resolvedLocation.city} / {resolvedLocation.state}
                  </p>
                )}
              </div>
              {isConfigured && (
                <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <Info className="h-3 w-3 shrink-0 mt-0.5" />
                  Para alterar a cidade base, entre em contato com o suporte.
                </p>
              )}
              {!isConfigured && resolvedLocation && (
                <Button onClick={saveRegion} disabled={savingRegion} size="sm" variant="outline" className="gap-1.5 text-xs">
                  {savingRegion ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  Confirmar minha região
                </Button>
              )}
            </div>

            {/* Seletor de cidades */}
            {resolvedLocation && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cidades para buscar
                </Label>

                {/* Chips selecionadas */}
                {selectedCities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCities.map(city => (
                      <Badge key={city} variant="default"
                        className="gap-1 pl-2.5 pr-1.5 py-1 cursor-pointer bg-primary/90 hover:bg-destructive/80 transition-colors"
                        onClick={() => toggleCity(city)}>
                        {city} <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Busca de cidade */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    placeholder={loadingCities ? "Carregando cidades do estado..." : `Buscar cidade em ${resolvedLocation.state}...`}
                    className="pl-9"
                    disabled={loadingCities}
                  />
                </div>

                {citySearch && (
                  <div className="max-h-48 overflow-y-auto rounded-xl border divide-y bg-background shadow-sm">
                    {filteredCities.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">Nenhuma cidade encontrada</p>
                    ) : (
                      filteredCities.slice(0, 50).map((city) => (
                        <button key={city} type="button"
                          onClick={() => { toggleCity(city); setCitySearch(""); }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-secondary flex items-center justify-between ${selectedCities.includes(city) ? "bg-primary/10 text-primary font-semibold" : ""}`}>
                          <span className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />{city}
                          </span>
                          {selectedCities.includes(city) && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </button>
                      ))
                    )}
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground">
                  {selectedCities.length} cidade{selectedCities.length !== 1 ? "s" : ""} selecionada{selectedCities.length !== 1 ? "s" : ""} — escolha qualquer cidade de {resolvedLocation.state}
                </p>
                {!loadingCities && stateCities.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma cidade do estado foi encontrada.</p>
                )}
              </div>
            )}

            {/* Categorias */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categoria</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ key, label, icon: Icon }) => {
                  const selected = categories.includes(key);
                  return (
                    <button key={key} type="button"
                      onClick={() => setCategories(prev =>
                        prev.includes(key) ? prev.length > 1 ? prev.filter(c => c !== key) : prev : [...prev, key]
                      )}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        selected ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-secondary/40 border-border hover:bg-secondary"
                      }`}>
                      <Icon className="h-3.5 w-3.5" />{label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pesquisar */}
            <Button onClick={search} disabled={loading || !canSearch} size="lg" className="w-full sm:w-auto gap-2 rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading
                ? `Buscando em ${selectedCities.length} cidade${selectedCities.length > 1 ? "s" : ""}...`
                : "Pesquisar"}
            </Button>
          </div>
        </div>

        {/* ── Bloqueado ── */}
        {locked && lockedCount !== null && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {lockedCount} oportunidade{lockedCount !== 1 ? "s" : ""} em {searchedCities.join(", ")}
            </p>
            <div className="relative">
              <div className="grid gap-3 sm:grid-cols-2 select-none pointer-events-none blur-[6px] opacity-60">
                {Array.from({ length: Math.min(lockedCount, 6) }).map((_, i) => (
                  <div key={i} className="rounded-2xl border bg-card/70 p-4 space-y-3">
                    <div className="h-4 w-2/3 rounded bg-muted" /><div className="h-3 w-full rounded bg-muted/70" />
                    <div className="h-3 w-4/5 rounded bg-muted/70" /><div className="flex gap-2 pt-1">
                      <div className="h-7 w-24 rounded-full bg-muted" /><div className="h-7 w-28 rounded-full bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="max-w-md w-full rounded-3xl border bg-card/95 backdrop-blur-xl p-6 text-center shadow-2xl space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
                    <Lock className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold">Contatos disponíveis no plano Executivo</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Encontramos <span className="font-bold text-foreground">{lockedCount} oportunidade{lockedCount !== 1 ? "s" : ""}</span> em {searchedCities.join(", ")}. Ative o Executivo para ver nomes e telefones.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/planos")} size="lg" className="w-full rounded-xl gap-2">
                    <Crown className="h-4 w-4" /> Quero o plano Executivo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Resultados ── */}
        {!locked && places && places.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                <span className="font-bold text-foreground">{places.length}</span> contato{places.length !== 1 ? "s" : ""} em{" "}
                <span className="font-semibold text-foreground">{searchedCities.join(", ")}</span>
              </span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {places.map((place, idx) => (
                <div key={`${place.place_id}_${idx}`} className="rounded-2xl border bg-card/70 backdrop-blur-md p-4 hover:shadow-lg transition-shadow flex flex-col gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{place.name}</h3>
                      {place.rating != null && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary shrink-0">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {place.rating.toFixed(1)}{place.rating_count ? ` (${place.rating_count})` : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {place.place_type && <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{place.place_type}</p>}
                      {place.city && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{place.city}</Badge>}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {place.address && <p className="flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />{place.address}</p>}
                    {place.phone   && <p className="flex items-center gap-1.5"><Phone  className="h-3.5 w-3.5 shrink-0 text-primary/60" />{place.phone}</p>}
                    {place.website && (
                      <p className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <a href={place.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-primary transition-colors">
                          {place.website.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto pt-1">
                    {place.phone && (
                      <a href={whatsappLink(place.phone)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    )}
                    {place.maps_uri && (
                      <a href={place.maps_uri} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-500/20 transition-colors">
                        <MapPin className="h-3.5 w-3.5" /> Mapa
                      </a>
                    )}
                    <button onClick={() => sendToCRM(place)} disabled={savingId === place.place_id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
                      {savingId === place.place_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                      Enviar ao CRM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sem resultados ── */}
        {!locked && places !== null && places.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Radar className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-muted-foreground">Nenhum resultado encontrado</p>
            <p className="text-sm text-muted-foreground/70 max-w-xs">Tente adicionar mais cidades ou outras categorias.</p>
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
              {isConfigured ? "Pronto para explorar!" : "Configure seu CEP primeiro"}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isConfigured
                ? `Cidade base: ${resolvedLocation?.city ?? ""} / ${resolvedLocation?.state ?? ""}. Adicione cidades vizinhas e pressione Pesquisar.`
                : "Digite seu CEP para definir sua cidade base."}
            </p>
          </div>
        )}

      </div>
    </Layout>
  );
}
