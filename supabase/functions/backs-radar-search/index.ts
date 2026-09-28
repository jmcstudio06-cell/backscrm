import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { isMusicOpportunity } from "./place-filter.ts";
import { BACKSAI_URL, BACKSAI_PUBLISHABLE_KEY } from "./backsai-source.ts";

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
  selected_cities: z.array(z.string().trim().min(1).max(120)).max(5).optional(),
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

type IbgeCity = {
  nome?: unknown;
};

type AdminClient = SupabaseClient<any, "public", "public", any, any>;

type BacksAiPlace = {
  place_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  types: string[] | null;
  rating: number | null;
  user_rating_count: number | null;
  phone: string | null;
  website: string | null;
};

const CACHE_TARGET_PER_CATEGORY = 10;
const MAX_CITIES_PER_SEARCH = 5;

function backsAiCategory(place: BacksAiPlace): { category: string; placeType: string } | null {
  const types = new Set((place.types ?? []).map((type) => type.toLowerCase()));
  let category: string;
  let placeType: string;
  if (types.has("night_club") || types.has("nightclub") || types.has("music_venue") || types.has("concert_hall") ||
    /casa de shows?|casa noturna|night ?club/i.test(place.name)) {
    category = "casas_de_show";
    placeType = "casa de show";
  } else if (types.has("hotel") || types.has("resort_hotel") || types.has("lodging")) {
    category = "hoteis";
    placeType = "hotel";
  } else if (types.has("bar") || types.has("pub") || types.has("cocktail_bar")) {
    category = "bares";
    placeType = types.has("pub") ? "pub" : "bar";
  } else if (types.has("restaurant")) {
    category = "restaurantes";
    placeType = "restaurante";
  } else return null;

  return isMusicOpportunity({ name: place.name, place_type: placeType, category })
    ? { category, placeType }
    : null;
}

async function fillCityFromBacksAi(
  admin: AdminClient, city: string, state: string, categories: string[],
): Promise<boolean> {
  try {
    let offset = 0;
    const rows: Array<Record<string, unknown>> = [];
    for (let page = 0; page < 10; page++) {
      const params = new URLSearchParams({
        select: "place_id,name,address,city,state,latitude,longitude,types,rating,user_rating_count,phone,website",
        city: `ilike.${city}`,
        state: `eq.${state}`,
        order: "place_id.asc",
      });
      const response = await fetch(`${BACKSAI_URL}/rest/v1/global_places?${params}`, {
        headers: {
          apikey: BACKSAI_PUBLISHABLE_KEY,
          Authorization: `Bearer ${BACKSAI_PUBLISHABLE_KEY}`,
          Range: `${offset}-${offset + 999}`,
        },
        signal: AbortSignal.timeout(9000),
      });
      if (!response.ok) throw new Error(`BacksAI respondeu ${response.status}`);
      const places = await response.json() as BacksAiPlace[];
      if (!Array.isArray(places)) throw new Error("Resposta inválida da base BacksAI");
      for (const place of places) {
        const classification = backsAiCategory(place);
        if (!classification || !categories.includes(classification.category) || !place.phone?.trim() ||
          !place.place_id || !place.name || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude) ||
          normalizeCity(place.city) !== normalizeCity(city) || place.state?.toUpperCase() !== state.toUpperCase()) continue;
        rows.push({
          place_id: place.place_id,
          name: place.name,
          address: place.address,
          city,
          state,
          lat: place.latitude,
          lng: place.longitude,
          phone: place.phone,
          website: place.website,
          rating: place.rating,
          rating_count: place.user_rating_count,
          category: classification.category,
          place_type: classification.placeType,
          maps_uri: `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(place.place_id)}`,
          source: "backsai",
          fetched_at: new Date().toISOString(),
        });
      }
      if (places.length < 1000) break;
      offset += 1000;
    }
    for (let start = 0; start < rows.length; start += 200) {
      const { error } = await admin.from("radar_places")
        .upsert(rows.slice(start, start + 200), { onConflict: "place_id,category" });
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error(`BacksAI import failed for ${city}, ${state}:`, error);
    return false;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const normalizeCity = (value: unknown) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim();

async function locateCep(cep: string): Promise<CepLocation | null> {
  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
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
    { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
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

async function hasRadarAccess(admin: AdminClient, userId: string) {
  let ownerId = userId;
  const { data: membership } = await admin.from("workspace_members")
    .select("owner_id,allowed_features,is_active")
    .eq("member_user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  if (membership?.owner_id) {
    const allowed = Array.isArray(membership.allowed_features) ? membership.allowed_features : [];
    if (!allowed.includes("backs-radar")) return false;
    ownerId = membership.owner_id;
  }

  const { data: profile } = await admin.from("profiles")
    .select("plan,feature_blocks,trial_start,trial_days")
    .eq("user_id", ownerId)
    .maybeSingle();
  const manualSetting = profile?.feature_blocks?.["backs-radar"];
  // Trial accounts never receive free Radar access, even through stale manual overrides.
  if (profile?.plan === "trial" || profile?.plan === "expirado" || profile?.plan === "comprou_expirado") return false;
  if (profile?.trial_start && profile?.trial_days && profile.trial_days > 0 &&
    new Date(profile.trial_start).getTime() + profile.trial_days * 86400000 < Date.now()) return false;
  if (manualSetting === false) return true;
  if (manualSetting === true) return false;
  return ["mensal_executivo", "anual_executivo"].includes(profile?.plan ?? "");
}

async function searchStoredPlaces(
  admin: AdminClient,
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceKey || !anonKey) return json({ error: "Serviço indisponível." }, 503);
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
    if (requestedCities.length > MAX_CITIES_PER_SEARCH) {
      return json({ error: `Selecione no máximo ${MAX_CITIES_PER_SEARCH} cidades por pesquisa.` }, 400);
    }
    
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

    const hasAccess = await hasRadarAccess(admin, user.id);

    let { data, error } = await searchStoredPlaces(admin, origin, canonicalCities, categories);
    if (error) throw error;

    const missingCities = canonicalCities.filter((city) => categories.some((category) => {
      const count = (data ?? []).filter((place: Record<string, unknown>) =>
        normalizeCity(place.city) === normalizeCity(city) &&
        (place.category === category || (category === "casas_de_show" && place.category === "casas_noturnas"))
      ).length;
      return count < CACHE_TARGET_PER_CATEGORY;
    }));

    if (missingCities.length > 0) {
      const fetched = await Promise.all(missingCities.map(async (city) => ({
        city,
        success: await fillCityFromBacksAi(admin, city, origin.state, categories),
      })));
      const refreshed = await searchStoredPlaces(admin, origin, canonicalCities, categories);
      if (!refreshed.error) data = refreshed.data;

      if (fetched.some(({ success }) => !success) && !(data ?? []).length) {
        return json({ error: "A base de contatos está indisponível no momento. Tente novamente mais tarde." }, 503);
      }
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
      // Return only the filtered count to accounts without Radar access.
      locked: !hasAccess,
      count: places.length,
      places: hasAccess ? places : [],
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
