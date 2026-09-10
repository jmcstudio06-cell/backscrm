import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const CACHE_DAYS = 7;
const MAX_RESULTS = 20;

const CATEGORIES: Record<string, string> = {
  bares: "bares com música ao vivo",
  restaurantes: "restaurantes com música ao vivo",
  hoteis: "hotéis e resorts com eventos",
  casas_noturnas: "casas noturnas e boates",
  casas_de_show: "casas de show e espaços de eventos",
  buffets: "buffets e espaços para festas",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Resolve CEP → { lat, lng, city, state } */
async function resolveCep(cep: string): Promise<{ lat: number; lng: number; city: string; state: string } | null> {
  try {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return null;

    // 1. ViaCEP → cidade e estado
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      headers: { "Accept": "application/json" },
    });
    if (!viaCepRes.ok) return null;
    const cepData = await viaCepRes.json();
    if (cepData?.erro) return null;

    const city = String(cepData.localidade ?? "").trim();
    const state = String(cepData.uf ?? "").trim().toUpperCase();
    if (!city || !state) return null;

    // 2. Nominatim via CEP
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${digits}&country=BR&format=json&limit=1`,
      { headers: { "User-Agent": "BackstageProApp/2.0 (contato@backstagepro.app)" } }
    );
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData?.[0]?.lat && geoData?.[0]?.lon) {
        return { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon), city, state };
      }
    }

    // 3. Fallback: geocodifica por cidade + estado
    const fallbackRes = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=BR&format=json&limit=1`,
      { headers: { "User-Agent": "BackstageProApp/2.0 (contato@backstagepro.app)" } }
    );
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      if (fallbackData?.[0]?.lat && fallbackData?.[0]?.lon) {
        return { lat: parseFloat(fallbackData[0].lat), lng: parseFloat(fallbackData[0].lon), city, state };
      }
    }

    return null;
  } catch (err) {
    console.error("resolveCep error:", err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableKey  = Deno.env.get("LOVABLE_API_KEY");
    const mapsKey     = Deno.env.get("GOOGLE_MAPS_API_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));

    const cep       = String(body.cep ?? "").replace(/\D/g, "");
    const radiusKm  = Number(body.radius_km ?? 25);
    const category  = String(body.category ?? "").trim();
    const refresh   = body.refresh === true;

    const VALID_RADII = [10, 25, 50, 100];
    const radius      = VALID_RADII.includes(radiusKm) ? radiusKm : 25;
    const radiusMeters = radius * 1000;

    if (cep.length !== 8)       return json({ error: "CEP inválido. Informe 8 dígitos." }, 400);
    if (!CATEGORIES[category])  return json({ error: "Categoria inválida" }, 400);

    // Resolver CEP → coordenadas + cidade/estado
    const location = await resolveCep(cep);
    if (!location) {
      return json({ error: "CEP não encontrado ou não foi possível obter as coordenadas. Verifique o CEP e tente novamente." }, 400);
    }

    const { lat, lng, city, state } = location;

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const cutoff = new Date(Date.now() - CACHE_DAYS * 86400_000).toISOString();

    // Cache lookup — usa state+city+category (schema original, sem campos novos)
    if (!refresh) {
      const { data: cached } = await admin
        .from("radar_places")
        .select("*")
        .eq("state", state)
        .ilike("city", city)
        .eq("category", category)
        .gte("fetched_at", cutoff)
        .order("rating_count", { ascending: false })
        .limit(MAX_RESULTS);

      if (cached && cached.length > 0) {
        console.log(`Cache hit: ${city}/${state}/${category} (${cached.length} places)`);
        return json({ places: cached, source: "cache", city, state, lat, lng, radius });
      }
    }

    if (!lovableKey || !mapsKey) {
      return json({ error: "Integração do Google Maps não configurada. Entre em contato com o suporte." }, 500);
    }

    console.log(`Google Places: "${CATEGORIES[category]}" @ (${lat.toFixed(4)},${lng.toFixed(4)}) r=${radiusMeters}m`);

    const response = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": mapsKey,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.nationalPhoneNumber",
          "places.websiteUri",
          "places.rating",
          "places.userRatingCount",
          "places.primaryTypeDisplayName",
          "places.googleMapsUri",
        ].join(","),
      },
      body: JSON.stringify({
        textQuery: CATEGORIES[category],
        languageCode: "pt-BR",
        regionCode: "BR",
        maxResultCount: MAX_RESULTS,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
    });

    if (response.status === 403) {
      const errBody = await response.json().catch(() => ({}));
      const details: Array<{ reason?: string }> = errBody?.error?.details ?? [];
      const reason = details.find((d) => d.reason)?.reason;
      if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
        return json({ error: "A chave do Google Maps está restrita por domínio. Ajuste para 'Nenhuma' ou 'Endereços IP'." }, 403);
      }
      if (reason === "API_KEY_SERVICE_BLOCKED") {
        return json({ error: "A chave do Google Maps não permite a API de Places. Libere essa API na chave." }, 403);
      }
      return json({ error: "Busca no Google Maps recusada (403)." }, 403);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Places request failed [${response.status}]: ${errorBody}`);
      return json({ error: `Falha na busca do Google Maps (${response.status})` }, response.status);
    }

    const result = await response.json();
    const places = (result.places ?? []) as any[];
    console.log(`Google returned ${places.length} places`);

    // Monta rows apenas com colunas que existem no schema atual
    const rows = places.map((p) => ({
      place_id:     p.id,
      state,
      city,
      category,
      name:         p.displayName?.text ?? "Sem nome",
      address:      p.formattedAddress ?? null,
      phone:        p.nationalPhoneNumber ?? null,
      website:      p.websiteUri ?? null,
      rating:       p.rating ?? null,
      rating_count: p.userRatingCount ?? null,
      place_type:   p.primaryTypeDisplayName?.text ?? null,
      maps_uri:     p.googleMapsUri ?? null,
      fetched_at:   new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error: upsertErr } = await admin
        .from("radar_places")
        .upsert(rows, { onConflict: "place_id,category" });
      if (upsertErr) {
        console.error("Cache upsert failed:", upsertErr.message);
      }
    }

    return json({ places: rows, source: "google", city, state, lat, lng, radius });
  } catch (err) {
    console.error("backs-radar-search error:", err);
    return json({ error: err instanceof Error ? err.message : "Erro inesperado no servidor" }, 500);
  }
});
