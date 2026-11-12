// Formato do cookie que lembra os streamings escolhidos.
// Usado no servidor (leitura) e no navegador (gravação): não importe nada de servidor aqui.

export const COOKIE_STREAMINGS = "meus_streamings";
const UM_ANO_EM_SEGUNDOS = 31536000;

/** Converte "8,119" em [8, 119], descartando valores inválidos e repetidos. */
export function lerIdsStreamings(valor: string | undefined): number[] {
  if (!valor) return [];
  const ids: number[] = [];
  for (const parte of valor.split(",")) {
    const n = Number(parte.trim());
    if (parte.trim() !== "" && Number.isInteger(n) && n > 0 && !ids.includes(n)) ids.push(n);
  }
  return ids;
}

/** String pronta para atribuir a document.cookie. */
export function cookieStreamings(ids: number[]): string {
  return `${COOKIE_STREAMINGS}=${ids.join(",")}; max-age=${UM_ANO_EM_SEGUNDOS}; path=/; SameSite=Lax`;
}
