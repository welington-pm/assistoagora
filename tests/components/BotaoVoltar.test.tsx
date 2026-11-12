import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const back = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ back, push }) }));

import BotaoVoltar from "@/components/BotaoVoltar";
import MarcaNavegacao from "@/components/MarcaNavegacao";

afterEach(() => {
  back.mockReset();
  push.mockReset();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("BotaoVoltar", () => {
  it("volta no histórico quando a pessoa veio da lista do app", async () => {
    render(<MarcaNavegacao />);
    render(<BotaoVoltar />);
    await userEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    expect(back).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("vai para o início quando a página foi aberta direto, mesmo com histórico de outro site", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    render(<BotaoVoltar />);
    await userEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    expect(push).toHaveBeenCalledWith("/");
    expect(back).not.toHaveBeenCalled();
  });

  it("vai para o início se o navegador bloquear o armazenamento", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    render(<BotaoVoltar />);
    await userEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    expect(push).toHaveBeenCalledWith("/");
  });
});
