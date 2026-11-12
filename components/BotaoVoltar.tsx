"use client";

import { useRouter } from "next/navigation";

// Volta para a lista com os filtros como estavam (histórico do navegador).
// Se a página foi aberta direto por um link, não há para onde voltar: vai para o início.
export default function BotaoVoltar() {
  const router = useRouter();

  function voltar() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <button
      type="button"
      onClick={voltar}
      className="rounded-[10px] border border-line bg-surface/80 px-4 py-2 text-sm font-semibold backdrop-blur"
    >
      ‹ Voltar
    </button>
  );
}
