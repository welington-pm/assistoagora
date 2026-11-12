import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import Filtros from "@/components/Filtros";
import { serializarFiltros } from "@/lib/filtros";
import type { Filtros as TipoFiltros, Genero, Streaming } from "@/lib/tipos";

const F: TipoFiltros = {
  tipo: "filme",
  streamings: [8],
  genero: 35,
  ordem: "populares",
  pagina: 3,
  notaMin: null,
  notaMax: null,
};
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

  it("escolher a faixa de notas aplica os dois lados e volta à página 1", async () => {
    const { rerender } = render(<Filtros filtros={F} streamings={STREAMINGS} generos={GENEROS} />);
    await userEvent.selectOptions(screen.getByLabelText("Nota mínima"), "6");
    expect(urlEnviada().get("nota_min")).toBe("6");
    expect(urlEnviada().get("genero")).toBe("35");
    expect(urlEnviada().get("pagina")).toBeNull();

    rerender(<Filtros filtros={{ ...F, notaMin: 6 }} streamings={STREAMINGS} generos={GENEROS} />);
    await userEvent.selectOptions(screen.getByLabelText("Nota máxima"), "8");
    expect(urlEnviada().get("nota_min")).toBe("6");
    expect(urlEnviada().get("nota_max")).toBe("8");
  });

  it("Qualquer remove o lado escolhido da faixa", async () => {
    render(<Filtros filtros={{ ...F, notaMin: 6, notaMax: 8 }} streamings={STREAMINGS} generos={GENEROS} />);
    await userEvent.selectOptions(screen.getByLabelText("Nota mínima"), "");
    expect(urlEnviada().get("nota_min")).toBeNull();
    expect(urlEnviada().get("nota_max")).toBe("8");
  });

  it.each(["8", "5"])("nota mínima %s, igual ou acima da máxima 5, limpa a máxima", async (valor) => {
    render(<Filtros filtros={{ ...F, notaMax: 5 }} streamings={STREAMINGS} generos={GENEROS} />);
    await userEvent.selectOptions(screen.getByLabelText("Nota mínima"), valor);
    expect(urlEnviada().get("nota_min")).toBe(valor);
    expect(urlEnviada().get("nota_max")).toBeNull();
  });

  it.each(["4", "6"])("nota máxima %s, igual ou abaixo da mínima 6, limpa a mínima", async (valor) => {
    render(<Filtros filtros={{ ...F, notaMin: 6 }} streamings={STREAMINGS} generos={GENEROS} />);
    await userEvent.selectOptions(screen.getByLabelText("Nota máxima"), valor);
    expect(urlEnviada().get("nota_max")).toBe(valor);
    expect(urlEnviada().get("nota_min")).toBeNull();
  });

  it("mostra a faixa atual nos dois campos", () => {
    render(<Filtros filtros={{ ...F, notaMin: 6, notaMax: 8 }} streamings={STREAMINGS} generos={GENEROS} />);
    expect(screen.getByLabelText("Nota mínima")).toHaveValue("6");
    expect(screen.getByLabelText("Nota máxima")).toHaveValue("8");
    expect(screen.getByRole("group", { name: "Nota" })).toBeInTheDocument();
  });

  it("marca o tipo e a ordem ativos com aria-pressed", () => {
    render(<Filtros filtros={F} streamings={STREAMINGS} generos={GENEROS} />);
    expect(screen.getByRole("button", { name: "Filmes" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Séries" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Populares" })).toHaveAttribute("aria-pressed", "true");
  });
});
