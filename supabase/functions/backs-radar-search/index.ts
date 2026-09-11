import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const CACHE_DAYS = 7;
const MAX_RESULTS = 60; // Google Places permite até 20 por chamada, mas fazemos paginação via nextPageToken

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

    // Frontend resolve lat/lng e envia prontos — sem depender de Nominatim aqui
    const lat      = Number(body.lat);
    const lng      = Number(body.lng);
    const city     = String(body.city ?? "").trim();
    const state    = String(body.state ?? "").trim().toUpperCase();
    const radiusKm = Number(body.radius_km ?? 25);
    const category = String(body.category ?? "").trim();
    const refresh  = body.refresh === true;

    const VALID_RADII = [10, 25, 50, 100];
    const radius       = VALID_RADII.includes(radiusKm) ? radiusKm : 25;
    const radiusMeters = radius * 1000;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return json({ error: "Coordenadas inválidas. Tente novamente." }, 400);
    }
    if (!city || city.length < 2)  return json({ error: "Cidade não informada." }, 400);
    if (!state || state.length !== 2) return json({ error: "Estado não informado." }, 400);
    if (!CATEGORIES[category])     return json({ error: "Categoria inválida." }, 400);

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const cutoff = new Date(Date.now() - CACHE_DAYS * 86400_000).toISOString();

    // Cache por state + city + category — somente registros com telefone
    if (!refresh) {
      const { data: cached } = await admin
        .from("radar_places")
        .select("*")
        .eq("state", state)
        .ilike("city", city)
        .eq("category", category)
        .gte("fetched_at", cutoff)
        .not("phone", "is", null)
        .order("rating_count", { ascending: false })
        .limit(MAX_RESULTS);

      if (cached && cached.length > 0) {
        console.log(`Cache hit: ${city}/${state}/${category} (${cached.length} com telefone)`);
        return json({ places: cached, source: "cache", city, state, lat, lng, radius });
      }
    }

    if (!lovableKey || !mapsKey) {
      return json({ error: "Integração do Google Maps não configurada. Entre em contato com o suporte." }, 500);
    }

    console.log(`Google Places: "${CATEGORIES[category]}" @ (${lat.toFixed(4)},${lng.toFixed(4)}) r=${radiusMeters}m`);

    // Google Places retorna no máximo 20 por chamada.
    // Usamos nextPageToken para buscar até MAX_RESULTS (60) em até 3 páginas.
    const allPlacesRaw: any[] = [];
    let pageToken: string | undefined;
    let pagesLeft = Math.ceil(MAX_RESULTS / 20);

    while (pagesLeft > 0) {
      const requestBody: Record<string, any> = {
        textQuery: CATEGORIES[category],
        languageCode: "pt-BR",
        regionCode: "BR",
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      };
      if (pageToken) requestBody.pageToken = pageToken;

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
            "nextPageToken",
          ].join(","),
        },
        body: JSON.stringify(requestBody),
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
        // Não quebra — retorna o que já temos
        break;
      }

      const result = await response.json();
      const pagePlaces = (result.places ?? []) as any[];
      allPlacesRaw.push(...pagePlaces);
      pageToken = result.nextPageToken;
      pagesLeft--;

      // Para se não há próxima página
      if (!pageToken) break;

      // Pequena pausa entre páginas (requisito do Google)
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`Google returned ${allPlacesRaw.length} places total (antes do filtro de telefone)`);

    // Filtra apenas locais COM telefone — sem telefone não serve
    const placesWithPhone = allPlacesRaw.filter(p => !!p.nationalPhoneNumber);
    console.log(`Após filtro de telefone: ${placesWithPhone.length} places`);

    const rows = placesWithPhone.map((p) => ({
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
      if (upsertErr) console.error("Cache upsert failed:", upsertErr.message);
    }

    return json({ places: rows, source: "google", city, state, lat, lng, radius });
  } catch (err) {
    console.error("backs-radar-search error:", err);
    return json({ error: err instanceof Error ? err.message : "Erro inesperado no servidor" }, 500);
  }
});
