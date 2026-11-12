import CardTitulo from "./CardTitulo";
import type { Genero, TituloResumo } from "@/lib/tipos";

interface Props {
  titulos: TituloResumo[];
  generos: Genero[];
}

export default function GradeTitulos({ titulos, generos }: Props) {
  if (titulos.length === 0) {
    return (
      <p className="px-4 py-16 text-center text-muted sm:px-8">
        Nada encontrado com esses filtros. Tente ampliar a faixa de notas, remover um gênero ou adicionar streamings.
      </p>
    );
  }

  const nomes = new Map(generos.map((g) => [g.id, g.nome]));
  const nomeDoGenero = (ids: number[]) => ids.map((id) => nomes.get(id)).find(Boolean) ?? null;

  return (
    <section className="grid grid-cols-2 gap-3.5 px-4 pb-2 pt-4 sm:grid-cols-4 sm:gap-5 sm:px-8 xl:grid-cols-6">
      {titulos.map((t) => (
        <CardTitulo key={`${t.tipo}-${t.id}`} titulo={t} nomeGenero={nomeDoGenero(t.generoIds)} />
      ))}
    </section>
  );
}
