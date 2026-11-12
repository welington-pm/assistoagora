// URLs das imagens do TMDB. Usado no servidor e no navegador: não importe nada de servidor aqui.

export type TamanhoImagem = "w92" | "w185" | "w342" | "w780" | "w1280";

export function urlImagem(caminho: string | null, tamanho: TamanhoImagem): string | null {
  return caminho ? `https://image.tmdb.org/t/p/${tamanho}${caminho}` : null;
}
