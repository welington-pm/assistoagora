import Image from "next/image";
import BotaoVoltar from "./BotaoVoltar";
import OndeAssistir from "./OndeAssistir";
import { urlImagem } from "@/lib/tmdb/imagens";
import type { DetalhesTitulo as DetalhesTituloDados } from "@/lib/tipos";

function formatarDuracao(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function formatarTemporadas(n: number): string {
  return n === 1 ? "1 temporada" : `${n} temporadas`;
}

export default function DetalhesTitulo({ titulo }: { titulo: DetalhesTituloDados }) {
  const fundo = urlImagem(titulo.fundo, "w1280");
  const capa = urlImagem(titulo.capa, "w342") ?? "/sem-capa.svg";
  const extensao =
    titulo.duracaoMin !== null
      ? formatarDuracao(titulo.duracaoMin)
      : titulo.temporadas !== null
        ? formatarTemporadas(titulo.temporadas)
        : null;
  const infos = [titulo.ano, extensao].filter(Boolean) as string[];

  return (
    <article>
      <div className="relative h-56 sm:h-96">
        {fundo && <Image src={fundo} alt="" fill priority sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/10" />
        <div className="absolute left-4 top-4 sm:left-8">
          <BotaoVoltar />
        </div>
      </div>

      <div className="relative -mt-28 flex flex-col gap-6 px-4 sm:-mt-40 sm:flex-row sm:px-8">
        <div className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-xl bg-surface-2 shadow-[0_8px_24px_rgba(0,0,0,.4)] sm:w-56">
          <Image src={capa} alt={titulo.titulo} fill sizes="(max-width: 640px) 144px, 224px" className="object-cover" />
        </div>
        <div className="flex-1 sm:pt-28">
          <h1 className="text-2xl font-bold tracking-tight sm:text-[32px]">{titulo.titulo}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
            {titulo.nota !== null && <span className="font-bold text-accent">★ {titulo.nota.toFixed(1)}</span>}
            {infos.map((info) => (
              <span key={info}>{info}</span>
            ))}
          </div>
          {titulo.generos.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {titulo.generos.map((g) => (
                <li key={g} className="rounded-full border border-line bg-surface px-3 py-1 text-xs">
                  {g}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 max-w-3xl leading-relaxed">{titulo.sinopse || "Sinopse não disponível."}</p>
        </div>
      </div>

      <div className="grid gap-10 px-4 py-10 sm:px-8">
        <OndeAssistir streamings={titulo.ondeAssistir} />

        {titulo.trailer && (
          <section>
            <h2 className="mb-3 text-lg font-bold">Trailer</h2>
            <div className="aspect-video max-w-3xl overflow-hidden rounded-xl bg-surface">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${titulo.trailer.chaveYoutube}`}
                title={titulo.trailer.nome}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </section>
        )}

        {titulo.elenco.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-bold">Elenco</h2>
            <ul className="flex gap-4 overflow-x-auto pb-2">
              {titulo.elenco.map((p) => {
                const foto = urlImagem(p.foto, "w185") ?? "/sem-capa.svg";
                return (
                  <li key={p.id} className="w-28 shrink-0">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-2">
                      <Image src={foto} alt="" fill sizes="112px" className="object-cover" />
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-tight">{p.nome}</p>
                    <p className="text-xs text-muted">{p.personagem}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
