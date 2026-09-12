import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const CACHE_DAYS = 7;
const CATEGORIES: Record<string, string> = {
  bares: "bares com música ao vivo",
  restaurantes: "restaurantes com música ao vivo",
  hoteis: "hotéis e resorts com eventos",
  casas_noturnas: "casas noturnas e boates",
  casas_de_show: "casas de show e espaços de eventos",
  buffets: "buffets e espaços para festas",
};

const BodySchema = z.object({
  cep: z.string().regex(/^\d{8}$/),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  radius_km: z.union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)]),
  categories: z.array(z.enum([
    "bares",
    "restaurantes",
    "hoteis",
    "casas_noturnas",
    "casas_de_show",
    "buffets",
  ])).min(1).max(6),
});

type RawPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text?: string };
  googleMapsUri?: string;
  location?: { latitude?: number; longitude?: number };
};

const toRad = (value: number) => (value * Math.PI) / 180;

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function providerError(response: Response) {
  const body = await response.text();
  console.error(`Google Maps request failed [${response.status}]: ${body}`);
  return { status: response.status, body };
}

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

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return json({ error: "Preencha um CEP, raio e ao menos uma categoria válidos." }, 400);
    }
    const { cep, city, state, radius_km: radius, categories } = parsed.data;
    const radiusMeters = radius * 1000;

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const cutoff = new Date(Date.now() - CACHE_DAYS * 86400_000).toISOString();
    const cacheKey = `${cep}:${radius}`;

    if (!lovableKey || !mapsKey) {
      return json({ error: "Integração do Google Maps não configurada. Entre em contato com o suporte." }, 500);
    }

    const geocodeParams = new URLSearchParams({
      address: `${cep}, Brasil`,
      components: `postal_code:${cep}|country:BR`,
      language: "pt-BR",
      region: "br",
    });
    const geocodeResponse = await fetch(`${GATEWAY_URL}/maps/api/geocode/json?${geocodeParams}`, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": mapsKey,
      },
    });
    if (!geocodeResponse.ok) {
      const failure = await providerError(geocodeResponse);
      return json({ error: "Não foi possível localizar o CEP no Google Maps.", details: failure.body }, failure.status);
    }
    const geocode = await geocodeResponse.json();
    const location = geocode.results?.[0]?.geometry?.location;
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return json({ error: "CEP não localizado no Google Maps." }, 400);
    }

    const { data: cached } = await admin
      .from("radar_places")
      .select("*")
      .eq("cache_key", cacheKey)
      .in("category", categories)
      .gte("fetched_at", cutoff)
      .not("phone", "is", null)
      .order("rating_count", { ascending: false });

    const cachedCategories = new Set((cached ?? []).map((place) => place.category));
    if (cached && categories.every((category) => cachedCategories.has(category))) {
      const strictCached = cached
        .filter((place) => place.lat != null && place.lng != null)
        .map((place) => ({
          ...place,
          distance_km: distanceMeters(lat, lng, Number(place.lat), Number(place.lng)) / 1000,
        }))
        .filter((place) => place.distance_km <= radius)
        .sort((a, b) => a.distance_km - b.distance_km);
      return json({ places: strictCached, source: "cache", city, state, lat, lng, radius });
    }

    const collected = new Map<string, RawPlace & { category: string }>();
    for (const category of categories) {
      let pageToken: string | undefined;
      do {
        const requestBody: Record<string, unknown> = {
          textQuery: CATEGORIES[category],
          languageCode: "pt-BR",
          regionCode: "BR",
          pageSize: 20,
          locationRestriction: {
            circle: { center: { latitude: lat, longitude: lng }, radius: radiusMeters },
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
              "places.id", "places.displayName", "places.formattedAddress",
              "places.nationalPhoneNumber", "places.websiteUri", "places.rating",
              "places.userRatingCount", "places.primaryTypeDisplayName",
              "places.googleMapsUri", "places.location", "nextPageToken",
            ].join(","),
          },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
          const failure = await providerError(response);
          if (failure.status === 403) {
            return json({ error: "A busca no Google Maps foi recusada. Verifique as permissões da chave para Geocoding e Places.", details: failure.body }, 403);
          }
          return json({ error: "O Google Maps não conseguiu concluir a busca.", details: failure.body }, failure.status);
        }

        const result = await response.json();
        for (const place of (result.places ?? []) as RawPlace[]) {
          if (place.id && !collected.has(place.id)) collected.set(place.id, { ...place, category });
        }
        pageToken = result.nextPageToken;
        if (pageToken) await new Promise((resolve) => setTimeout(resolve, 500));
      } while (pageToken);
    }

    const rows = [...collected.values()]
      .filter((place) => {
        const placeLat = Number(place.location?.latitude);
        const placeLng = Number(place.location?.longitude);
        return Boolean(place.nationalPhoneNumber)
          && Number.isFinite(placeLat)
          && Number.isFinite(placeLng)
          && distanceMeters(lat, lng, placeLat, placeLng) <= radiusMeters;
      })
      .map((place) => {
        const placeLat = Number(place.location?.latitude);
        const placeLng = Number(place.location?.longitude);
        return {
          place_id: place.id,
          state,
          city,
          category: place.category,
          name: place.displayName?.text ?? "Sem nome",
          address: place.formattedAddress ?? null,
          phone: place.nationalPhoneNumber ?? null,
          website: place.websiteUri ?? null,
          rating: place.rating ?? null,
          rating_count: place.userRatingCount ?? null,
          place_type: place.primaryTypeDisplayName?.text ?? null,
          maps_uri: place.googleMapsUri ?? null,
          cache_key: cacheKey,
          lat: placeLat,
          lng: placeLng,
          distance_km: distanceMeters(lat, lng, placeLat, placeLng) / 1000,
          fetched_at: new Date().toISOString(),
        };
      })
      .sort((a, b) => a.distance_km - b.distance_km);

    if (rows.length > 0) {
      const { error: upsertErr } = await admin
        .from("radar_places")
        .upsert(rows.map(({ distance_km: _distance, ...row }) => row), { onConflict: "place_id,category" });
      if (upsertErr) console.error("Cache upsert failed:", upsertErr.message);
    }

    return json({ places: rows, source: "google", city, state, lat, lng, radius });
  } catch (err) {
    console.error("backs-radar-search error:", err);
    return json({ error: err instanceof Error ? err.message : "Erro inesperado no servidor" }, 500);
  }
});
