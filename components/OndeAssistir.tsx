import Image from "next/image";
import { urlImagem } from "@/lib/tmdb/imagens";
import type { Streaming } from "@/lib/tipos";

export default function OndeAssistir({ streamings }: { streamings: Streaming[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">Onde assistir</h2>
      {streamings.length === 0 ? (
        <p className="text-muted">Não disponível em streaming por assinatura no Brasil no momento.</p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {streamings.map((s) => {
            const logo = urlImagem(s.logo, "w92");
            return (
              <li key={s.id} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3.5 text-sm">
                {logo && <Image src={logo} alt={s.nome} width={32} height={32} className="rounded-lg" />}
                <span aria-hidden={logo ? "true" : undefined}>{s.nome}</span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">Dados de disponibilidade: JustWatch</p>
    </section>
  );
}
