import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * backs-radar-search v3 — OpenStreetMap + PostGIS
 *
 * Não usa mais Google Maps API.
 * Busca diretamente na tabela radar_places via função PostGIS search_radar_places().
 * Os dados são populados pelo script scripts/import-osm-radar.ts.
 *
 * Se não houver dados OSM suficientes para a região (< 3 resultados),
 * faz fallback para o Google Maps como complemento.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const MIN_OSM_RESULTS = 3; // abaixo disso tenta complementar com Google

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

// ── Busca OSM via PostGIS ────────────────────────────────────
async function searchPostGIS(
  admin: any,
  lat: number,
  lng: number,
  radiusMeters: number,
  categories: string[]
) {
  const { data, error } = await admin.rpc("search_radar_places", {
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radiusMeters,
    p_categories: categories,
  });

  if (error) {
    console.error("PostGIS search error:", error.message);
    return [];
  }

  return (data || []) as any[];
}

// ── Fallback Google Maps ─────────────────────────────────────
async function searchGoogle(
  lovableKey: string,
  mapsKey: string,
  lat: number,
  lng: number,
  radiusMeters: number,
  category: string
): Promise<any[]> {
  const searchMeters = Math.round(radiusMeters * 1.2);
  const allRaw: any[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < 2; page++) {
    const reqBody: Record<string, any> = {
      textQuery: CATEGORIES[category],
      languageCode: "pt-BR",
      regionCode: "BR",
      maxResultCount: 20,
      locationBias: {
        circle: { center: { latitude: lat, longitude: lng }, radius: searchMeters },
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
          "places.id", "places.displayName", "places.formattedAddress",
          "places.nationalPhoneNumber", "places.websiteUri",
          "places.rating", "places.userRatingCount",
          "places.primaryTypeDisplayName", "places.googleMapsUri",
          "places.location", "nextPageToken",
        ].join(","),
      },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) break;

    const result = await res.json();
    allRaw.push(...(result.places ?? []));
    pageToken = result.nextPageToken;
    if (!pageToken) break;
    await new Promise(r => setTimeout(r, 500));
  }

  // Filtra: só com telefone + dentro do raio
  return allRaw
    .filter(p => !!p.nationalPhoneNumber)
    .filter(p => {
      const pLat = p.location?.latitude;
      const pLng = p.location?.longitude;
      if (!pLat || !pLng) return true;
      return haversine(lat, lng, pLat, pLng) <= radiusMeters;
    })
    .map(p => ({
      place_id:     `google_${p.id}`,
      osm_id:       null,
      state:        "",
      city:         "",
      category,
      name:         p.displayName?.text ?? "Sem nome",
      address:      p.formattedAddress ?? null,
      phone:        p.nationalPhoneNumber ?? null,
      website:      p.websiteUri ?? null,
      rating:       p.rating ?? null,
      rating_count: p.userRatingCount ?? null,
      place_type:   p.primaryTypeDisplayName?.text ?? null,
      maps_uri:     p.googleMapsUri ?? null,
      lat:          p.location?.latitude ?? null,
      lng:          p.location?.longitude ?? null,
      source:       "google",
      distance_m:   p.location?.latitude
        ? haversine(lat, lng, p.location.latitude, p.location.longitude)
        : null,
    }));
}

// ── Handler principal ────────────────────────────────────────
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

    const lat        = Number(body.lat);
    const lng        = Number(body.lng);
    const city       = String(body.city ?? "").trim();
    const state      = String(body.state ?? "").trim().toUpperCase();
    const radiusKm   = Number(body.radius_km ?? 25);
    // Aceita string (categoria única) ou array (múltiplas categorias)
    const rawCat     = body.category;
    const categories: string[] = Array.isArray(rawCat)
      ? rawCat.map(String)
      : [String(rawCat ?? "bares")];

    const VALID_RADII  = [10, 25, 50, 100];
    const radius       = VALID_RADII.includes(radiusKm) ? radiusKm : 25;
    const radiusMeters = radius * 1000;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return json({ error: "Coordenadas inválidas." }, 400);
    }
    if (!city || city.length < 2)     return json({ error: "Cidade não informada." }, 400);
    if (!state || state.length !== 2) return json({ error: "Estado não informado." }, 400);

    const invalidCats = categories.filter(c => !CATEGORIES[c]);
    if (invalidCats.length) {
      return json({ error: `Categoria(s) inválida(s): ${invalidCats.join(", ")}` }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log(`Backs Radar OSM: lat=${lat},lng=${lng} r=${radius}km cats=${categories.join(",")}`);

    // ── 1. Busca no banco OSM via PostGIS ─────────────────────
    const osmResults = await searchPostGIS(admin, lat, lng, radiusMeters, categories);
    console.log(`PostGIS: ${osmResults.length} resultados`);

    let allResults = osmResults;
    let source = "osm";

    // ── 2. Fallback Google se OSM tiver poucos dados ──────────
    if (osmResults.length < MIN_OSM_RESULTS && lovableKey && mapsKey) {
      console.log(`OSM insuficiente (${osmResults.length} < ${MIN_OSM_RESULTS}), complementando com Google...`);

      const seen = new Set(osmResults.map((r: any) => r.place_id));

      for (const cat of categories) {
        const googleResults = await searchGoogle(lovableKey, mapsKey, lat, lng, radiusMeters, cat);

        // Salva resultados Google no banco para futuras buscas (aprendizado)
        const toSave = googleResults
          .filter(r => r.lat && r.lng)
          .map(r => ({
            place_id:     r.place_id,
            state,
            city,
            category:     cat,
            name:         r.name,
            address:      r.address,
            phone:        r.phone,
            website:      r.website,
            rating:       r.rating,
            rating_count: r.rating_count,
            place_type:   r.place_type,
            maps_uri:     r.maps_uri,
            lat:          r.lat,
            lng:          r.lng,
            source:       "google",
            fetched_at:   new Date().toISOString(),
          }));

        if (toSave.length > 0) {
          await admin.from("radar_places")
            .upsert(toSave, { onConflict: "place_id,category" });
          console.log(`Google: salvou ${toSave.length} no banco para ${cat}`);
        }

        // Adiciona ao resultado sem duplicar
        for (const r of googleResults) {
          if (!seen.has(r.place_id)) {
            seen.add(r.place_id);
            allResults.push(r);
          }
        }
      }

      source = osmResults.length > 0 ? "osm+google" : "google";
    }

    // Ordena por distância
    allResults.sort((a: any, b: any) => (a.distance_m ?? 0) - (b.distance_m ?? 0));

    console.log(`Total final: ${allResults.length} (source=${source})`);

    return json({
      places: allResults,
      source,
      city,
      state,
      lat,
      lng,
      radius,
      total: allResults.length,
    });

  } catch (err) {
    console.error("backs-radar-search error:", err);
    return json({ error: err instanceof Error ? err.message : "Erro inesperado" }, 500);
  }
});
