import { describe, expect, it } from "vitest";
import { COOKIE_STREAMINGS, cookieStreamings, lerIdsStreamings } from "@/lib/cookies";

describe("cookies de streamings", () => {
  it("usa o nome meus_streamings", () => {
    expect(COOKIE_STREAMINGS).toBe("meus_streamings");
  });

  it("descarta IDs inválidos e repetidos de um cookie corrompido", () => {
    expect(lerIdsStreamings("abc,8,,-1,8")).toEqual([8]);
  });

  it("retorna lista vazia quando não há cookie", () => {
    expect(lerIdsStreamings(undefined)).toEqual([]);
  });

  it("monta a string completa do cookie com validade de 1 ano", () => {
    expect(cookieStreamings([8, 119])).toBe(
      "meus_streamings=8,119; max-age=31536000; path=/; SameSite=Lax",
    );
  });
});
