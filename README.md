# AssistoAgora

App web para descobrir **o que assistir agora** nos streamings por assinatura disponíveis no Brasil (Netflix, Prime Video, Disney+, Max…).

Você marca os streamings que assina, escolhe filme ou série, gênero, faixa de notas e ordenação, e vê o que está disponível neles hoje. Cada título tem uma página com sinopse, elenco, trailer e onde assistir. O app lembra os seus streamings no navegador, sem precisar de login.

Projeto de estudo feito com Next.js e a API do TMDB.

## Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou mais novo.
- Uma conta gratuita no [TMDB](https://www.themoviedb.org) e o seu **API Read Access Token**: em themoviedb.org, vá em Configurações → API e copie o token longo que começa com `eyJ`. A "API Key" curta não serve.

## Como rodar

```bash
npm install
```

Copie `.env.example` para `.env.local` e cole o token:

```
TMDB_READ_TOKEN=eyJhbGciOi...
```

O `.env.local` nunca vai para o Git. Depois:

```bash
npm run dev
```

Abra http://localhost:3000.

## Outros comandos

| Comando | O que faz |
|---|---|
| `npm test` | Roda os testes automáticos (Vitest) |
| `npm run lint` | Verifica o estilo do código |
| `npm run build` | Gera a versão de produção |

## Como o código está organizado

- `app/`: as páginas (início, detalhes de filme e série, erro, não encontrado).
- `components/`: as peças visuais (grade, card, filtros, paginação…).
- `lib/tmdb/`: toda a conversa com o TMDB. Só `lib/tmdb/cliente.ts` conhece o token.
- `lib/filtros.ts` e `lib/cookies.ts`: os filtros no endereço da página e a memória dos streamings.
- `tests/`: os testes, espelhando as pastas acima.
- `docs/superpowers/`: o design (spec) e o plano de implementação.

## Créditos

<img src="public/tmdb-logo.svg" alt="TMDB" height="14">

Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
Dados de disponibilidade: JustWatch.
