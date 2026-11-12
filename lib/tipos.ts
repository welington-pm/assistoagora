// Tipos compartilhados pelo app. Campos de imagem (capa, fundo, logo, foto)
// guardam o CAMINHO do TMDB (ex.: "/abc.jpg"); a URL completa sai de urlImagem().

export type Tipo = "filme" | "serie";
export type Ordem = "populares" | "avaliados" | "lancamentos";

export interface Filtros {
  tipo: Tipo;
  streamings: number[];
  genero: number | null;
  ordem: Ordem;
  pagina: number;
  /** Faixa de notas (0 a 10, número inteiro). null = sem limite daquele lado. */
  notaMin: number | null;
  notaMax: number | null;
}

export interface Streaming {
  id: number;
  nome: string;
  logo: string | null;
  prioridade: number;
}

export interface Genero {
  id: number;
  nome: string;
}

export interface TituloResumo {
  id: number;
  tipo: Tipo;
  titulo: string;
  ano: string | null;
  nota: number | null;
  capa: string | null;
  generoIds: number[];
}

export interface PaginaTitulos {
  titulos: TituloResumo[];
  pagina: number;
  totalPaginas: number;
}

export interface Trailer {
  chaveYoutube: string;
  nome: string;
}

export interface MembroElenco {
  id: number;
  nome: string;
  personagem: string;
  foto: string | null;
}

export interface DetalhesTitulo {
  id: number;
  tipo: Tipo;
  titulo: string;
  ano: string | null;
  nota: number | null;
  capa: string | null;
  fundo: string | null;
  sinopse: string;
  duracaoMin: number | null;
  temporadas: number | null;
  generos: string[];
  elenco: MembroElenco[];
  trailer: Trailer | null;
  ondeAssistir: Streaming[];
}
