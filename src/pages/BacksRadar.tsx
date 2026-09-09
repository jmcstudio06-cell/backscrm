import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLeads } from "@/hooks/useLeads";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { useNavigate } from "react-router-dom";
import { RegionPicker } from "@/components/radar/RegionPicker";
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

function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export default function BacksRadar() {
  const { addLead } = useLeads();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { isBlocked, loading: blocksLoading } = useFeatureBlocks();
  const navigate = useNavigate();
  const locked = !blocksLoading && isBlocked("backs-radar");
  const [lockedCount, setLockedCount] = useState<number | null>(null);
  const [category, setCategory] = useState("bares");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<RadarPlace[] | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ state: "", city: "", cep: "" });
  const [savingRegion, setSavingRegion] = useState(false);

  const state = profile?.radar_state ?? "";
  const city = profile?.radar_city ?? "";
  const configured = !!(state && city);

  const saveRegion = async () => {
    if (!draft.state || !draft.city) {
      toast.error("Selecione seu estado e sua cidade");
      return;
    }
    setSavingRegion(true);
    await updateProfile({
      radar_state: draft.state,
      radar_city: draft.city,
      radar_cep: draft.cep.replace(/\D/g, "") || null,
      radar_configured_at: new Date().toISOString(),
    } as never);
    setSavingRegion(false);
  };

  const search = async () => {
    if (!configured) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("backs-radar-search", {
        body: { state, city, category },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const found = (data?.places ?? []) as RadarPlace[];
      if (locked) {
        setLockedCount(found.length);
        setPlaces([]);
        setSource(null);
        return;
      }
      setPlaces(found);
      setSource(data?.source ?? null);
      if (found.length === 0) {
        toast.info("Nenhum contato encontrado para esse filtro");
      }
    } catch (err) {
      console.error("Backs Radar search failed:", err);
      toast.error("Não foi possível buscar os contatos agora");
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
      `Origem: Backs Radar (${categoryLabel} — ${city}/${state})`,
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

  if (!configured) {
    return (
      <Layout
        title="Backs Radar"
        subtitle="Antes de começar, diga qual é a sua região de atuação"
      >
        <div className="max-w-xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border bg-card/80 backdrop-blur-xl p-6 shadow-xl space-y-5">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
                <Radar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">Configure sua região</h2>
                <p className="text-sm text-muted-foreground">
                  Você faz isso uma única vez. Depois seu radar já vem pronto para a sua cidade.
                </p>
              </div>
            </div>

            <div className="relative">
              <RegionPicker
                state={draft.state}
                city={draft.city}
                cep={draft.cep}
                onChange={setDraft}
              />
            </div>

            <Button
              onClick={saveRegion}
              disabled={savingRegion || !draft.state || !draft.city}
              className="w-full rounded-xl gap-2"
            >
              {savingRegion ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              Salvar minha região
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Precisa mudar depois? Fale com o suporte e a equipe ajusta sua região.
            </p>
          </div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout
      title="Backs Radar"
      subtitle="Encontre bares, restaurantes, hotéis e casas noturnas da sua região que contratam música ao vivo"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Painel de busca */}
        <div className="relative overflow-hidden rounded-3xl border bg-card/80 backdrop-blur-xl p-5 sm:p-7 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
                <Radar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">Radar de contatos</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Sua região: <span className="font-semibold text-foreground">{city} / {state}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={search} disabled={loading} className="gap-2 rounded-xl">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar contatos
              </Button>
              <p className="text-xs text-muted-foreground">
                Para mudar de região, fale com o suporte.
              </p>
            </div>


            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
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
        </div>

        {/* Resultados bloqueados */}
        {locked && lockedCount !== null && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {lockedCount} oportunidade{lockedCount !== 1 ? "s" : ""} encontrada{lockedCount !== 1 ? "s" : ""} em {city}/{state}
            </p>

            <div className="relative">
              <div className="grid gap-3 sm:grid-cols-2 select-none pointer-events-none blur-[6px] opacity-70">
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

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="max-w-md w-full rounded-3xl border bg-card/95 backdrop-blur-xl p-6 text-center shadow-2xl space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Contatos disponíveis no plano Executivo</h3>
                    <p className="text-sm text-muted-foreground">
                      Encontramos {lockedCount} oportunidade{lockedCount !== 1 ? "s" : ""} em {city}/{state}. Para ver nomes,
                      telefones e enviar direto ao seu CRM, ative o plano Executivo.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/planos")} className="w-full rounded-xl gap-2">
                    <Crown className="h-4 w-4" />
                    Quero o plano Executivo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {!locked && places && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {places.length} contato{places.length !== 1 ? "s" : ""} em {city}/{state}
                {source === "cache" && " (resultados já pesquisados)"}
              </p>
            </div>

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
                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary/60 shrink-0" />
                        {place.address}
                      </p>
                    )}
                    {place.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-primary/60" />
                        {place.phone}
                      </p>
                    )}
                    {place.website && (
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-primary truncate"
                      >
                        <Globe className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                        <span className="truncate">{place.website.replace(/^https?:\/\//, "")}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto pt-1">
                    {place.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full gap-1.5 text-xs"
                        onClick={() =>
                          window.open(whatsappLink(place.phone!), "_blank", "noopener,noreferrer")
                        }
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </Button>
                    )}
                    {place.maps_uri && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full gap-1.5 text-xs"
                        onClick={() =>
                          window.open(place.maps_uri!, "_blank", "noopener,noreferrer")
                        }
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Mapa
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="rounded-full gap-1.5 text-xs ml-auto"
                      disabled={savingId === place.place_id}
                      onClick={() => sendToCRM(place)}
                    >
                      {savingId === place.place_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      Enviar ao CRM
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!places && !loading && lockedCount === null && (
          <div className="rounded-2xl border border-dashed bg-card/40 p-10 text-center">
            <Radar className="h-10 w-10 mx-auto text-primary/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Escolha estado, cidade e categoria para encontrar novos contatos de shows.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
