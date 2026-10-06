import { describe, expect, test } from "bun:test";
import { getCheckoutPlan } from "./plan-config.ts";

describe("Checkout amounts in cents", () => {
  test("Empresarial monthly charges R$39.90, not Executive pricing", () => {
    expect(getCheckoutPlan("mensal_empresarial")?.amountCents).toBe(3990);
  });
  test("Empresarial yearly charges the displayed R$298.80", () => {
    expect(getCheckoutPlan("anual_empresarial")?.amountCents).toBe(29880);
  });
  test("Executive monthly remains R$79.90", () => {
    expect(getCheckoutPlan("mensal_executivo")?.amountCents).toBe(7990);
  });
  test("Executive yearly remains R$499.90", () => {
    expect(getCheckoutPlan("anual_executivo")?.amountCents).toBe(49990);
  });
  test("Legacy completo uses Empresarial amounts", () => {
    expect(getCheckoutPlan("mensal_completo")?.amountCents).toBe(3990);
    expect(getCheckoutPlan("anual_completo")?.amountCents).toBe(29880);
  });
  test("Unknown plan keys are rejected", () => {
    expect(getCheckoutPlan("toString")).toBeUndefined();
    expect(getCheckoutPlan("invalid")).toBeUndefined();
  });
});