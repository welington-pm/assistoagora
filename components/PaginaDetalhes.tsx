import { Suspense } from "react";
import { notFound } from "next/navigation";
import DetalhesTitulo from "./DetalhesTitulo";
import { idDaRota } from "@/lib/rota";
import { buscarDetalhes } from "@/lib/tmdb/detalhes";
import type { Tipo } from "@/lib/tipos";

type Params = Promise<{ id: string }>;

// Compartilhado por /filme/[id] e /serie/[id].
export default function PaginaDetalhes({ tipo, params }: { tipo: Tipo; params: Params }) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo tipo={tipo} params={params} />
    </Suspense>
  );
}

async function Conteudo({ tipo, params }: { tipo: Tipo; params: Params }) {
  const id = idDaRota((await params).id);
  if (id === null) notFound(); // não consulta o TMDB com IDs inválidos
  const titulo = await buscarDetalhes(tipo, id);
  if (titulo === null) notFound();
  return <DetalhesTitulo titulo={titulo} />;
}

function Carregando() {
  return (
    <div aria-label="Carregando título">
      <div className="h-56 animate-pulse bg-surface sm:h-96" />
      <div className="px-4 pt-6 sm:px-8">
        <div className="h-8 w-2/3 max-w-md animate-pulse rounded bg-surface" />
        <div className="mt-4 h-20 max-w-3xl animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}
