import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Erro from "@/app/error";

describe("tela de erro", () => {
  it("explica a falha e tenta de novo ao clicar", async () => {
    const retry = vi.fn();
    render(<Erro error={new Error("x")} retry={retry} />);
    expect(screen.getByText("Não conseguimos carregar os títulos agora.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(retry).toHaveBeenCalled();
  });
});
