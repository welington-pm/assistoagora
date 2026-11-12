import { cacheLife } from "next/cache";
import { tmdbFetch } from "./cliente";
import type { Genero, Streaming, Tipo } from "../tipos";

export interface ProviderTmdb {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
  display_priorities?: Record<string, number>;
}

/** Une as listas de filmes e séries sem repetir e ordena pela relevância no Brasil. */
export function unirStreamings(filmes: ProviderTmdb[], series: ProviderTmdb[]): Streaming[] {
  const porId = new Map<number, Streaming>();
  for (const p of [...filmes, ...series]) {
    if (porId.has(p.provider_id)) continue;
    porId.set(p.provider_id, {
      id: p.provider_id,
      nome: p.provider_name,
      logo: p.logo_path,
      prioridade: p.display_priorities?.BR ?? p.display_priority,
    });
  }
  return [...porId.values()].sort((a, b) => a.prioridade - b.prioridade);
}

export async function listarStreamings(): Promise<Streaming[]> {
  "use cache";
  cacheLife("days");
  const params = { watch_region: "BR" };
  const [filmes, series] = await Promise.all([
    tmdbFetch<{ results: ProviderTmdb[] }>("/watch/providers/movie", params),
    tmdbFetch<{ results: ProviderTmdb[] }>("/watch/providers/tv", params),
  ]);
  return unirStreamings(filmes.results, series.results);
}

export async function listarGeneros(tipo: Tipo): Promise<Genero[]> {
  "use cache";
  cacheLife("days");
  const caminho = tipo === "filme" ? "/genre/movie/list" : "/genre/tv/list";
  const resposta = await tmdbFetch<{ genres: { id: number; name: string }[] }>(caminho, {});
  return resposta.genres.map((g) => ({ id: g.id, nome: g.name }));
}
