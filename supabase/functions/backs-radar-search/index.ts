import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { isMusicOpportunity } from "./place-filter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "bares",
  "restaurantes",
  "hoteis",
  "casas_de_show",
] as const;

const CATEGORY_SET = new Set<string>(CATEGORIES);

const BodySchema = z.object({
  cep: z.string().regex(/^\d{8}$/),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(2).optional(),
  radius_km: z.union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)]),
  categories: z.array(z.string().max(40)).max(12).optional(),
  category: z.string().max(40).optional(),
  selected_cities: z.array(z.string().trim().min(1).max(120)).max(1000).optional(),
}).transform((body) => ({
  ...body,
  categories: [...new Set((body.categories ?? (body.category ? [body.category] : []))
    .filter((value) => CATEGORY_SET.has(value)))],
})).refine((body) => body.categories.length > 0, {
  path: ["categories"],
});

type CepLocation = {
  city: string;
  state: string;
  lat: number;
  lng: number;
};

type StoredPlace = {
  id: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
};

type IbgeCity = {
  nome?: unknown;
};

type OsmElement = {
  id?: unknown;
  type?: unknown;
  lat?: unknown;
  lon?: unknown;
  center?: { lat?: unknown; lon?: unknown };
  tags?: Record<string, unknown>;
};

type PublicCityLocation = {
  areaId: number;
};

const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractCep(address: string | null) {
  return address?.match(/\b\d{5}-?\d{3}\b/)?.[0]?.replace(/\D/g, "") ?? null;
}

const normalizeCity = (value: unknown) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim();

async function locateCep(cep: string): Promise<CepLocation | null> {
  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;

  const data = await response.json();
  const lat = Number(data?.location?.coordinates?.latitude);
  const lng = Number(data?.location?.coordinates?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !data?.city || !data?.state) return null;

  return { city: data.city, state: data.state, lat, lng };
}

