import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));

import { TmdbError } from "@/lib/tmdb/cliente";
import { buscarDetalhes, escolherTrailer, extrairOndeAssistir, type VideoTmdb } from "@/lib/tmdb/detalhes";

function video(v: Partial<VideoTmdb>): VideoTmdb {
  return { key: "K", name: "N", site: "YouTube", type: "Trailer", iso_639_1: "en", ...v };
}

describe("escolherTrailer", () => {
  it("prefere o trailer em português", () => {
    const t = escolherTrailer([
      video({ type: "Teaser", iso_639_1: "pt", key: "TEASER" }),
      video({ iso_639_1: "en", key: "EN" }),
      video({ iso_639_1: "pt", key: "PT", name: "Trailer PT" }),
    ]);
    expect(t).toEqual({ chaveYoutube: "PT", nome: "Trailer PT" });
  });

  it("usa o inglês quando não há português", () => {
    expect(escolherTrailer([video({ iso_639_1: "es", key: "ES" }), video({ iso_639_1: "en", key: "EN" })])?.chaveYoutube).toBe("EN");
  });

  it("usa qualquer idioma quando não há pt nem en", () => {
    expect(escolherTrailer([video({ iso_639_1: "es", key: "ES" })])?.chaveYoutube).toBe("ES");
  });

  it("ignora vídeos fora do YouTube e retorna null sem trailer", () => {
    expect(escolherTrailer([video({ site: "Vimeo" }), video({ type: "Featurette" })])).toBeNull();
  });
});

describe("extrairOndeAssistir", () => {
  it("retorna vazio sem dados do Brasil", () => {
    expect(extrairOndeAssistir({ results: { US: { flatrate: [] } } })).toEqual([]);
    expect(extrairOndeAssistir({})).toEqual([]);
  });

  it("retorna só assinatura (flatrate), ordenado por prioridade", () => {
    const r = extrairOndeAssistir({
      results: {
        BR: {
          flatrate: [
            { provider_id: 2, provider_name: "B", logo_path: "/b.png", display_priority: 48 },
            { provider_id: 1, provider_name: "A", logo_path: "/a.png", display_priority: 9 },
          ],
          rent: [{ provider_id: 3, provider_name: "Aluguel", logo_path: null, display_priority: 1 }],
        },
      },
    });
    expect(r.map((s) => s.nome)).toEqual(["A", "B"]);
  });
});

describe("buscarDetalhes", () => {
  const fetchMock = vi.fn();
  const elenco = Array.from({ length: 15 }, (_, i) => ({ id: i, name: `Ator ${i}`, character: `Papel ${i}`, profile_path: null }));
  const comum = {
    overview: "Sinopse",
    vote_average: 8.24,
    vote_count: 100,
    poster_path: "/p.jpg",
    backdrop_path: "/b.jpg",
    genres: [{ id: 28, name: "Ação" }, { id: 878, name: "Ficção científica" }],
    credits: { cast: elenco },
    videos: { results: [video({ iso_639_1: "pt", key: "PT" })] },
    "watch/providers": { results: { BR: { flatrate: [{ provider_id: 1899, provider_name: "HBO Max", logo_path: "/h.png", display_priority: 9 }] } } },
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_READ_TOKEN", "tok");
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("monta os detalhes de um filme", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...comum, id: 603, title: "Matrix", release_date: "1999-03-30", runtime: 136 }),
    });
    const d = await buscarDetalhes("filme", 603);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/movie/603?");
    expect(decodeURIComponent(url)).toContain("append_to_response=credits,videos,watch/providers");
    expect(d).toMatchObject({
      id: 603,
      tipo: "filme",
      titulo: "Matrix",
      ano: "1999",
      nota: 8.2,
      duracaoMin: 136,
      temporadas: null,
      generos: ["Ação", "Ficção científica"],
      trailer: { chaveYoutube: "PT" },
    });
    expect(d?.elenco).toHaveLength(10);
    expect(d?.elenco[0]).toEqual({ id: 0, nome: "Ator 0", personagem: "Papel 0", foto: null });
    expect(d?.ondeAssistir.map((s) => s.nome)).toEqual(["HBO Max"]);
  });

  it("monta os detalhes de uma série", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...comum, id: 2, name: "Série", first_air_date: "2020-01-01", number_of_seasons: 3 }),
    });
    const d = await buscarDetalhes("serie", 2);
    expect(fetchMock.mock.calls[0][0]).toContain("/tv/2?");
    expect(d).toMatchObject({ titulo: "Série", ano: "2020", temporadas: 3, duracaoMin: null });
  });

  it("retorna null quando o TMDB responde 404", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) });
    await expect(buscarDetalhes("filme", 999999999)).resolves.toBeNull();
  });

  it("relança outros erros", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    await expect(buscarDetalhes("filme", 1)).rejects.toBeInstanceOf(TmdbError);
  });
});
