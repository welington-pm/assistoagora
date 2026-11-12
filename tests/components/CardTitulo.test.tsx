import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CardTitulo from "@/components/CardTitulo";
import type { TituloResumo } from "@/lib/tipos";

const FILME: TituloResumo = { id: 1, tipo: "filme", titulo: "Matrix", ano: "2024", nota: 7.8, capa: "/p.jpg", generoIds: [18] };

describe("CardTitulo", () => {
  it("leva aos detalhes do filme", () => {
    render(<CardTitulo titulo={FILME} nomeGenero="Drama" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/filme/1");
  });

  it("leva aos detalhes da série", () => {
    render(<CardTitulo titulo={{ ...FILME, tipo: "serie" }} nomeGenero={null} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/serie/1");
  });

  it("mostra nota, ano e gênero", () => {
    render(<CardTitulo titulo={FILME} nomeGenero="Drama" />);
    expect(screen.getByText("★ 7.8")).toBeInTheDocument();
    expect(screen.getByText("2024 · Drama")).toBeInTheDocument();
  });

  it("mostra a nota com uma casa decimal", () => {
    render(<CardTitulo titulo={{ ...FILME, nota: 8 }} nomeGenero={null} />);
    expect(screen.getByText("★ 8.0")).toBeInTheDocument();
  });

  it("esconde o selo quando não há nota", () => {
    render(<CardTitulo titulo={{ ...FILME, nota: null }} nomeGenero={null} />);
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it("usa o placeholder quando não há capa", () => {
    render(<CardTitulo titulo={{ ...FILME, capa: null }} nomeGenero={null} />);
    expect(screen.getByAltText("Matrix").getAttribute("src")).toContain("sem-capa.svg");
  });

  it("não deixa · solto sem ano e sem gênero", () => {
    render(<CardTitulo titulo={{ ...FILME, ano: null }} nomeGenero={null} />);
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });
});