async function getStateCities(state: string) {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(state)}/municipios`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error("Não foi possível validar as cidades deste estado.");

  const data = (await response.json()) as IbgeCity[];
  return data
    .map(({ nome }) => String(nome ?? "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function firstText(...values: unknown[]) {
  return values.map((value) => String(value ?? "").trim()).find(Boolean) ?? "";
}

function publicCategory(tags: Record<string, unknown>) {
  const amenity = normalizeCity(tags.amenity);
  const tourism = normalizeCity(tags.tourism);
  const leisure = normalizeCity(tags.leisure);
  if (amenity === "bar" || amenity === "pub") return "bares";
  if (amenity === "restaurant") return "restaurantes";
  if (tourism === "hotel" || tourism === "resort") return "hoteis";
  if (amenity === "nightclub" || amenity === "music venue" ||
      leisure === "music venue" || amenity === "theatre") return "casas_de_show";
  return null;
}

function publicPlaceType(tags: Record<string, unknown>) {
  return firstText(tags.amenity, tags.tourism, tags.leisure).replaceAll("_", " ");
}

function publicPhone(tags: Record<string, unknown>) {
  const raw = firstText(tags.phone, tags["contact:phone"], tags["phone:BR"]);
  const first = raw.split(";")[0]?.trim() ?? "";
  return first.replace(/\D/g, "").length >= 8 ? first : null;
}

function publicCenter(element: OsmElement) {
  const lat = Number(element.type === "node" ? element.lat : element.center?.lat);
  const lng = Number(element.type === "node" ? element.lon : element.center?.lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

async function locatePublicCity(city: string, state: string): Promise<PublicCityLocation | null> {
  const params = new URLSearchParams({
    city,
    state,
    country: "Brasil",
    countrycodes: "br",
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { Accept: "application/json", "User-Agent": "BackstageProRadar/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) return null;

  const results = await response.json() as Array<Record<string, unknown>>;
  const match = results.find((result) => {
    const address = (result.address ?? {}) as Record<string, unknown>;
    const isoState = String(address["ISO3166-2-lvl4"] ?? "").split("-").pop();
    const resultCity = firstText(address.city, address.town, address.municipality, address.village);
    return result.osm_type === "relation" && isoState?.toUpperCase() === state.toUpperCase() &&
      normalizeCity(resultCity) === normalizeCity(city);
  });
  const osmId = Number(match?.osm_id);
  return Number.isFinite(osmId) ? { areaId: 3_600_000_000 + osmId } : null;
}

async function queryPublicPlaces(areaId: number, categories: string[]) {
  const filters: string[] = [];
  if (categories.includes("bares")) filters.push('nwr["amenity"~"^(bar|pub)$"](area.city);');
  if (categories.includes("restaurantes")) filters.push('nwr["amenity"="restaurant"](area.city);');
  if (categories.includes("hoteis")) filters.push('nwr["tourism"~"^(hotel|resort)$"](area.city);');
  if (categories.includes("casas_de_show")) {
    filters.push('nwr["amenity"~"^(nightclub|music_venue|theatre)$"](area.city);');
    filters.push('nwr["leisure"="music_venue"](area.city);');
  }
  if (filters.length === 0) return [] as OsmElement[];

  const query = `[out:json][timeout:35];area(${areaId})->.city;(${filters.join("")});out tags center;`;
  let lastError: unknown = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "BackstageProRadar/1.0",
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) throw new Error(`OpenStreetMap respondeu ${response.status}`);
      const payload = await response.json() as { elements?: OsmElement[] };
      return payload.elements ?? [];
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Fonte pública indisponível");
}

async function fillCityFromPublicSource(
  admin: ReturnType<typeof createClient>,
  city: string,
  state: string,
  categories: string[],
) {
  const location = await locatePublicCity(city, state);
  if (!location) return 0;
  const elements = await queryPublicPlaces(location.areaId, categories);
  const rows = elements.flatMap((element) => {
    const tags = element.tags ?? {};
    const category = publicCategory(tags);
    const center = publicCenter(element);
    const phone = publicPhone(tags);
    const name = firstText(tags.name, tags["name:pt"]);
    if (!category || !categories.includes(category) || !center || !phone || !name) return [];

    const placeType = publicPlaceType(tags);
    const candidate = { category, name, place_type: placeType };
    if (!isMusicOpportunity(candidate)) return [];
    const osmType = String(element.type ?? "node");
    const osmId = `${osmType}/${String(element.id ?? "")}`;
    const street = firstText(tags["addr:street"]);
    const number = firstText(tags["addr:housenumber"]);
    const address = [street && number ? `${street}, ${number}` : street, city, state].filter(Boolean).join(" - ");

    return [{
      place_id: `osm_${osmType}_${String(element.id ?? "")}`,
      osm_id: osmId,
      state,
      city,
      category,
      name,
      address: address || null,
      phone,
      website: firstText(tags.website, tags["contact:website"]) || null,
      rating: null,
      rating_count: null,
      place_type: placeType,
      maps_uri: `https://www.openstreetmap.org/${osmId}`,
      lat: center.lat,
      lng: center.lng,
      source: "base_propria",
      fetched_at: new Date().toISOString(),
    }];
  });

  if (rows.length === 0) return 0;
  const { error } = await admin.from("radar_places").upsert(rows, {
    onConflict: "place_id,category",
  });
  if (error) throw error;
  return rows.length;
}

async function searchStoredPlaces(
  admin: ReturnType<typeof createClient>,
  origin: CepLocation,
  cities: string[],
  categories: string[],
) {
  return await admin.rpc("search_radar_places_by_cities", {
    p_lat: origin.lat,
    p_lng: origin.lng,
    p_state: origin.state,
    p_cities: cities,
    p_categories: categories,
  });
}

