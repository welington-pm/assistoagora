import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));

import { listarGeneros, listarStreamings, unirStreamings, type ProviderTmdb } from "@/lib/tmdb/catalogos";

function provider(id: number, br: number | undefined, geral = 99): ProviderTmdb {
  return {
    provider_id: id,
    provider_name: `P${id}`,
    logo_path: `/p${id}.png`,
    display_priority: geral,
    display_priorities: br === undefined ? { US: 1 } : { BR: br },
  };
}

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

describe("unirStreamings", () => {
  it("remove repetidos pelo id", () => {
    const resultado = unirStreamings([provider(8, 0)], [provider(8, 0), provider(119, 2)]);
    expect(resultado.map((s) => s.id)).toEqual([8, 119]);
  });

  it("ordena pela prioridade do BR, que vence a prioridade geral", () => {
    const a = provider(1, 5, 0);
    const b = provider(2, 1, 9);
    expect(unirStreamings([a, b], []).map((s) => s.id)).toEqual([2, 1]);
  });

  it("aceita prioridade 0 do BR e usa a geral quando não há BR", () => {
    const semBr = provider(3, undefined, 1);
    const zero = provider(4, 0, 50);
    expect(unirStreamings([semBr, zero], []).map((s) => s.id)).toEqual([4, 3]);
  });

  it("mapeia os campos", () => {
    const p: ProviderTmdb = { provider_id: 8, provider_name: "Netflix", logo_path: "/n.jpg", display_priority: 3 };
    expect(unirStreamings([p], [])).toEqual([{ id: 8, nome: "Netflix", logo: "/n.jpg", prioridade: 3 }]);
  });
});

describe("listarStreamings", () => {
  it("consulta filmes e séries do BR e une as listas", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [provider(8, 0)] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [provider(8, 0), provider(337, 3)] }) });
    const resultado = await listarStreamings();
    const urls = fetchMock.mock.calls.map((c) => c[0] as string);
    expect(urls.some((u) => u.includes("/watch/providers/movie") && u.includes("watch_region=BR"))).toBe(true);
    expect(urls.some((u) => u.includes("/watch/providers/tv") && u.includes("watch_region=BR"))).toBe(true);
    expect(resultado.map((s) => s.id)).toEqual([8, 337]);
  });
});

describe("listarGeneros", () => {
  it("usa /genre/tv/list para séries", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ genres: [{ id: 35, name: "Comédia" }] }) });
    await expect(listarGeneros("serie")).resolves.toEqual([{ id: 35, nome: "Comédia" }]);
    expect(fetchMock.mock.calls[0][0]).toContain("/genre/tv/list");
  });

  it("usa /genre/movie/list para filmes", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ genres: [] }) });
    await listarGeneros("filme");
    expect(fetchMock.mock.calls[0][0]).toContain("/genre/movie/list");
  });
});
