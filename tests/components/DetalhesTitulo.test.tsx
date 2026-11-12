import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));

import DetalhesTitulo from "@/components/DetalhesTitulo";
import type { DetalhesTitulo as DetalhesTituloDados } from "@/lib/tipos";

const FILME: DetalhesTituloDados = {
  id: 603,
  tipo: "filme",
  titulo: "Matrix",
  ano: "1999",
  nota: 8.2,
  capa: "/p.jpg",
  fundo: "/b.jpg",
  sinopse: "Um hacker descobre a verdade.",
  duracaoMin: 136,
  temporadas: null,
  generos: ["Ação"],
  elenco: [{ id: 1, nome: "Keanu Reeves", personagem: "Neo", foto: null }],
  trailer: null,
  ondeAssistir: [],
};

describe("DetalhesTitulo", () => {
  it("mostra a duração do filme em horas e minutos", () => {
    render(<DetalhesTitulo titulo={FILME} />);
    expect(screen.getByText("2h 16min")).toBeInTheDocument();
  });

  it("mostra temporadas no plural e no singular", () => {
    const serie = { ...FILME, tipo: "serie" as const, duracaoMin: null };
    const { unmount } = render(<DetalhesTitulo titulo={{ ...serie, temporadas: 3 }} />);
    expect(screen.getByText("3 temporadas")).toBeInTheDocument();
    unmount();
    render(<DetalhesTitulo titulo={{ ...serie, temporadas: 1 }} />);
    expect(screen.getByText("1 temporada")).toBeInTheDocument();
  });

  it("esconde a seção de trailer quando não há trailer", () => {
    render(<DetalhesTitulo titulo={FILME} />);
    expect(screen.queryByRole("heading", { name: "Trailer" })).not.toBeInTheDocument();
  });

  it("incorpora o trailer do YouTube quando existe", () => {
    const { container } = render(<DetalhesTitulo titulo={{ ...FILME, trailer: { chaveYoutube: "abc", nome: "Trailer" } }} />);
    expect(screen.getByRole("heading", { name: "Trailer" })).toBeInTheDocument();
    expect(container.querySelector("iframe")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abc");
  });

  it("mostra o elenco com personagem", () => {
    render(<DetalhesTitulo titulo={FILME} />);
    expect(screen.getByText("Keanu Reeves")).toBeInTheDocument();
    expect(screen.getByText("Neo")).toBeInTheDocument();
  });

  it("avisa quando não há sinopse", () => {
    render(<DetalhesTitulo titulo={{ ...FILME, sinopse: "" }} />);
    expect(screen.getByText("Sinopse não disponível.")).toBeInTheDocument();
  });
});
