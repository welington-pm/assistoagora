/** ID numérico vindo da rota (/filme/[id]); null se não for inteiro positivo. */
export function idDaRota(valor: string): number | null {
  if (!/^\d+$/.test(valor)) return null;
  const n = Number(valor);
  return n > 0 ? n : null;
}
