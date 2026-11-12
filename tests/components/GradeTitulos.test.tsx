import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GradeTitulos from "@/components/GradeTitulos";
import type { TituloResumo } from "@/lib/tipos";

const t = (id: number, generoIds: number[]): TituloResumo => ({
  id,
  tipo: "filme",
  titulo: `T${id}`,
  ano: "2024",
  nota: 7,
  capa: null,
  generoIds,
});

describe("GradeTitulos", () => {
  it("mostra o estado vazio sem resultados", () => {
    render(<GradeTitulos titulos={[]} generos={[]} />);
    expect(
      screen.getByText("Nada encontrado com esses filtros. Tente remover um gênero ou adicionar streamings."),
    ).toBeInTheDocument();
  });

  it("renderiza um link por título", () => {
    render(<GradeTitulos titulos={[t(1, []), t(2, [])]} generos={[]} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("usa o primeiro gênero conhecido do título", () => {
    render(<GradeTitulos titulos={[t(1, [999, 35, 18])]} generos={[{ id: 18, nome: "Drama" }, { id: 35, nome: "Comédia" }]} />);
    expect(screen.getByText("2024 · Comédia")).toBeInTheDocument();
  });
});
