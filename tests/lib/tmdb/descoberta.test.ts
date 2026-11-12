import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));

import { descobrir, mapearTitulo, montarParametrosDescoberta } from "@/lib/tmdb/descoberta";
import type { Filtros } from "@/lib/tipos";

const BASE: Filtros = {
  tipo: "filme",
  streamings: [],
  genero: null,
  ordem: "populares",
  pagina: 1,
  notaMin: null,
  notaMax: null,
};
const HOJE = "2026-11-12";

describe("montarParametrosDescoberta", () => {
  it("monta a base para filmes populares", () => {
    const p = montarParametrosDescoberta(BASE, HOJE);
    expect(p).toMatchObject({
      watch_region: "BR",
      with_watch_monetization_types: "flatrate",
      sort_by: "popularity.desc",
      page: 1,
    });
    expect(p.with_watch_providers).toBeUndefined();
    expect(p.with_genres).toBeUndefined();
    expect(p["vote_average.gte"]).toBeUndefined();
    expect(p["vote_average.lte"]).toBeUndefined();
    expect(p["vote_count.gte"]).toBeUndefined();
  });

  it("faixa de notas vira vote_average, sem mínimo de votos", () => {
    const p = montarParametrosDescoberta({ ...BASE, notaMin: 6, notaMax: 8 }, HOJE);
    expect(p["vote_average.gte"]).toBe(6);
    expect(p["vote_average.lte"]).toBe(8);
    expect(p["vote_count.gte"]).toBeUndefined();
  });

  it("aceita só a nota máxima", () => {
    const p = montarParametrosDescoberta({ ...BASE, notaMax: 5 }, HOJE);
    expect(p["vote_average.gte"]).toBeUndefined();
    expect(p["vote_average.lte"]).toBe(5);
    expect(p["vote_count.gte"]).toBeUndefined();
  });

  it("avaliados com faixa de notas continua exigindo 200 votos", () => {
    const p = montarParametrosDescoberta({ ...BASE, ordem: "avaliados", notaMin: 7 }, HOJE);
    expect(p["vote_average.gte"]).toBe(7);
    expect(p["vote_count.gte"]).toBe(200);
  });

  it("junta streamings com | (OU) e inclui o gênero", () => {
    const p = montarParametrosDescoberta({ ...BASE, streamings: [8, 119], genero: 35 }, HOJE);
    expect(p.with_watch_providers).toBe("8|119");
    expect(p.with_genres).toBe("35");
  });

  it.each(["filme", "serie"] as const)("avaliados (%s) exige 200 votos", (tipo) => {
    const p = montarParametrosDescoberta({ ...BASE, tipo, ordem: "avaliados" }, HOJE);
    expect(p.sort_by).toBe("vote_average.desc");
    expect(p["vote_count.gte"]).toBe(200);
  });

  it("lançamentos de filme usam a data de estreia até hoje", () => {
    const p = montarParametrosDescoberta({ ...BASE, ordem: "lancamentos" }, HOJE);
    expect(p.sort_by).toBe("primary_release_date.desc");
    expect(p["primary_release_date.lte"]).toBe(HOJE);
  });

  it("lançamentos de série usam a primeira exibição até hoje", () => {
    const p = montarParametrosDescoberta({ ...BASE, tipo: "serie", ordem: "lancamentos" }, HOJE);
    expect(p.sort_by).toBe("first_air_date.desc");
    expect(p["first_air_date.lte"]).toBe(HOJE);
  });
});

describe("mapearTitulo", () => {
  it("mapeia um filme e arredonda a nota para 1 casa", () => {
    expect(
      mapearTitulo(
        { id: 1, title: "X", release_date: "2024-05-01", vote_average: 7.84, vote_count: 10, poster_path: "/p.jpg", genre_ids: [18] },
        "filme",
      ),
    ).toEqual({ id: 1, tipo: "filme", titulo: "X", ano: "2024", nota: 7.8, capa: "/p.jpg", generoIds: [18] });
  });

  it("usa name e first_air_date para séries", () => {
    const t = mapearTitulo(
      { id: 2, name: "S", first_air_date: "1999-09-20", vote_average: 8, vote_count: 5, poster_path: null, genre_ids: [] },
      "serie",
    );
    expect(t.titulo).toBe("S");
    expect(t.ano).toBe("1999");
    expect(t.tipo).toBe("serie");
  });

  it("lida com dados faltando (sem data, sem capa, 0 votos)", () => {
    const t = mapearTitulo(
      { id: 3, title: "Y", release_date: "", vote_average: 0, vote_count: 0, poster_path: null, genre_ids: [] },
      "filme",
    );
    expect(t.ano).toBeNull();
    expect(t.capa).toBeNull();
    expect(t.nota).toBeNull();
  });
});

describe("descobrir", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_READ_TOKEN", "tok");
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("chama /discover/tv para séries e limita totalPaginas a 500", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        page: 3,
        total_pages: 9000,
        results: [{ id: 2, name: "S", first_air_date: "2020-01-01", vote_average: 7, vote_count: 3, poster_path: "/s.jpg", genre_ids: [35] }],
      }),
    });
    const r = await descobrir({ ...BASE, tipo: "serie", pagina: 3 });
    expect(fetchMock.mock.calls[0][0]).toContain("/discover/tv?");
    expect(r.totalPaginas).toBe(500);
    expect(r.pagina).toBe(3);
    expect(r.titulos[0].titulo).toBe("S");
  });
});
