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

const BAR_PLACE_TYPES = [
  "bar",
  "bares",
  "bar e grill",
  "lounge bar",
  "cervejaria",
  "choperia",
  "pub",
  "gastrobar",
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
    return BAR_PLACE_TYPES.includes(placeType);
  }

  if (category === "restaurantes") {
    return placeType.includes("restaurante");
  }

  if (category === "hoteis") {
    return placeType === "hotel" || placeType === "hotel resort";
  }

  if (category === "casas de show") {
    return placeType === "casa de show" ||
      ((placeType === "teatro" || placeType === "auditorio") && includesAny(name, LIVE_MUSIC_TERMS)) ||
      (placeType.length === 0 && includesAny(name, ["casa de show", "music bar", "musica ao vivo"]));
  }

  return false;
}