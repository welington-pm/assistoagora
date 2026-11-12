"use client";

import { useRouter } from "next/navigation";
import { veioDeDentroDoApp } from "@/lib/navegacao";

// Volta para a lista com os filtros como estavam (histórico do navegador).
// Se a página foi aberta direto por um link (de outro site ou colado na barra),
// o histórico anterior não é do app: vai para o início.
export default function BotaoVoltar() {
  const router = useRouter();

  function voltar() {
    if (veioDeDentroDoApp()) router.back();
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
