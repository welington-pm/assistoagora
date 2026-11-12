import { cacheLife } from "next/cache";
import { tmdbFetch } from "./cliente";
import type { Filtros, PaginaTitulos, Tipo, TituloResumo } from "../tipos";

export interface ItemTmdb {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  genre_ids: number[];
}

const PAGINA_MAX = 500;
const VOTOS_MINIMOS_AVALIADOS = 200;

type Params = Record<string, string | number | undefined>;

export function montarParametrosDescoberta(f: Filtros, hoje: string): Params {
  const campoData = f.tipo === "filme" ? "primary_release_date" : "first_air_date";
  const params: Params = {
    watch_region: "BR",
    with_watch_monetization_types: "flatrate",
    with_watch_providers: f.streamings.length > 0 ? f.streamings.join("|") : undefined,
    with_genres: f.genero !== null ? String(f.genero) : undefined,
    page: f.pagina,
  };

  if (f.ordem === "avaliados") {
    params.sort_by = "vote_average.desc";
    params["vote_count.gte"] = VOTOS_MINIMOS_AVALIADOS;
  } else if (f.ordem === "lancamentos") {
    params.sort_by = `${campoData}.desc`;
    params[`${campoData}.lte`] = hoje;
  } else {
    params.sort_by = "popularity.desc";
  }
  return params;
}

export function arredondarNota(media: number, votos: number): number | null {
  return votos > 0 ? Math.round(media * 10) / 10 : null;
}

export function anoDe(data: string | undefined): string | null {
  return data ? data.slice(0, 4) : null;
}

export function mapearTitulo(item: ItemTmdb, tipo: Tipo): TituloResumo {
  return {
    id: item.id,
    tipo,
    titulo: (tipo === "filme" ? item.title : item.name) ?? "",
    ano: anoDe(tipo === "filme" ? item.release_date : item.first_air_date),
    nota: arredondarNota(item.vote_average, item.vote_count),
    capa: item.poster_path,
    generoIds: item.genre_ids ?? [],
  };
}

function hojeEmSaoPaulo(): string {
  // en-CA formata como AAAA-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export async function descobrir(f: Filtros): Promise<PaginaTitulos> {
  "use cache";
  cacheLife("hours");
  const caminho = f.tipo === "filme" ? "/discover/movie" : "/discover/tv";
  const resposta = await tmdbFetch<{ page: number; total_pages: number; results: ItemTmdb[] }>(
    caminho,
    montarParametrosDescoberta(f, hojeEmSaoPaulo()),
  );
  return {
    titulos: resposta.results.map((item) => mapearTitulo(item, f.tipo)),
    pagina: resposta.page,
    totalPaginas: Math.min(resposta.total_pages, PAGINA_MAX),
  };
}
