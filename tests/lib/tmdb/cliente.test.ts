import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TmdbError, tmdbFetch } from "@/lib/tmdb/cliente";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("TMDB_READ_TOKEN", "tok");
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: 1 }) });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("tmdbFetch", () => {
  it("envia Bearer e language pt-BR", async () => {
    await tmdbFetch("/discover/movie", { page: 2 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("https://api.themoviedb.org/3/discover/movie?");
    expect(url).toContain("language=pt-BR");
    expect(url).toContain("page=2");
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("omite parâmetros undefined", async () => {
    await tmdbFetch("/discover/movie", { with_genres: undefined });
    expect(fetchMock.mock.calls[0][0]).not.toContain("with_genres");
  });

  it("devolve o JSON da resposta", async () => {
    await expect(tmdbFetch("/genre/movie/list", {})).resolves.toEqual({ ok: 1 });
  });

  it("lança TmdbError com status quando a resposta não é ok", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
    const erro = await tmdbFetch("/discover/movie", {}).catch((e) => e);
    expect(erro).toBeInstanceOf(TmdbError);
    expect(erro.status).toBe(429);
  });

  it("sem token lança erro claro sem chamar o TMDB", async () => {
    vi.stubEnv("TMDB_READ_TOKEN", "");
    await expect(tmdbFetch("/discover/movie", {})).rejects.toThrow("TMDB_READ_TOKEN não configurado");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
