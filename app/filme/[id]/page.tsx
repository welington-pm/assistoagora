import PaginaDetalhes from "@/components/PaginaDetalhes";

export default function PaginaFilme({ params }: PageProps<"/filme/[id]">) {
  return <PaginaDetalhes tipo="filme" params={params} />;
}
