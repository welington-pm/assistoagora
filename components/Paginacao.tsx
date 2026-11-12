import Link from "next/link";
import { hrefDaLista } from "@/lib/filtros";
import type { Filtros } from "@/lib/tipos";

interface Props {
  filtros: Filtros;
  totalPaginas: number;
}

const BOTAO = "rounded-[10px] border px-4 py-2.5 text-sm font-semibold";
const ATIVO = `${BOTAO} border-accent bg-accent text-accent-ink`;
const INATIVO = `${BOTAO} border-line bg-surface opacity-40`;

function Botao({ rotulo, destino, filtros }: { rotulo: string; destino: number | null; filtros: Filtros }) {
  if (destino === null) {
    return (
      <span aria-disabled="true" className={INATIVO}>
        {rotulo}
      </span>
    );
  }
  return (
    <Link href={hrefDaLista({ ...filtros, pagina: destino })} className={ATIVO}>
      {rotulo}
    </Link>
  );
}

export default function Paginacao({ filtros, totalPaginas }: Props) {
  if (totalPaginas <= 1) return null;
  const { pagina } = filtros;

  return (
    <nav className="flex items-center justify-center gap-4 p-7" aria-label="Paginação">
      <Botao rotulo="‹ Anterior" destino={pagina > 1 ? pagina - 1 : null} filtros={filtros} />
      <small className="text-muted">
        Página {pagina} de {totalPaginas}
      </small>
      <Botao rotulo="Próxima ›" destino={pagina < totalPaginas ? pagina + 1 : null} filtros={filtros} />
    </nav>
  );
}
