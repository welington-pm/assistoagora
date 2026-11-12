import Image from "next/image";
import Link from "next/link";
import { urlImagem } from "@/lib/tmdb/imagens";
import type { TituloResumo } from "@/lib/tipos";

interface Props {
  titulo: TituloResumo;
  nomeGenero: string | null;
}

export default function CardTitulo({ titulo, nomeGenero }: Props) {
  const capa = urlImagem(titulo.capa, "w342") ?? "/sem-capa.svg";
  const legenda = [titulo.ano, nomeGenero].filter(Boolean).join(" · ");

  return (
    <Link href={`/${titulo.tipo}/${titulo.id}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-2 shadow-[0_8px_24px_rgba(0,0,0,.4)] transition-transform duration-200 group-hover:-translate-y-1">
        <Image
          src={capa}
          alt={titulo.titulo}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1100px) 25vw, 17vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {titulo.nota !== null && (
          <span className="absolute right-2 top-2 rounded-md bg-bg/85 px-1.5 py-0.5 text-xs font-bold text-accent">
            ★ {titulo.nota.toFixed(1)}
          </span>
        )}
      </div>
      <h3 className="mt-2.5 text-sm font-semibold leading-snug">{titulo.titulo}</h3>
      {legenda && <small className="text-xs text-muted">{legenda}</small>}
    </Link>
  );
}
