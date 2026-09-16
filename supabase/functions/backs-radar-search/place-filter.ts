export type RadarPlaceCandidate = {
  category?: unknown;
  name?: unknown;
  place_type?: unknown;
};

const normalize = (value: unknown) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const includesAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(term));

const EXCLUDED_TERMS = [
  "salao de festa",
  "espaco para festa",
  "local para evento",
  "espaco de evento",
  "espaco eventos",
  "buffet",
  "chacara",
  "sitio",
  "locacao",
  "artigos domesticos",
  "loja",
  "decoracao",
  "casamento",
  "cerimonial",
];

const BAR_TERMS = [
  "bar",
  "boteco",
  "pub",
  "choperia",
  "cervejaria",
  "gastrobar",
  "lounge",
];

const NIGHTLIFE_TERMS = [
  "casa noturna",
  "boate",
  "night club",
  "nightclub",
  "balada",
  "club",
  "lounge",
];

const LIVE_MUSIC_TERMS = [
  "musica ao vivo",
  "music bar",
  "live bar",
  "show",
  "shows",
  "casa de show",
  "teatro",
  "concert",
  "karaoke",
  "cultural",
];

export function isMusicOpportunity(place: RadarPlaceCandidate): boolean {
  const category = normalize(place.category);
  const name = normalize(place.name);
  const placeType = normalize(place.place_type);
  const searchable = `${name} ${placeType}`;

  if (!name || includesAny(searchable, EXCLUDED_TERMS)) return false;

  if (category === "bares") {
    return includesAny(searchable, BAR_TERMS);
  }

  if (category === "casas noturnas") {
    return includesAny(searchable, NIGHTLIFE_TERMS);
  }

  if (category === "restaurantes") {
    return includesAny(searchable, LIVE_MUSIC_TERMS) || includesAny(searchable, BAR_TERMS);
  }

  if (category === "hoteis") {
    return includesAny(searchable, LIVE_MUSIC_TERMS);
  }

  if (category === "casas de show") {
    return includesAny(searchable, LIVE_MUSIC_TERMS) || includesAny(searchable, NIGHTLIFE_TERMS) || includesAny(searchable, BAR_TERMS);
  }

  return false;
}