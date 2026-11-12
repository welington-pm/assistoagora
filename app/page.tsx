import { Suspense } from "react";
import { cookies } from "next/headers";
import Filtros from "@/components/Filtros";
import GradeTitulos from "@/components/GradeTitulos";
import Paginacao from "@/components/Paginacao";
import { COOKIE_STREAMINGS } from "@/lib/cookies";
import { parseFiltros } from "@/lib/filtros";
import { listarGeneros, listarStreamings } from "@/lib/tmdb/catalogos";
import { descobrir } from "@/lib/tmdb/descoberta";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <section className="px-4 pb-2 pt-8 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[32px]">O que assistir agora?</h1>
        <p className="mt-1.5 text-muted">Marque seus streamings e veja o que está disponível neles hoje.</p>
      </section>
      {/* Filtros, URL e cookie só existem na hora do pedido: o conteúdo carrega dentro do Suspense. */}
      <Suspense fallback={<CarregandoGrade />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Conteudo({ searchParams }: { searchParams: SearchParams }) {
  const cookie = (await cookies()).get(COOKIE_STREAMINGS)?.value;
  const filtros = parseFiltros(await searchParams, cookie);
  const [pagina, streamings, generos] = await Promise.all([
    descobrir(filtros),
    listarStreamings(),
    listarGeneros(filtros.tipo),
  ]);

  const nomesSelecionados = streamings.filter((s) => filtros.streamings.includes(s.id)).map((s) => s.nome);
  const tipoTexto = filtros.tipo === "filme" ? "Filmes" : "Séries";
  const ondeTexto = nomesSelecionados.length > 0 ? nomesSelecionados.join(", ") : "todos os streamings";

  return (
    <>
      <Filtros filtros={filtros} streamings={streamings} generos={generos} />
      <p className="px-4 pt-1 text-sm text-muted sm:px-8">
        {tipoTexto} em {ondeTexto} · página {filtros.pagina}
      </p>
      <GradeTitulos titulos={pagina.titulos} generos={generos} />
      <Paginacao filtros={filtros} totalPaginas={pagina.totalPaginas} />
    </>
  );
}

function CarregandoGrade() {
  return (
    <section
      aria-label="Carregando títulos"
      className="grid grid-cols-2 gap-3.5 px-4 pt-10 sm:grid-cols-4 sm:gap-5 sm:px-8 xl:grid-cols-6"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-surface" />
      ))}
    </section>
  );
}