async function enrichStoredPlaces(admin: ReturnType<typeof createClient>) {
  const places: StoredPlace[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from("radar_places")
      .select("id,address,lat,lng")
      .or("lat.is.null,lng.is.null")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    places.push(...((data ?? []) as StoredPlace[]));
    if (!data || data.length < pageSize) break;
  }

  const byCep = new Map<string, StoredPlace[]>();
  for (const place of places) {
    const cep = extractCep(place.address);
    if (!cep) continue;
    const matches = byCep.get(cep) ?? [];
    matches.push(place);
    byCep.set(cep, matches);
  }

  const entries = [...byCep.entries()];
  const concurrency = 12;
  for (let index = 0; index < entries.length; index += concurrency) {
    const batch = entries.slice(index, index + concurrency);
    await Promise.all(batch.map(async ([cep, matchingPlaces]) => {
      const location = await locateCep(cep);
      if (!location) return;
      const ids = matchingPlaces.map(({ id }) => id);
      const { error } = await admin
        .from("radar_places")
        .update({
          city: location.city,
          state: location.state,
          lat: location.lat,
          lng: location.lng,
          source: "base_propria",
        })
        .in("id", ids);
      if (error) console.error(`Failed to locate stored CEP ${cep}:`, error.message);
    }));
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return json({ error: "Preencha um CEP, raio e ao menos uma categoria válidos." }, 400);
    }

    const { cep, radius_km: radius, categories, selected_cities: selectedCities } = parsed.data;
    const origin = await locateCep(cep);
    if (!origin) return json({ error: "Não foi possível localizar esse CEP." }, 400);

    const stateCities = await getStateCities(origin.state);
    const stateCitiesByKey = new Map(stateCities.map((city) => [normalizeCity(city), city]));
    const requestedCities = selectedCities?.length ? selectedCities : [origin.city];
    const invalidCity = requestedCities.find((city) => !stateCitiesByKey.has(normalizeCity(city)));
    if (invalidCity) {
      return json({ error: `${invalidCity} não pertence ao estado ${origin.state}.` }, 400);
    }
    const canonicalCities = [...new Set(requestedCities.map((city) =>
      stateCitiesByKey.get(normalizeCity(city)) ?? city
    ))];

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await enrichStoredPlaces(admin);

    let { data, error } = await searchStoredPlaces(admin, origin, canonicalCities, categories);
    if (error) throw error;

    const citiesWithResults = new Set((data ?? []).map((place: Record<string, unknown>) =>
      normalizeCity(place.city)
    ));
    const missingCities = canonicalCities.filter((city) => !citiesWithResults.has(normalizeCity(city)));
    if (missingCities.length > 0) {
      const concurrency = 3;
      for (let index = 0; index < missingCities.length; index += concurrency) {
        const batch = missingCities.slice(index, index + concurrency);
        await Promise.allSettled(batch.map((city) =>
          fillCityFromPublicSource(admin, city, origin.state, categories)
        ));
      }
      const refreshed = await searchStoredPlaces(admin, origin, canonicalCities, categories);
      if (refreshed.error) throw refreshed.error;
      data = refreshed.data;
    }

    const eligiblePlaces = (data ?? [])
      .map((place: Record<string, unknown>) => ({
        ...place,
        category: place.category === "casas_noturnas" ? "casas_de_show" : place.category,
      }))
      .filter((place: Record<string, unknown>) => isMusicOpportunity(place));

    const places = eligiblePlaces
      .map((place: Record<string, unknown>) => ({
        ...place,
        distance_km: Number(place.distance_m) / 1000,
      }));

    return json({
      places,
      state_cities: stateCities,
      source: "base_propria",
      city: origin.city,
      state: origin.state,
      lat: origin.lat,
      lng: origin.lng,
      radius,
    });
  } catch (error) {
    console.error("backs-radar-search error:", error);
    return json({ error: error instanceof Error ? error.message : "Erro inesperado no servidor" }, 500);
  }
});