import { describe, expect, it } from "vitest";
import { parseFiltros, serializarFiltros } from "@/lib/filtros";
import type { Filtros } from "@/lib/tipos";

const PADROES: Filtros = { tipo: "filme", streamings: [], genero: null, ordem: "populares", pagina: 1 };

describe("parseFiltros", () => {
  it("usa os padrões quando a URL está vazia", () => {
    expect(parseFiltros({})).toEqual(PADROES);
  });

  it("lê todos os parâmetros válidos", () => {
    expect(
      parseFiltros({ tipo: "serie", streamings: "8,119", genero: "35", ordem: "avaliados", pagina: "3" }),
    ).toEqual({ tipo: "serie", streamings: [8, 119], genero: 35, ordem: "avaliados", pagina: 3 });
  });

  it("troca valores inválidos pelos padrões", () => {
    expect(parseFiltros({ tipo: "xyz", genero: "abc", ordem: "xyz", pagina: "999" })).toEqual(PADROES);
  });

  it.each(["0", "-2", "1.5"])("pagina %s vira 1", (pagina) => {
    expect(parseFiltros({ pagina }).pagina).toBe(1);
  });

  it("aceita pagina 500", () => {
    expect(parseFiltros({ pagina: "500" }).pagina).toBe(500);
  });

  it("URL vence o cookie", () => {
    expect(parseFiltros({ streamings: "337" }, "8,119").streamings).toEqual([337]);
  });

  it("usa o cookie quando a URL não tem streamings", () => {
    expect(parseFiltros({}, "8,119").streamings).toEqual([8, 119]);
  });

  it("usa o primeiro valor quando o parâmetro vem repetido", () => {
    expect(parseFiltros({ tipo: ["serie", "filme"] }).tipo).toBe("serie");
  });
});

describe("serializarFiltros", () => {
  it("omite todos os valores padrão", () => {
    expect(serializarFiltros(PADROES)).toBe("");
  });

  it("faz ida e volta sem perder nada", () => {
    const f: Filtros = { tipo: "serie", streamings: [8, 119], genero: 35, ordem: "lancamentos", pagina: 2 };
    const params = new URLSearchParams(serializarFiltros(f));
    expect(params.get("streamings")).toBe("8,119");
    expect(parseFiltros(Object.fromEntries(params))).toEqual(f);
  });
});
