import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SeletorStreamings from "@/components/SeletorStreamings";
import type { Streaming } from "@/lib/tipos";

const LISTA: Streaming[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  nome: `Streaming ${i + 1}`,
  logo: null,
  prioridade: i,
}));

describe("SeletorStreamings", () => {
  it("mostra os 12 primeiros e o botão Ver todos", () => {
    render(<SeletorStreamings streamings={LISTA} selecionados={[]} aoMudar={() => {}} />);
    expect(screen.getByRole("button", { name: /Streaming 12/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Streaming 13/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver todos ›" })).toBeInTheDocument();
  });

  it("mostra os demais ao clicar em Ver todos", async () => {
    render(<SeletorStreamings streamings={LISTA} selecionados={[]} aoMudar={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Ver todos ›" }));
    expect(screen.getByRole("button", { name: /Streaming 15/ })).toBeInTheDocument();
  });

  it("mantém visível um selecionado fora dos 12 primeiros", () => {
    render(<SeletorStreamings streamings={LISTA} selecionados={[14]} aoMudar={() => {}} />);
    expect(screen.getByRole("button", { name: /Streaming 14/ })).toBeInTheDocument();
  });

  it("marca os selecionados com aria-pressed", () => {
    render(<SeletorStreamings streamings={LISTA} selecionados={[2]} aoMudar={() => {}} />);
    expect(screen.getByRole("button", { name: /Streaming 2$/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Streaming 3$/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("liga e desliga um streaming", async () => {
    const aoMudar = vi.fn();
    render(<SeletorStreamings streamings={LISTA} selecionados={[2]} aoMudar={aoMudar} />);
    await userEvent.click(screen.getByRole("button", { name: /Streaming 3$/ }));
    expect(aoMudar).toHaveBeenLastCalledWith([2, 3]);
    await userEvent.click(screen.getByRole("button", { name: /Streaming 2$/ }));
    expect(aoMudar).toHaveBeenLastCalledWith([]);
  });
});
