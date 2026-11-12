import "server-only";

// ÚNICA parte do app que conhece o token e a URL base do TMDB.
// O cache fica nas funções que chamam tmdbFetch ("use cache" + cacheLife).

const URL_BASE = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  status: number;

  constructor(status: number, mensagem?: string) {
    super(mensagem ?? `TMDB respondeu com status ${status}`);
    this.name = "TmdbError";
    this.status = status;
  }
}

export async function tmdbFetch<T>(
  caminho: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    throw new Error(
      "TMDB_READ_TOKEN não configurado. Crie o arquivo .env.local com TMDB_READ_TOKEN=<seu token>.",
    );
  }

  const query = new URLSearchParams({ language: "pt-BR" });
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== undefined) query.set(chave, String(valor));
  }

  const resposta = await fetch(`${URL_BASE}${caminho}?${query}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!resposta.ok) throw new TmdbError(resposta.status);
  return (await resposta.json()) as T;
}
