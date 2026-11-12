import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const back = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ back, push }) }));

import BotaoVoltar from "@/components/BotaoVoltar";

afterEach(() => {
  back.mockReset();
  push.mockReset();
  vi.restoreAllMocks();
});

describe("BotaoVoltar", () => {
  it("volta no histórico quando há página anterior", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    render(<BotaoVoltar />);
    await userEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    expect(back).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("vai para o início quando a página foi aberta direto", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(1);
    render(<BotaoVoltar />);
    await userEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    expect(push).toHaveBeenCalledWith("/");
    expect(back).not.toHaveBeenCalled();
  });
});
