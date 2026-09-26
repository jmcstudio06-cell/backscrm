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

const BAR_PLACE_TYPES = [
  "bar",
  "bares",
  "bar e grill",
  "lounge bar",
  "cervejaria",
  "choperia",
  "pub",
  "gastrobar",
  "social club",
  "nightclub",
];

const NIGHTLIFE_TERMS = [
  "casa noturna",
  "boate",
  "night club",
  "nightclub",
  "balada",
  "club",
  "lounge",
  "disco",
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
  "arena",
  "estadio",
];

export function isMusicOpportunity(place: RadarPlaceCandidate): boolean {
  const storedCategory = normalize(place.category);
  const category = storedCategory === "casas noturnas" ? "casas de show" : (storedCategory === "bares" ? "bares" : (storedCategory === "restaurantes" ? "restaurantes" : (storedCategory === "hoteis" ? "hoteis" : storedCategory)));
  const name = normalize(place.name);
  const placeType = normalize(place.place_type);
  const searchable = `${name} ${placeType}`;

  if (!name || includesAny(searchable, EXCLUDED_TERMS)) return false;

  // For bares and restaurantes, if the category matches and it's not excluded, we're more lenient
  if (category === "bares") {
    return BAR_PLACE_TYPES.includes(placeType);
  }

  if (category === "restaurantes") {
    return placeType.includes("restaurante") || placeType === "restaurant" || placeType === "food court";
  }

  if (category === "hoteis") {
    return placeType === "hotel" || placeType === "hotel resort" || placeType === "resort" || placeType === "hostel";
  }

  if (category === "casas de show") {
    return placeType === "casa de show" || placeType === "music venue" ||
      placeType === "nightclub" || includesAny(placeType, NIGHTLIFE_TERMS) ||
      ((placeType === "teatro" || placeType === "auditorio" || placeType === "arts centre") && includesAny(name, LIVE_MUSIC_TERMS)) ||
      (placeType.length === 0 && includesAny(name, ["casa de show", "music bar", "musica ao vivo"]));
  }

  // Fallback for new categories or slight mismatches
  const normalizedCategory = category.replace(/\s+/g, "_");
  if (normalizedCategory === "casas_de_show" || category === "casas de show") {
     return placeType === "music venue" || placeType === "nightclub" || includesAny(searchable, LIVE_MUSIC_TERMS);
  }

  return false;
}
