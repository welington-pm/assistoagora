import { cacheLife } from "next/cache";
import { TmdbError, tmdbFetch } from "./cliente";
import type { ProviderTmdb } from "./catalogos";
import { anoDe, arredondarNota } from "./descoberta";
import type { DetalhesTitulo, Streaming, Tipo, Trailer } from "../tipos";

export interface VideoTmdb {
  key: string;
  name: string;
  site: string;
  type: string;
  iso_639_1: string;
}

// O TMDB separa por país e por modalidade; só "flatrate" (assinatura) interessa aqui.
type ProvidersPorPais = {
  results?: Record<string, { flatrate?: ProviderTmdb[]; rent?: ProviderTmdb[]; buy?: ProviderTmdb[] }>;
};

interface DetalhesTmdb {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  runtime?: number | null;
  number_of_seasons?: number;
  genres: { id: number; name: string }[];
  credits: { cast: { id: number; name: string; character: string; profile_path: string | null }[] };
  videos: { results: VideoTmdb[] };
  "watch/providers": ProvidersPorPais;
}

const MAX_ELENCO = 10;
const IDIOMAS_TRAILER = ["pt", "en"];

export function escolherTrailer(videos: VideoTmdb[]): Trailer | null {
  const trailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  const escolhido =
    IDIOMAS_TRAILER.map((idioma) => trailers.find((v) => v.iso_639_1 === idioma)).find(Boolean) ?? trailers[0];
  return escolhido ? { chaveYoutube: escolhido.key, nome: escolhido.name } : null;
}

export function extrairOndeAssistir(wp: ProvidersPorPais): Streaming[] {
  const flatrate = wp.results?.BR?.flatrate ?? [];
  return [...flatrate]
    .sort((a, b) => a.display_priority - b.display_priority)
    .map((p) => ({ id: p.provider_id, nome: p.provider_name, logo: p.logo_path, prioridade: p.display_priority }));
}

export async function buscarDetalhes(tipo: Tipo, id: number): Promise<DetalhesTitulo | null> {
  "use cache";
  cacheLife("hours");
  let d: DetalhesTmdb;
  try {
    d = await tmdbFetch<DetalhesTmdb>(`/${tipo === "filme" ? "movie" : "tv"}/${id}`, {
      append_to_response: "credits,videos,watch/providers",
      include_video_language: "pt-BR,en,null",
    });
  } catch (erro) {
    if (erro instanceof TmdbError && erro.status === 404) return null;
    throw erro;
  }

  return {
    id: d.id,
    tipo,
    titulo: (tipo === "filme" ? d.title : d.name) ?? "",
    ano: anoDe(tipo === "filme" ? d.release_date : d.first_air_date),
    nota: arredondarNota(d.vote_average, d.vote_count),
    capa: d.poster_path,
    fundo: d.backdrop_path,
    sinopse: d.overview ?? "",
    duracaoMin: tipo === "filme" ? (d.runtime ?? null) : null,
    temporadas: tipo === "serie" ? (d.number_of_seasons ?? null) : null,
    generos: d.genres.map((g) => g.name),
    elenco: d.credits.cast.slice(0, MAX_ELENCO).map((c) => ({
      id: c.id,
      nome: c.name,
      personagem: c.character,
      foto: c.profile_path,
    })),
    trailer: escolherTrailer(d.videos.results),
    ondeAssistir: extrairOndeAssistir(d["watch/providers"]),
  };
}
