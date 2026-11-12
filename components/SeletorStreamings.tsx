"use client";

import Image from "next/image";
import { useState } from "react";
import { urlImagem } from "@/lib/tmdb/imagens";
import type { Streaming } from "@/lib/tipos";

const VISIVEIS = 12;

interface Props {
  streamings: Streaming[];
  selecionados: number[];
  aoMudar: (ids: number[]) => void;
}

export default function SeletorStreamings({ streamings, selecionados, aoMudar }: Props) {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const visiveis = mostrarTodos
    ? streamings
    : streamings.filter((s, i) => i < VISIVEIS || selecionados.includes(s.id));

  function alternar(id: number) {
    aoMudar(selecionados.includes(id) ? selecionados.filter((s) => s !== id) : [...selecionados, id]);
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
      {visiveis.map((s) => {
        const ligado = selecionados.includes(s.id);
        const logo = urlImagem(s.logo, "w92");
        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={ligado}
            onClick={() => alternar(s.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border py-2 pl-2 pr-3.5 text-sm ${
              ligado ? "border-accent bg-[#231d10] text-text" : "border-line bg-surface text-muted"
            }`}
          >
            {logo ? (
              <Image src={logo} alt="" width={26} height={26} className="rounded-lg" />
            ) : (
              <span aria-hidden="true" className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-surface-2 text-xs font-extrabold">
                {s.nome.charAt(0)}
              </span>
            )}
            {s.nome}
            {ligado && (
              <span aria-hidden="true" className="font-extrabold text-accent">
                ✓
              </span>
            )}
          </button>
        );
      })}
      {streamings.length > VISIVEIS && (
        <button
          type="button"
          onClick={() => setMostrarTodos(!mostrarTodos)}
          className="shrink-0 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-accent"
        >
          {mostrarTodos ? "‹ Ver menos" : "Ver todos ›"}
        </button>
      )}
    </div>
  );
}
