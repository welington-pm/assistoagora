import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import Filtros from "@/components/Filtros";
import { serializarFiltros } from "@/lib/filtros";
import type { Filtros as TipoFiltros, Genero, Streaming } from "@/lib/tipos";

const F: TipoFiltros = { tipo: "filme", streamings: [8], genero: 35, ordem: "populares", pagina: 3 };
const STREAMINGS: Streaming[] = [
  { id: 8, nome: "Netflix", logo: null, prioridade: 0 },
  { id: 119, nome: "Prime Video", logo: null, prioridade: 2 },
];
const GENEROS: Genero[] = [
  { id: 35, nome: "Comédia" },
  { id: 18, nome: "Drama" },
];

function urlEnviada(): URLSearchParams {
  const href = push.mock.calls.at(-1)?.[0] as string;
  return new URLSearchParams(href.split("?")[1] ?? "");
}

beforeEach(() => {
  push.mockReset();
  document.cookie = "meus_streamings=; max-age=0; path=/";
});

describe("Filtros", () => {
  it("ligar um streaming atualiza a URL, volta à página 1 e grava o cookie", async () => {
    render(<Filtros filtros={F} streamings={STREAMINGS} generos={GENEROS} />);
    await userEvent.click(screen.getByRole("button", { name: /Prime Video/ }));
    expect(push.mock.calls[0][0]).toBe("/?" + serializarFiltros({ ...F, streamings: [8, 119], pagina: 1 }));
    expect(document.cookie).toContain("meus_streamings=8,119");
  });

  it("trocar para Séries limpa o gênero e volta à página 1", async () => {
    render(<Filtros filtros={F} streamings={STREAMINGS} generos={GENEROS} />);
    await userEvent.click(screen.getByRole("button", { name: "Séries" }));
    const p = urlEnviada();
    expect(p.get("tipo")).toBe("serie");
    expect(p.get("genero")).toBeNull();
    expect(p.get("pagina")).toBeNull();
  });

  it("mudar a ordem mantém o gênero e volta à página 1", async () => {
    render(<Filtros filtros={F} streamings={STREAMINGS} generos={GENEROS} />);
    await userEvent.click(screen.getByRole("button", { name: "Mais bem avaliados" }));
    const p = urlEnviada();
    expect(p.get("ordem")).toBe("avaliados");
    expect(p.get("genero")).toBe("35");
    expect(p.get("pagina")).toBeNull();
  });

  it("escolher um gênero aplica o filtro e Todos remove", async () => {
    render(<Filtros filtros={F} streamings={STREAMINGS} generos={GENEROS} />);
    const select = screen.getByLabelText("Gênero");
    await userEvent.selectOptions(select, "18");
    expect(urlEnviada().get("genero")).toBe("18");
    expect(urlEnviada().get("pagina")).toBeNull();
    await userEvent.selectOptions(select, "");
    expect(urlEnviada().get("genero")).toBeNull();
  });

  it("marca o tipo e a ordem ativos com aria-pressed", () => {
    render(<Filtros filtros={F} streamings={STREAMINGS} generos={GENEROS} />);
    expect(screen.getByRole("button", { name: "Filmes" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Séries" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Populares" })).toHaveAttribute("aria-pressed", "true");
  });
});
