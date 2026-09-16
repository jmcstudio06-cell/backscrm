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

Deno.test("mantém locais com oportunidade clara para música", () => {
  const validPlaces = [
    { category: "bares", name: "Ferreira Lounge Bar", place_type: "Lounge bar" },
    { category: "casas_noturnas", name: "Secret Club", place_type: "Casa noturna" },
    { category: "restaurantes", name: "Restaurante com Música ao Vivo", place_type: "Restaurante" },
    { category: "hoteis", name: "Hotel Música ao Vivo", place_type: "Hotel" },
    { category: "casas_de_show", name: "Madame Café Music Bar", place_type: "Bar" },
  ];

  for (const place of validPlaces) assertEquals(isMusicOpportunity(place), true);
});