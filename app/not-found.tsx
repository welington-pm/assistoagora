import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-lg">Título não encontrado.</p>
      <Link href="/" className="text-accent underline-offset-4 hover:underline">
        Voltar para o início
      </Link>
    </section>
  );
}
