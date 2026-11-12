// Converte os parâmetros da URL em Filtros (e de volta).
// Usado no servidor e no navegador: não importe nada de servidor aqui.
import { lerIdsStreamings } from "./cookies";
import type { Filtros, Ordem, Tipo } from "./tipos";

type Params = Record<string, string | string[] | undefined>;

const TIPOS: Tipo[] = ["filme", "serie"];
const ORDENS: Ordem[] = ["populares", "avaliados", "lancamentos"];
const PAGINA_MAX = 500;

export const FILTROS_PADRAO: Filtros = {
  tipo: "filme",
  streamings: [],
  genero: null,
  ordem: "populares",
  pagina: 1,
};

function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

function inteiroPositivo(valor: string | undefined): number | null {
  if (valor === undefined || valor.trim() === "") return null;
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function parseFiltros(params: Params, cookie?: string): Filtros {
  const tipo = primeiro(params.tipo) as Tipo;
  const ordem = primeiro(params.ordem) as Ordem;
  const pagina = inteiroPositivo(primeiro(params.pagina));
  const streamingsUrl = lerIdsStreamings(primeiro(params.streamings));

  return {
    tipo: TIPOS.includes(tipo) ? tipo : FILTROS_PADRAO.tipo,
    streamings: streamingsUrl.length > 0 ? streamingsUrl : lerIdsStreamings(cookie),
    genero: inteiroPositivo(primeiro(params.genero)),
    ordem: ORDENS.includes(ordem) ? ordem : FILTROS_PADRAO.ordem,
    pagina: pagina !== null && pagina <= PAGINA_MAX ? pagina : FILTROS_PADRAO.pagina,
  };
}

/** Query string sem "?", omitindo valores padrão. A vírgula fica legível ("8,119"). */
export function serializarFiltros(f: Filtros): string {
  const partes: string[] = [];
  if (f.tipo !== FILTROS_PADRAO.tipo) partes.push(`tipo=${f.tipo}`);
  if (f.streamings.length > 0) partes.push(`streamings=${f.streamings.join(",")}`);
  if (f.genero !== null) partes.push(`genero=${f.genero}`);
  if (f.ordem !== FILTROS_PADRAO.ordem) partes.push(`ordem=${f.ordem}`);
  if (f.pagina !== FILTROS_PADRAO.pagina) partes.push(`pagina=${f.pagina}`);
  return partes.join("&");
}
