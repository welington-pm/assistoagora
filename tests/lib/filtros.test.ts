import { describe, expect, it } from "vitest";
import { parseFiltros, sanearFiltros, serializarFiltros } from "@/lib/filtros";
import type { Filtros } from "@/lib/tipos";

const PADROES: Filtros = {
  tipo: "filme",
  streamings: [],
  genero: null,
  ordem: "populares",
  pagina: 1,
  notaMin: null,
  notaMax: null,
};

describe("parseFiltros", () => {
  it("usa os padrões quando a URL está vazia", () => {
    expect(parseFiltros({})).toEqual(PADROES);
  });

  it("lê todos os parâmetros válidos", () => {
    expect(
      parseFiltros({
        tipo: "serie",
        streamings: "8,119",
        genero: "35",
        ordem: "avaliados",
        pagina: "3",
        nota_min: "6",
        nota_max: "8",
      }),
    ).toEqual({ tipo: "serie", streamings: [8, 119], genero: 35, ordem: "avaliados", pagina: 3, notaMin: 6, notaMax: 8 });
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

  it("aceita só um dos lados da faixa de notas", () => {
    expect(parseFiltros({ nota_min: "7" })).toMatchObject({ notaMin: 7, notaMax: null });
    expect(parseFiltros({ nota_max: "5" })).toMatchObject({ notaMin: null, notaMax: 5 });
  });

  it.each([
    ["0", "1"],
    ["10", "11"],
    ["6.5", "8.5"],
    ["abc", "-3"],
  ])("descarta notas fora da faixa: de %s até %s", (nota_min, nota_max) => {
    expect(parseFiltros({ nota_min, nota_max })).toMatchObject({ notaMin: null, notaMax: null });
  });

  it("inverte uma faixa invertida em vez de mostrar uma lista vazia", () => {
    expect(parseFiltros({ nota_min: "8", nota_max: "5" })).toMatchObject({ notaMin: 5, notaMax: 8 });
  });

  it("faixa com o mesmo número nos dois lados vira só a nota mínima", () => {
    expect(parseFiltros({ nota_min: "7", nota_max: "7" })).toMatchObject({ notaMin: 7, notaMax: null });
  });
});

describe("serializarFiltros", () => {
  it("omite todos os valores padrão", () => {
    expect(serializarFiltros(PADROES)).toBe("");
  });

  it("faz ida e volta sem perder nada", () => {
    const f: Filtros = {
      tipo: "serie",
      streamings: [8, 119],
      genero: 35,
      ordem: "lancamentos",
      pagina: 2,
      notaMin: 6,
      notaMax: 9,
    };
    const params = new URLSearchParams(serializarFiltros(f));
    expect(params.get("streamings")).toBe("8,119");
    expect(params.get("nota_min")).toBe("6");
    expect(params.get("nota_max")).toBe("9");
    expect(parseFiltros(Object.fromEntries(params))).toEqual(f);
  });
});

describe("sanearFiltros", () => {
  const STREAMINGS = [
    { id: 8, nome: "Netflix", logo: null, prioridade: 0 },
    { id: 119, nome: "Prime Video", logo: null, prioridade: 2 },
  ];
  const GENEROS = [{ id: 35, nome: "Comédia" }];

  it("descarta um gênero que não existe para o tipo", () => {
    expect(sanearFiltros({ ...PADROES, tipo: "serie", genero: 28 }, STREAMINGS, GENEROS).genero).toBeNull();
  });

  it("mantém um gênero válido", () => {
    expect(sanearFiltros({ ...PADROES, genero: 35 }, STREAMINGS, GENEROS).genero).toBe(35);
  });

  it("descarta streamings que não estão no catálogo, mantendo a ordem", () => {
    expect(sanearFiltros({ ...PADROES, streamings: [119, 99999, 8] }, STREAMINGS, GENEROS).streamings).toEqual([119, 8]);
  });
});
