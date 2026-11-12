import Link from "next/link";
import { NOME_APP } from "@/lib/app";

// "AssistoAgora" -> "Assisto" + "Agora" (segunda palavra na cor de acento).
const [inicio, destaque] = NOME_APP.split(/(?=[A-Z][a-z]*$)/);

export default function Cabecalho() {
  return (
    <header className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-8">
      <Link href="/" className="text-xl font-extrabold tracking-tight">
        {inicio}
        <span className="text-accent">{destaque}</span>
      </Link>
      <small className="text-muted">Brasil · pt-BR</small>
    </header>
  );
}
