import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const CACHE_DAYS = 7;
const PAGE_SIZE = 20;

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

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

    const lat      = Number(body.lat);
    const lng      = Number(body.lng);
    const city     = String(body.city ?? "").trim();
    const state    = String(body.state ?? "").trim().toUpperCase();
    const radiusKm = Number(body.radius_km ?? 25);
    const category = String(body.category ?? "").trim();
    const refresh  = body.refresh === true;

    const VALID_RADII = [10, 25, 50, 100];
    const radius         = VALID_RADII.includes(radiusKm) ? radiusKm : 25;
    const radiusMeters   = radius * 1000;
    // Busca com raio 20% maior para não perder lugares na borda do raio
    const searchMeters   = Math.round(radiusMeters * 1.2);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return json({ error: "Coordenadas inválidas. Tente novamente." }, 400);
    }
    if (!city || city.length < 2)     return json({ error: "Cidade não informada." }, 400);
    if (!state || state.length !== 2) return json({ error: "Estado não informado." }, 400);
    if (!CATEGORIES[category])        return json({ error: "Categoria inválida." }, 400);

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const cutoff = new Date(Date.now() - CACHE_DAYS * 86400_000).toISOString();

    // Cache
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
        .limit(60);

      if (cached && cached.length > 0) {
        console.log(`Cache hit: ${city}/${state}/${category} (${cached.length})`);
        return json({ places: cached, source: "cache", city, state, lat, lng, radius });
      }
    }

    if (!lovableKey || !mapsKey) {
      return json({ error: "Integração do Google Maps não configurada." }, 500);
    }

    console.log(`Google Places: "${CATEGORIES[category]}" @ (${lat.toFixed(4)},${lng.toFixed(4)}) bias=${searchMeters}m filter=${radiusMeters}m`);

    // Busca até 3 páginas usando locationBias (sugestão, não restrição)
    // Depois filtramos com haversine para garantir o raio
    const allRaw: any[] = [];
    let pageToken: string | undefined;

    for (let page = 0; page < 3; page++) {
      const reqBody: Record<string, any> = {
        textQuery: CATEGORIES[category],
        languageCode: "pt-BR",
        regionCode: "BR",
        maxResultCount: PAGE_SIZE,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: searchMeters,
          },
        },
      };
      if (pageToken) reqBody.pageToken = pageToken;

      const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
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
            "places.location",
            "nextPageToken",
          ].join(","),
        },
        body: JSON.stringify(reqBody),
      });

      if (res.status === 403) {
        const errBody = await res.json().catch(() => ({}));
        const reason = (errBody?.error?.details ?? []).find((d: any) => d.reason)?.reason;
        if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") return json({ error: "Chave do Google Maps restrita por domínio." }, 403);
        if (reason === "API_KEY_SERVICE_BLOCKED") return json({ error: "Chave do Google Maps não permite API de Places." }, 403);
        return json({ error: "Busca no Google Maps recusada (403)." }, 403);
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Places failed [${res.status}]: ${errText}`);
        break;
      }

      const result = await res.json();
      const pagePlaces = (result.places ?? []) as any[];
      allRaw.push(...pagePlaces);
      pageToken = result.nextPageToken;

      console.log(`Página ${page + 1}: ${pagePlaces.length} resultados, próxima=${!!pageToken}`);

      if (!pageToken) break;
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`Total bruto: ${allRaw.length}`);

    // Filtro 1: apenas com telefone
    const withPhone = allRaw.filter(p => !!p.nationalPhoneNumber);
    console.log(`Com telefone: ${withPhone.length}`);

    // Filtro 2: haversine — remove resultados longe demais
    // Se o place não tem coordenadas, mantém (veio pelo bias, provavelmente está perto)
    const inRadius = withPhone.filter(p => {
      const pLat = p.location?.latitude;
      const pLng = p.location?.longitude;
      if (!pLat || !pLng) return true;
      return haversine(lat, lng, pLat, pLng) <= radiusMeters;
    });

    console.log(`Dentro de ${radius}km: ${inRadius.length}`);

    const rows = inRadius.map(p => ({
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
    return json({ error: err instanceof Error ? err.message : "Erro inesperado" }, 500);
  }
});
