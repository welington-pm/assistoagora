import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Rodape from "@/components/Rodape";

describe("Rodape", () => {
  it("renderiza o texto de atribuição do TMDB", () => {
    render(<Rodape />);
    expect(
      screen.getByText(
        "Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.",
      ),
    ).toBeInTheDocument();
  });

  it("renderiza o crédito da JustWatch", () => {
    render(<Rodape />);
    expect(screen.getByText(/Dados de disponibilidade: JustWatch/)).toBeInTheDocument();
  });

  it("exibe o logo do TMDB", () => {
    render(<Rodape />);
    expect(screen.getByAltText("TMDB")).toBeInTheDocument();
  });
});
