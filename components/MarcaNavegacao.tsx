"use client";

import { useEffect } from "react";
import { marcarNavegacaoInterna } from "@/lib/navegacao";

// Colocado na página inicial: registra que a pessoa está navegando dentro do app.
export default function MarcaNavegacao() {
  useEffect(() => {
    marcarNavegacaoInterna();
  }, []);
  return null;
}
