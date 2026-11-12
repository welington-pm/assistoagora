import Image from "next/image";

export default function Rodape() {
  return (
    <footer className="mt-auto flex flex-wrap items-center gap-4 border-t border-line px-4 py-6 text-xs text-muted sm:px-8">
      <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
        <Image src="/tmdb-logo.svg" alt="TMDB" width={123} height={16} className="h-4 w-auto" />
      </a>
      <p>Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.</p>
      <p>Dados de disponibilidade: JustWatch.</p>
    </footer>
  );
}
