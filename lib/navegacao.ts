// Lembra (só nesta aba) que a pessoa passou pela lista do app.
// Assim o "Voltar" dos detalhes sabe se o histórico anterior é do app ou de outro site.

const CHAVE = "assistoagora:navegou";

export function marcarNavegacaoInterna(): void {
  try {
    sessionStorage.setItem(CHAVE, "1");
  } catch {
    // Armazenamento bloqueado (ex.: aba anônima restrita): o Voltar cai no início.
  }
}

export function veioDeDentroDoApp(): boolean {
  try {
    return sessionStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}
