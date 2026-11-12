import { describe, expect, it } from "vitest";
import { idDaRota } from "@/lib/rota";

describe("idDaRota", () => {
  it("aceita inteiro positivo", () => {
    expect(idDaRota("603")).toBe(603);
  });

  it.each(["abc", "0", "-1", "1.5", ""])("rejeita %j", (valor) => {
    expect(idDaRota(valor)).toBeNull();
  });
});
