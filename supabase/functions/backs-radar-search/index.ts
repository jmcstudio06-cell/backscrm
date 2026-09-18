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
  selected_cities: z.array(z.string().trim().min(1).max(120)).max(30).optional(),
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

    const { data, error } = await admin.rpc("search_radar_places_by_cities", {
      p_lat: origin.lat,
      p_lng: origin.lng,
      p_state: origin.state,
      p_cities: canonicalCities,
      p_categories: categories,
    });
    if (error) throw error;

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