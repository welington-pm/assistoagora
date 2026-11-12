import { describe, expect, it } from "vitest";
import { urlImagem } from "@/lib/tmdb/imagens";

describe("urlImagem", () => {
  it("monta a URL completa da imagem", () => {
    expect(urlImagem("/a.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/a.jpg");
  });

  it("retorna null quando não há caminho", () => {
    expect(urlImagem(null, "w342")).toBeNull();
  });
});
