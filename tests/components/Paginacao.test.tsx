import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Paginacao from "@/components/Paginacao";
import type { Filtros } from "@/lib/tipos";

const F: Filtros = { tipo: "filme", streamings: [8, 119], genero: null, ordem: "populares", pagina: 1 };

describe("Paginacao", () => {
  it("na primeira página, Anterior fica desabilitado e Próxima avança preservando filtros", () => {
    render(<Paginacao filtros={F} totalPaginas={48} />);
    expect(screen.getByText("‹ Anterior")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("‹ Anterior").closest("a")).toBeNull();
    const proxima = screen.getByRole("link", { name: "Próxima ›" }).getAttribute("href") ?? "";
    expect(proxima).toContain("pagina=2");
    expect(proxima).toContain("streamings=8,119");
    expect(screen.getByText("Página 1 de 48")).toBeInTheDocument();
  });

  it("na última página, Próxima fica desabilitado", () => {
    render(<Paginacao filtros={{ ...F, pagina: 48 }} totalPaginas={48} />);
    expect(screen.getByText("Próxima ›")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: "‹ Anterior" }).getAttribute("href")).toContain("pagina=47");
  });

  it("volta para a página 1 sem parâmetro pagina", () => {
    render(<Paginacao filtros={{ ...F, streamings: [], pagina: 2 }} totalPaginas={5} />);
    expect(screen.getByRole("link", { name: "‹ Anterior" })).toHaveAttribute("href", "/");
  });

  it.each([0, 1])("não renderiza nada com %i página(s)", (total) => {
    const { container } = render(<Paginacao filtros={F} totalPaginas={total} />);
    expect(container).toBeEmptyDOMElement();
  });
});
