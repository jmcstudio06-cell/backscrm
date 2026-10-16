import { expect, test } from "bun:test";
import { prepareMirroredShow } from "../src/lib/mirroredShow";
import { isConfirmedShowStatus } from "../src/lib/showStatus";

test("every mirrored show starts with the app's Pagamento pendente status", () => {
  for (const status of [undefined, "pending", "scheduled", "confirmed", "partial", "completed", "cancelled"]) {
    const mirrored = prepareMirroredShow({ title: "Show", date: "2026-11-20", status });
    expect(mirrored.status).toBe("confirmed");
    expect(isConfirmedShowStatus(mirrored.status)).toBe(true);
  }
});