import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { isMusicOpportunity } from "./place-filter.ts";

Deno.test("exclui espaços de festas, eventos e lojas", () => {
  const invalidPlaces = [
    { category: "casas_de_show", name: "CasaGrande Salão de Festas", place_type: "Salão de festas" },
    { category: "casas_de_show", name: "Espaço Capela", place_type: "Local para eventos" },
    { category: "casas_de_show", name: "Festa Fácil", place_type: "Loja de artigos domésticos" },
    { category: "casas_de_show", name: "Buffet Carinhoso", place_type: "Salão de festas" },
  ];

  for (const place of invalidPlaces) assertEquals(isMusicOpportunity(place), false);
});

Deno.test("filtro de bares não aceita restaurantes e hamburguerias cadastrados incorretamente", () => {
  const wrongBarPlaces = [
    { category: "bares", name: "Restaurante Essência do Vale", place_type: "Restaurante" },
    { category: "bares", name: "Snack bar crz", place_type: "Hamburgueria" },
  ];

  for (const place of wrongBarPlaces) assertEquals(isMusicOpportunity(place), false);
});

Deno.test("cada local aparece somente em sua categoria correta", () => {
  const mismatchedPlaces = [
    { category: "bares", name: "Restaurante Central", place_type: "Restaurante" },
    { category: "restaurantes", name: "Bar Central", place_type: "Bar" },
    { category: "hoteis", name: "Pousada Central", place_type: "Pousada" },
    { category: "casas_de_show", name: "Restaurante Central", place_type: "Restaurante" },
  ];

  for (const place of mismatchedPlaces) assertEquals(isMusicOpportunity(place), false);
});

Deno.test("mantém locais com oportunidade clara para música", () => {
  const validPlaces = [
    { category: "bares", name: "Ferreira Lounge Bar", place_type: "Lounge bar" },
    { category: "restaurantes", name: "Restaurante Central", place_type: "Restaurante" },
    { category: "hoteis", name: "Hotel Central", place_type: "Hotel" },
    { category: "casas_de_show", name: "Casa de Show Central", place_type: "Casa de show" },
    { category: "casas_noturnas", name: "Secret Club", place_type: "Casa noturna" },
  ];

  for (const place of validPlaces) assertEquals(isMusicOpportunity(place), true);
});