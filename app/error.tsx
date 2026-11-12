"use client";

// Tela mostrada quando algo falha (ex.: TMDB fora do ar ou token inválido).
// O detalhe técnico aparece só no terminal do servidor, não para o público.
export default function Erro({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-lg">Não conseguimos carregar os títulos agora.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-[10px] border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink"
      >
        Tentar de novo
      </button>
    </section>
  );
}
