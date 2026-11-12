import PaginaDetalhes from "@/components/PaginaDetalhes";

export default function PaginaSerie({ params }: PageProps<"/serie/[id]">) {
  return <PaginaDetalhes tipo="serie" params={params} />;
}
