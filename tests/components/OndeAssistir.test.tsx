import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OndeAssistir from "@/components/OndeAssistir";

describe("OndeAssistir", () => {
  it("avisa quando não está disponível no Brasil", () => {
    render(<OndeAssistir streamings={[]} />);
    expect(screen.getByText("Não disponível em streaming por assinatura no Brasil no momento.")).toBeInTheDocument();
  });

  it("mostra o logo de cada streaming", () => {
    render(
      <OndeAssistir
        streamings={[
          { id: 8, nome: "Netflix", logo: "/n.png", prioridade: 0 },
          { id: 119, nome: "Prime Video", logo: "/p.png", prioridade: 2 },
        ]}
      />,
    );
    expect(screen.getByAltText("Netflix")).toBeInTheDocument();
    expect(screen.getByAltText("Prime Video")).toBeInTheDocument();
  });

  it("sempre credita a JustWatch", () => {
    render(<OndeAssistir streamings={[]} />);
    expect(screen.getByText(/Dados de disponibilidade: JustWatch/)).toBeInTheDocument();
  });
});
