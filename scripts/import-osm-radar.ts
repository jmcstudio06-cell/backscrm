/**
 * import-osm-radar.ts
 * 
 * Baixa dados de estabelecimentos do OpenStreetMap via Overpass API
 * e popula a tabela radar_places do Supabase com lat/lng.
 * 
 * Uso:
 *   npx tsx scripts/import-osm-radar.ts
 *   npx tsx scripts/import-osm-radar.ts --state SP
 *   npx tsx scripts/import-osm-radar.ts --state SP --category bares
 * 
 * Variáveis necessárias no .env:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (ou VITE_SUPABASE_PUBLISHABLE_KEY para teste)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ── Configuração ─────────────────────────────────────────────
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const BATCH_SIZE   = 200;   // inserções por batch no Supabase
const DELAY_MS     = 2000;  // pausa entre queries Overpass (respeitar rate limit)

// Carrega .env manualmente (sem dotenv para manter zero deps extras)
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY
                   || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Mapeamento OSM → categoria do app ─────────────────────────
// OSM tags: https://wiki.openstreetmap.org/wiki/Key:amenity
const CATEGORY_QUERIES: Record<string, string> = {
  bares: `
    node["amenity"="bar"]["phone"](area.state);
    node["amenity"="pub"]["phone"](area.state);
    node["amenity"="nightclub"]["phone"](area.state);
    way["amenity"="bar"]["phone"](area.state);
    way["amenity"="pub"]["phone"](area.state);
  `,
  restaurantes: `
    node["amenity"="restaurant"]["phone"](area.state);
    node["amenity"="fast_food"]["phone"](area.state);
    way["amenity"="restaurant"]["phone"](area.state);
  `,
  hoteis: `
    node["tourism"="hotel"]["phone"](area.state);
    node["tourism"="resort"]["phone"](area.state);
    way["tourism"="hotel"]["phone"](area.state);
    way["tourism"="resort"]["phone"](area.state);
  `,
  casas_noturnas: `
    node["amenity"="nightclub"]["phone"](area.state);
    node["amenity"="music_venue"]["phone"](area.state);
    way["amenity"="nightclub"]["phone"](area.state);
  `,
  casas_de_show: `
    node["amenity"="music_venue"]["phone"](area.state);
    node["amenity"="theatre"]["phone"](area.state);
    node["leisure"="music_venue"]["phone"](area.state);
    way["amenity"="music_venue"]["phone"](area.state);
    way["amenity"="theatre"]["phone"](area.state);
  `,
  buffets: `
    node["amenity"="events_venue"]["phone"](area.state);
    node["amenity"="community_centre"]["phone"](area.state);
    node["leisure"="banquet_hall"]["phone"](area.state);
    way["amenity"="events_venue"]["phone"](area.state);
    way["leisure"="banquet_hall"]["phone"](area.state);
  `,
};

// Relação OSM para cada estado brasileiro
// Fonte: https://www.openstreetmap.org/relation/[id]
const STATE_RELATIONS: Record<string, { id: number; uf: string; name: string }> = {
  SP: { id: 298285,  uf: "SP", name: "São Paulo" },
  MG: { id: 298266,  uf: "MG", name: "Minas Gerais" },
  RJ: { id: 298115,  uf: "RJ", name: "Rio de Janeiro" },
  RS: { id: 298084,  uf: "RS", name: "Rio Grande do Sul" },
  PR: { id: 298404,  uf: "PR", name: "Paraná" },
  SC: { id: 296584,  uf: "SC", name: "Santa Catarina" },
  BA: { id: 298163,  uf: "BA", name: "Bahia" },
  GO: { id: 298374,  uf: "GO", name: "Goiás" },
  ES: { id: 298171,  uf: "ES", name: "Espírito Santo" },
  DF: { id: 302271,  uf: "DF", name: "Distrito Federal" },
  CE: { id: 298158,  uf: "CE", name: "Ceará" },
  PE: { id: 298183,  uf: "PE", name: "Pernambuco" },
  AM: { id: 298311,  uf: "AM", name: "Amazonas" },
  PA: { id: 298401,  uf: "PA", name: "Pará" },
  MT: { id: 298234,  uf: "MT", name: "Mato Grosso" },
  MS: { id: 298271,  uf: "MS", name: "Mato Grosso do Sul" },
  MA: { id: 298173,  uf: "MA", name: "Maranhão" },
  RN: { id: 298180,  uf: "RN", name: "Rio Grande do Norte" },
  PB: { id: 298185,  uf: "PB", name: "Paraíba" },
  AL: { id: 298168,  uf: "AL", name: "Alagoas" },
  SE: { id: 298188,  uf: "SE", name: "Sergipe" },
  PI: { id: 298190,  uf: "PI", name: "Piauí" },
  RO: { id: 298427,  uf: "RO", name: "Rondônia" },
  TO: { id: 298437,  uf: "TO", name: "Tocantins" },
  AC: { id: 298310,  uf: "AC", name: "Acre" },
  AP: { id: 298305,  uf: "AP", name: "Amapá" },
  RR: { id: 298312,  uf: "RR", name: "Roraima" },
};

// ── Utilitários ───────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function formatPhone(raw: string | undefined): string | null {
  if (!raw) return null;
  // Pega o primeiro número se houver vários separados por ;
  const first = raw.split(";")[0].trim();
  // Remove tudo que não é dígito ou +
  const digits = first.replace(/[^\d+]/g, "");
  if (digits.length < 8) return null;
  return first; // mantém formatação original do OSM
}

function getCenter(element: any): { lat: number; lng: number } | null {
  if (element.type === "node") {
    return { lat: element.lat, lng: element.lon };
  }
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
}

function osmToRow(element: any, category: string, state: string, city: string) {
  const tags = element.tags || {};
  const center = getCenter(element);
  if (!center) return null;

  const phone = formatPhone(tags.phone || tags["contact:phone"] || tags["phone:BR"]);
  if (!phone) return null;

  const name = tags.name || tags["name:pt"] || "Sem nome";
  const osmId = `${element.type}/${element.id}`;

  return {
    place_id:     `osm_${element.id}`,
    osm_id:       osmId,
    state,
    city,
    category,
    name,
    address:      [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]]
                    .filter(Boolean).join(", ") || null,
    phone,
    website:      tags.website || tags["contact:website"] || null,
    rating:       null,
    rating_count: null,
    place_type:   tags.amenity || tags.tourism || tags.leisure || null,
    maps_uri:     `https://www.openstreetmap.org/${osmId}`,
    lat:          center.lat,
    lng:          center.lng,
    source:       "osm",
    fetched_at:   new Date().toISOString(),
  };
}

// ── Query Overpass ─────────────────────────────────────────────
async function queryOverpass(stateRelId: number, categoryQuery: string): Promise<any[]> {
  const query = `
    [out:json][timeout:120];
    area(${3600000000 + stateRelId})->.state;
    (
      ${categoryQuery}
    );
    out body center;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Overpass error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.elements || [];
}

// ── Upsert batch no Supabase ────────────────────────────────────
async function upsertBatch(rows: any[]): Promise<number> {
  if (rows.length === 0) return 0;

  const { error, count } = await supabase
    .from("radar_places")
    .upsert(rows, { onConflict: "place_id,category" })
    .select("place_id", { count: "exact", head: true });

  if (error) {
    console.error("  ⚠ Upsert error:", error.message);
    return 0;
  }
  return rows.length;
}

// ── Import por estado + categoria ─────────────────────────────
async function importStateCategory(
  state: typeof STATE_RELATIONS[string],
  categoryKey: string
) {
  console.log(`\n  📡 ${state.name} (${state.uf}) — ${categoryKey}`);

  let elements: any[];
  try {
    elements = await queryOverpass(state.id, CATEGORY_QUERIES[categoryKey]);
  } catch (err: any) {
    console.error(`  ❌ Overpass falhou: ${err.message}`);
    return 0;
  }

  console.log(`     OSM retornou ${elements.length} elementos`);

  const rows: any[] = [];
  for (const el of elements) {
    const row = osmToRow(el, categoryKey, state.uf, el.tags?.["addr:city"] || state.name);
    if (row) rows.push(row);
  }

  console.log(`     Com telefone válido: ${rows.length}`);

  // Upsert em batches
  let total = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const n = await upsertBatch(batch);
    total += n;
    process.stdout.write(`     Inseridos: ${total}/${rows.length}\r`);
  }

  console.log(`     ✅ ${total} locais inseridos/atualizados`);
  return total;
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const stateArg   = args.find((_, i) => args[i - 1] === "--state");
  const catArg     = args.find((_, i) => args[i - 1] === "--category");

  const statesToRun = stateArg
    ? [STATE_RELATIONS[stateArg.toUpperCase()]].filter(Boolean)
    : Object.values(STATE_RELATIONS);

  const categoriesToRun = catArg
    ? [catArg]
    : Object.keys(CATEGORY_QUERIES);

  if (!statesToRun.length) {
    console.error(`Estado inválido: ${stateArg}`);
    process.exit(1);
  }

  console.log("🗺  Backs Radar — Import OSM");
  console.log(`   Estados: ${statesToRun.map(s => s.uf).join(", ")}`);
  console.log(`   Categorias: ${categoriesToRun.join(", ")}`);
  console.log(`   Supabase: ${SUPABASE_URL}\n`);

  let grandTotal = 0;

  for (const state of statesToRun) {
    for (const cat of categoriesToRun) {
      grandTotal += await importStateCategory(state, cat);
      await sleep(DELAY_MS); // respeita rate limit da Overpass API
    }
  }

  console.log(`\n🎉 Import concluído! Total inserido/atualizado: ${grandTotal} locais`);

  // Atualiza a coluna geom para todos os registros OSM sem geom
  console.log("\n🔄 Sincronizando coluna geom...");
  const { error: geomErr } = await supabase.rpc("sync_all_geom" as any);
  if (geomErr) {
    // Fallback: atualiza via update direto
    console.log("   (sync_all_geom não existe, use a migration SQL para atualizar geom)");
  } else {
    console.log("   ✅ geom sincronizado");
  }
}

main().catch(err => {
  console.error("\n❌ Erro fatal:", err);
  process.exit(1);
});
