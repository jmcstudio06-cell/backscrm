import { test, expect } from "bun:test";
import { MONTHLY_SHOW_RANGES, signupArtistInfoSchema } from "./signupArtistInfo";

test("accepts the five requested monthly ranges with city and state", () => {
  expect([...MONTHLY_SHOW_RANGES]).toEqual(["0 a 2", "2 a 5", "5 a 10", "10 a 15", "Mais de 15"]);
  for (const range of MONTHLY_SHOW_RANGES) {
    expect(signupArtistInfoSchema.parse({ city: " Cruzeiro ", state: "SP", monthly_show_range: range })).toEqual({ city: "Cruzeiro", state: "SP", monthly_show_range: range });
  }
});
test("requires a valid city, Brazilian state and monthly range", () => {
  const valid = { city: "São José dos Campos", state: "SP", monthly_show_range: "5 a 10" };
  for (const invalid of [{ city: "" }, { city: "<script>" }, { city: "a".repeat(101) }, { state: "XX" }, { monthly_show_range: "" }, { monthly_show_range: "20 a 30" }]) {
    expect(signupArtistInfoSchema.safeParse({ ...valid, ...invalid }).success).toBe(false);
  }
});