import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const CACHE_DAYS = 30;
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const mapsKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing authorization header" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const state = String(body.state ?? "").trim().toUpperCase().slice(0, 2);
    const city = String(body.city ?? "").trim().slice(0, 80);
    const category = String(body.category ?? "").trim();
    const refresh = body.refresh === true;

    if (!state || state.length !== 2) return json({ error: "Estado inválido" }, 400);
    if (city.length < 2) return json({ error: "Informe a cidade" }, 400);
    if (!CATEGORIES[category]) return json({ error: "Categoria inválida" }, 400);

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const cutoff = new Date(Date.now() - CACHE_DAYS * 86400_000).toISOString();

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
        return json({ places: cached, source: "cache" });
      }
    }

    if (!lovableKey || !mapsKey) {
      return json({ error: "Integração do Google Maps não configurada" }, 500);
    }

    const textQuery = `${CATEGORIES[category]} em ${city} - ${state}, Brasil`;

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
        textQuery,
        languageCode: "pt-BR",
        regionCode: "BR",
        maxResultCount: MAX_RESULTS,
      }),
    });

    if (response.status === 403) {
      const details: Array<{ reason?: string }> =
        (await response.json())?.error?.details ?? [];
      const reason = details.find((d) => d.reason)?.reason;
      if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
        return json({ error: "A chave do Google Maps está restrita por domínio. Ajuste as restrições para 'Nenhuma' ou 'Endereços IP'." }, 403);
      }
      if (reason === "API_KEY_SERVICE_BLOCKED") {
        return json({ error: "A chave do Google Maps não permite a API de Places. Libere essa API na chave." }, 403);
      }
      return json({ error: "Busca no Google Maps recusada (403)." }, 403);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Places request failed [${response.status}]: ${errorBody}`);
      return json({ error: "Falha na busca do Google Maps", status: response.status, details: errorBody }, response.status);
    }

    const result = await response.json();
    const places = (result.places ?? []) as any[];

    const rows = places.map((p) => ({
      place_id: p.id,
      state,
      city,
      category,
      name: p.displayName?.text ?? "Sem nome",
      address: p.formattedAddress ?? null,
      phone: p.nationalPhoneNumber ?? null,
      website: p.websiteUri ?? null,
      rating: p.rating ?? null,
      rating_count: p.userRatingCount ?? null,
      place_type: p.primaryTypeDisplayName?.text ?? null,
      maps_uri: p.googleMapsUri ?? null,
      fetched_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error: upsertError } = await admin
        .from("radar_places")
        .upsert(rows, { onConflict: "place_id,category" });
      if (upsertError) console.error("Cache upsert failed:", upsertError.message);
    }

    return json({ places: rows, source: "google" });
  } catch (err) {
    console.error("backs-radar-search error:", err);
    return json({ error: err instanceof Error ? err.message : "Erro inesperado" }, 500);
  }
});
