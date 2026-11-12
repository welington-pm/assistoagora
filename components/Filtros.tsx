"use client";

import { useRouter } from "next/navigation";
import SeletorStreamings from "./SeletorStreamings";
import { cookieStreamings } from "@/lib/cookies";
import { hrefDaLista } from "@/lib/filtros";
import type { Filtros as TipoFiltros, Genero, Ordem, Streaming, Tipo } from "@/lib/tipos";

interface Props {
  filtros: TipoFiltros;
  streamings: Streaming[];
  generos: Genero[];
}

const TIPOS: { valor: Tipo; rotulo: string }[] = [
  { valor: "filme", rotulo: "Filmes" },
  { valor: "serie", rotulo: "Séries" },
];

const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: "populares", rotulo: "Populares" },
  { valor: "avaliados", rotulo: "Mais bem avaliados" },
  { valor: "lancamentos", rotulo: "Lançamentos" },
];

const ROTULO = "mb-2 text-[11px] uppercase tracking-[1.2px] text-muted";

function Segmentos<T extends string>({
  opcoes,
  ativo,
  aoEscolher,
}: {
  opcoes: { valor: T; rotulo: string }[];
  ativo: T;
  aoEscolher: (valor: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-[10px] border border-line bg-surface p-[3px]">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={o.valor === ativo}
          onClick={() => aoEscolher(o.valor)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            o.valor === ativo ? "bg-accent text-accent-ink" : "text-muted"
          }`}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}

export default function Filtros({ filtros, streamings, generos }: Props) {
  const router = useRouter();

  // Toda mudança de filtro volta para a página 1.
  function aplicar(mudancas: Partial<TipoFiltros>) {
    router.push(hrefDaLista({ ...filtros, ...mudancas, pagina: 1 }), { scroll: false });
  }

  function mudarStreamings(ids: number[]) {
    document.cookie = cookieStreamings(ids);
    aplicar({ streamings: ids });
  }

  return (
    <section className="grid gap-[18px] px-4 py-5 sm:px-8">
      <div>
        <div className={ROTULO}>Meus streamings</div>
        <SeletorStreamings streamings={streamings} selecionados={filtros.streamings} aoMudar={mudarStreamings} />
      </div>
      <div className="flex flex-wrap items-end gap-3.5">
        <div>
          <div className={ROTULO}>Tipo</div>
          {/* Filme e série têm listas de gêneros diferentes: trocar o tipo limpa o gênero. */}
          <Segmentos opcoes={TIPOS} ativo={filtros.tipo} aoEscolher={(tipo) => aplicar({ tipo, genero: null })} />
        </div>
        <div>
          <label htmlFor="filtro-genero" className={`block ${ROTULO}`}>
            Gênero
          </label>
          <select
            id="filtro-genero"
            value={filtros.genero ?? ""}
            onChange={(e) => aplicar({ genero: e.target.value ? Number(e.target.value) : null })}
            className="min-w-[170px] rounded-[10px] border border-line bg-surface px-3.5 py-[9px] text-sm text-text"
          >
            <option value="">Todos</option>
            {generos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className={ROTULO}>Ordenar por</div>
          <Segmentos opcoes={ORDENS} ativo={filtros.ordem} aoEscolher={(ordem) => aplicar({ ordem })} />
        </div>
      </div>
    </section>
  );
}
