import type { Metadata } from "next";
import "./globals.css";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import { NOME_APP } from "@/lib/app";

export const metadata: Metadata = {
  title: NOME_APP,
  description: "Descubra o que assistir agora nos seus streamings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-bg text-text">
        <Cabecalho />
        <main className="flex-1">{children}</main>
        <Rodape />
      </body>
    </html>
  );
}
