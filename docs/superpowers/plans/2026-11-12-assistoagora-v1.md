# AssistoAgora v1 — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App web responsivo e sem login que mostra o que assistir agora nos streamings por assinatura do Brasil, usando a API do TMDB.

**Architecture:** Next.js App Router com Server Components. O servidor lê os filtros da URL (e, na falta deles, o cookie), consulta o TMDB com o token, que nunca sai do servidor, e devolve a página pronta. Toda a conversa com o TMDB fica em `lib/tmdb/`, e só `lib/tmdb/cliente.ts` conhece o token e a URL base. Os componentes de navegador cuidam apenas de mudar a URL e gravar o cookie.

**Tech Stack:** Next.js (App Router, versão estável atual), React, TypeScript, Tailwind CSS v4, Vitest + Testing Library (jsdom), TMDB API v3.

**Spec:** `docs/superpowers/specs/2026-11-12-streaming-tmdb-design.md` (leia junto com este plano).

## Global Constraints

- Todas as chamadas ao TMDB levam `language=pt-BR`. As chamadas de disponibilidade e descoberta levam `watch_region=BR`.
- Descoberta sempre com `with_watch_monetization_types=flatrate`.
- Token em `process.env.TMDB_READ_TOKEN`, enviado como `Authorization: Bearer <token>`. Nunca usar prefixo `NEXT_PUBLIC_` e nunca importar `lib/tmdb/*` em componente `"use client"`.
- Cache: streamings e gêneros com `revalidate: 86400`; descoberta e detalhes com `revalidate: 3600`.
- Parâmetros de URL: `tipo` (`filme`|`serie`, padrão `filme`), `streamings` (IDs separados por vírgula), `genero` (ID), `ordem` (`populares`|`avaliados`|`lancamentos`, padrão `populares`), `pagina` (1–500, padrão 1). Valores inválidos viram o padrão, sem erro.
- Cookie `meus_streamings`: IDs separados por vírgula, `max-age` de 1 ano (31536000), `path=/`, `SameSite=Lax`.
- "Mais bem avaliados" sempre com `vote_count.gte=200`.
- Paleta, tipografia, componentes e grade conforme a seção 12 da spec, com os tokens exatos `bg #0b0d12`, `surface #151922`, `surface-2 #1d2230`, `line #2a3040`, `text #f1f3f8`, `muted #9aa3b5`, `accent #f5b84a`, `accent-ink #1a1204`.
- Nome do app `AssistoAgora`, definido uma única vez em `lib/app.ts`.
- Texto de atribuição exato: `Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.` Crédito exato: `Dados de disponibilidade: JustWatch`.
- Imagens via `next/image` a partir de `https://image.tmdb.org/t/p/<tamanho><caminho>`.
- Todo texto da interface em português do Brasil.
- Ambiente: Windows. Comandos com `npm` e `npx`.

## Review Focus

1. **Link antigo ou adulterado na URL** (`?pagina=999&genero=abc&ordem=xyz`): o app mostra a página com os padrões, sem erro. Quando a página passa do total, aparece o estado vazio. Teste na Task 2.
2. **Cookie corrompido** (`abc,8,,-1,8`): IDs inválidos e repetidos são descartados, e o resultado é `[8]`. Teste na Task 2.
3. **Título com dados faltando** (sem data, sem capa, 0 votos): o ano vira `null`, a capa usa o placeholder e a nota fica `null` (o selo some, em vez de mostrar "★ 0.0"). Testes nas Tasks 5 e 7.
4. **TMDB fora do ar, 429 ou token ausente:** `tmdbFetch` lança `TmdbError` com status. Quando falta o token, a mensagem diz claramente `TMDB_READ_TOKEN não configurado`, e o usuário vê a tela de erro com "Tentar de novo". Teste na Task 3.
5. **ID não numérico na rota de detalhes** (`/filme/abc`): a página chama `notFound()` sem consultar o TMDB. Um ID inexistente (TMDB responde 404) também leva ao not-found. Teste na Task 6 (`buscarDetalhes` retorna `null`), e a rota é tratada na Task 9.

---

## Estrutura de arquivos

```
lib/app.ts                     # NOME_APP
lib/tipos.ts                   # Tipo, Ordem, Filtros, Streaming, Genero, TituloResumo, PaginaTitulos, DetalhesTitulo...
lib/filtros.ts                 # parseFiltros, serializarFiltros
lib/cookies.ts                 # COOKIE_STREAMINGS, lerIdsStreamings, cookieStreamings
lib/tmdb/cliente.ts            # tmdbFetch, TmdbError
lib/tmdb/imagens.ts            # urlImagem
lib/tmdb/catalogos.ts          # listarStreamings, listarGeneros
lib/tmdb/descoberta.ts         # montarParametrosDescoberta, descobrir
lib/tmdb/detalhes.ts           # escolherTrailer, extrairOndeAssistir, buscarDetalhes
app/layout.tsx, app/globals.css, app/page.tsx, app/error.tsx, app/not-found.tsx
app/filme/[id]/page.tsx, app/serie/[id]/page.tsx
components/Cabecalho.tsx, Rodape.tsx, CardTitulo.tsx, GradeTitulos.tsx, Paginacao.tsx,
           Filtros.tsx, SeletorStreamings.tsx, DetalhesTitulo.tsx, OndeAssistir.tsx, BotaoVoltar.tsx
tests/...                      # espelha lib/ e components/
```

---

### Task 1: Projeto base, tema e rodapé com atribuições

**Files:**
- Create: projeto Next.js na raiz de `streaming-tmdb/`, `vitest.config.mts`, `tests/setup.ts`, `.env.example`, `lib/app.ts`, `components/Cabecalho.tsx`, `components/Rodape.tsx`, `public/tmdb-logo.svg`
- Modify: `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder), `next.config.ts`, `package.json`, `.gitignore`
- Test: `tests/components/Rodape.test.tsx`

**Interfaces:**
- Produces: `NOME_APP = "AssistoAgora"` em `lib/app.ts`; classes Tailwind `bg-bg`, `bg-surface`, `bg-surface-2`, `border-line`, `text-text`, `text-muted`, `bg-accent`, `text-accent`, `text-accent-ink`; o script `npm test` (vitest run).

- [ ] **Step 1: Verificar pré-requisito.** Rode `node -v`. O esperado é `v20` ou superior. Se o comando não existir, pare e peça à pessoa usuária que instale o Node.js LTS em nodejs.org.
- [ ] **Step 2: Gerar o projeto em pasta temporária.** A raiz já tem `.superpowers/` e o `create-next-app` recusa pastas não vazias. Rode, a partir de `Curso Claude/`:
  `npx create-next-app@latest _scaffold --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --turbopack --yes`
  Em seguida, mova todo o conteúdo de `_scaffold/` para `streaming-tmdb/`, exceto `.git`. Junte o `.gitignore` gerado com o existente, mantendo `.superpowers/` e `.env*.local`. Por fim, apague `_scaffold/`.
- [ ] **Step 3: Instalar dependências de teste:** `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths`. Crie `vitest.config.mts` (plugins `react()` e `tsconfigPaths()`, `environment: "jsdom"`, `setupFiles: ["./tests/setup.ts"]`) e `tests/setup.ts` (importa `@testing-library/jest-dom/vitest`). No `package.json`, adicione `"test": "vitest run"`.
- [ ] **Step 4: Escrever o teste que falha** em `tests/components/Rodape.test.tsx`:
  - `renderiza o texto de atribuição do TMDB`: espera `getByText("Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.")`.
  - `renderiza o crédito da JustWatch`: espera `getByText(/Dados de disponibilidade: JustWatch/)`.
  - `exibe o logo do TMDB`: espera `getByAltText("TMDB")`.
- [ ] **Step 5: Rodar** `npm test`. Esperado: FAIL (módulo `@/components/Rodape` não existe).
- [ ] **Step 6: Implementar.**
  - `Rodape()` com o logo (`/tmdb-logo.svg`, alt `TMDB`, altura 16px) e os dois textos em `text-muted text-xs`. O logo oficial vem da página de logos do TMDB (`https://www.themoviedb.org/about/logos-attribution`); use a versão "short" em SVG.
  - `Cabecalho()` com `Assisto` + `<span className="text-accent">Agora</span>` (derivado de `NOME_APP`), à direita `Brasil · pt-BR` em `text-muted`.
  - `globals.css`: `@theme` com os 8 tokens de cor da spec, `body` com `bg-bg text-text` e fonte `system-ui, "Segoe UI", -apple-system, sans-serif`.
  - `layout.tsx`: `lang="pt-BR"`, `metadata.title = NOME_APP`, Cabecalho, `{children}` e Rodape.
  - `next.config.ts`: `images.remotePatterns` com `{ protocol: "https", hostname: "image.tmdb.org" }`.
  - `.env.example`: `TMDB_READ_TOKEN=`.
  - `app/page.tsx`: apenas `<h1>O que assistir agora?</h1>` por enquanto.
- [ ] **Step 7: Rodar** `npm test` (esperado: 3 testes PASS) e `npm run build` (esperado: build sem erros).
- [ ] **Step 8: Commit**: `git add -A && git commit -m "chore: projeto Next.js base com tema e atribuições"`.

---

### Task 2: Tipos, filtros da URL e cookie

**Files:**
- Create: `lib/tipos.ts`, `lib/filtros.ts`, `lib/cookies.ts`
- Test: `tests/lib/filtros.test.ts`, `tests/lib/cookies.test.ts`

**Interfaces:**
- Produces, em `lib/tipos.ts`:
  ```ts
  export type Tipo = "filme" | "serie";
  export type Ordem = "populares" | "avaliados" | "lancamentos";
  export interface Filtros { tipo: Tipo; streamings: number[]; genero: number | null; ordem: Ordem; pagina: number }
  export interface Streaming { id: number; nome: string; logo: string | null; prioridade: number }
  export interface Genero { id: number; nome: string }
  export interface TituloResumo { id: number; tipo: Tipo; titulo: string; ano: string | null; nota: number | null; capa: string | null; generoIds: number[] }
  export interface PaginaTitulos { titulos: TituloResumo[]; pagina: number; totalPaginas: number }
  export interface Trailer { chaveYoutube: string; nome: string }
  export interface MembroElenco { id: number; nome: string; personagem: string; foto: string | null }
  export interface DetalhesTitulo {
    id: number; tipo: Tipo; titulo: string; ano: string | null; nota: number | null;
    capa: string | null; fundo: string | null; sinopse: string;
    duracaoMin: number | null; temporadas: number | null; generos: string[];
    elenco: MembroElenco[]; trailer: Trailer | null; ondeAssistir: Streaming[];
  }
  ```
  `capa`, `fundo`, `logo` e `foto` guardam o **caminho** do TMDB (ex.: `/abc.jpg`), não a URL completa.
- Produces, em `lib/cookies.ts`: `COOKIE_STREAMINGS = "meus_streamings"`; `lerIdsStreamings(valor: string | undefined): number[]` (inteiros > 0, sem repetição, na ordem em que aparecem); `cookieStreamings(ids: number[]): string`, que retorna a string completa para `document.cookie` (`meus_streamings=8,119; max-age=31536000; path=/; SameSite=Lax`).
- Produces, em `lib/filtros.ts`:
  - `parseFiltros(params: Record<string, string | string[] | undefined>, cookie?: string): Filtros`. Quando o valor é array, usa o primeiro. Se `streamings` estiver ausente ou vazio na URL, usa `lerIdsStreamings(cookie)`.
  - `serializarFiltros(f: Filtros): string`, query sem `?`, omitindo valores padrão (`tipo=filme`, `ordem=populares`, `pagina=1`, `genero` nulo, `streamings` vazio).

- [ ] **Step 1: Escrever os testes que falham.**
  - `cookies.test.ts`:
    - `lerIdsStreamings("abc,8,,-1,8")` → `[8]`.
    - `lerIdsStreamings(undefined)` → `[]`.
    - `cookieStreamings([8,119])` → `"meus_streamings=8,119; max-age=31536000; path=/; SameSite=Lax"`.
  - `filtros.test.ts`:
    - `parseFiltros({})` → `{ tipo:"filme", streamings:[], genero:null, ordem:"populares", pagina:1 }`.
    - `parseFiltros({ tipo:"serie", streamings:"8,119", genero:"35", ordem:"avaliados", pagina:"3" })` → valores correspondentes, com `streamings:[8,119]` e `genero:35`.
    - `parseFiltros({ tipo:"xyz", genero:"abc", ordem:"xyz", pagina:"999" })` → todos os padrões.
    - Para `pagina`: `"0"`, `"-2"` e `"1.5"` → `1`; `"500"` → `500`.
    - URL vence cookie: `parseFiltros({ streamings:"337" }, "8,119").streamings` → `[337]`.
    - Cookie quando a URL não tem: `parseFiltros({}, "8,119").streamings` → `[8,119]`.
    - Array usa o primeiro valor: `parseFiltros({ tipo:["serie","filme"] }).tipo` → `"serie"`.
    - `serializarFiltros` dos padrões → `""`.
    - Ida e volta: `new URLSearchParams(serializarFiltros(f))` com `f = {tipo:"serie",streamings:[8,119],genero:35,ordem:"lancamentos",pagina:2}` tem `get("streamings") === "8,119"`, e `parseFiltros(Object.fromEntries(...))` devolve `f`.
- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL (módulos inexistentes).
- [ ] **Step 3: Implementar** `lib/tipos.ts`, `lib/cookies.ts` e `lib/filtros.ts` com as assinaturas acima. `pagina` só é aceita se for inteiro com `1 ≤ n ≤ 500`. `genero` só é aceito se for inteiro > 0.
- [ ] **Step 4: Rodar** `npm test`. Esperado: tudo PASS.
- [ ] **Step 5: Commit**: `git add lib tests && git commit -m "feat: tipos, filtros da URL e cookie de streamings"`.

---

### Task 3: Cliente do TMDB e URLs de imagem

**Files:**
- Create: `lib/tmdb/cliente.ts`, `lib/tmdb/imagens.ts`
- Test: `tests/lib/tmdb/cliente.test.ts`, `tests/lib/tmdb/imagens.test.ts`

**Interfaces:**
- Produces:
  - `class TmdbError extends Error { status: number }`.
  - `tmdbFetch<T>(caminho: string, params: Record<string, string | number | undefined>, opcoes: { revalidate: number }): Promise<T>`: monta `https://api.themoviedb.org/3${caminho}?language=pt-BR&...`, ignora params `undefined`, envia `Authorization: Bearer ${process.env.TMDB_READ_TOKEN}` e `next: { revalidate }`. Se a resposta não for ok, lança `TmdbError(status)`.
  - `urlImagem(caminho: string | null, tamanho: "w92" | "w185" | "w342" | "w780" | "w1280"): string | null`, que retorna `https://image.tmdb.org/t/p/${tamanho}${caminho}` ou `null`.

- [ ] **Step 1: Escrever os testes que falham.** Use `vi.stubGlobal("fetch", vi.fn())` e `vi.stubEnv("TMDB_READ_TOKEN", "tok")`.
  - `envia Bearer e language pt-BR`: a URL chamada contém `/3/discover/movie?`, `language=pt-BR` e `page=2`, e o header `Authorization` é `"Bearer tok"`.
  - `omite parâmetros undefined`: com `{ with_genres: undefined }`, a URL não contém `with_genres`.
  - `repassa revalidate`: a segunda chamada a `fetch` recebe `next.revalidate === 3600`.
  - `lança TmdbError com status quando a resposta não é ok`: com o mock `{ ok:false, status:429 }`, a promessa rejeita com `TmdbError` e `status 429`.
  - `sem token lança erro claro`: com `vi.stubEnv("TMDB_READ_TOKEN", "")`, rejeita com uma mensagem contendo `TMDB_READ_TOKEN não configurado`, sem chamar `fetch`.
  - `urlImagem("/a.jpg","w342")` → `"https://image.tmdb.org/t/p/w342/a.jpg"`. `urlImagem(null,"w342")` → `null`.
- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 3: Implementar** os dois arquivos. Primeira linha de `cliente.ts`: `import "server-only";`. Instale com `npm i server-only` e, no `vitest.config.mts`, crie um alias de `server-only` para um arquivo vazio `tests/vazio.ts`.
- [ ] **Step 4: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 5: Commit**: `git add -A && git commit -m "feat: cliente TMDB com token no servidor"`.

---

### Task 4: Catálogos (streamings e gêneros)

**Files:**
- Create: `lib/tmdb/catalogos.ts`
- Test: `tests/lib/tmdb/catalogos.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch` (Task 3), `Streaming`, `Genero`, `Tipo` (Task 2).
- Produces:
  - `unirStreamings(filmes: ProviderTmdb[], series: ProviderTmdb[]): Streaming[]`, função pura e exportada.
  - `listarStreamings(): Promise<Streaming[]>` chama `/watch/providers/movie` e `/watch/providers/tv` com `watch_region=BR` e `revalidate: 86400`.
  - `listarGeneros(tipo: Tipo): Promise<Genero[]>` chama `/genre/movie/list` ou `/genre/tv/list`.
  - `ProviderTmdb = { provider_id: number; provider_name: string; logo_path: string | null; display_priority: number; display_priorities?: Record<string, number> }`.

- [ ] **Step 1: Escrever os testes que falham.**
  - `unirStreamings remove repetidos pelo id`: o provider 8 nas duas listas aparece uma vez.
  - `ordena pela prioridade do BR`: `display_priorities.BR` tem preferência sobre `display_priority`. Com A (BR 5) e B (BR 1), o resultado é `[B, A]`.
  - `mapeia campos`: `{ provider_id:8, provider_name:"Netflix", logo_path:"/n.jpg", display_priority:3 }` → `{ id:8, nome:"Netflix", logo:"/n.jpg", prioridade:3 }`.
  - `listarGeneros("serie") usa /genre/tv/list`: com `fetch` mockado devolvendo `{ genres:[{id:35,name:"Comédia"}] }`, retorna `[{id:35,nome:"Comédia"}]`, e a URL contém `/genre/tv/list`.
- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 3: Implementar** com `Promise.all` para as duas chamadas de streamings.
- [ ] **Step 4: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 5: Commit**: `git add -A && git commit -m "feat: catálogos de streamings e gêneros"`.

---

### Task 5: Descoberta de títulos

**Files:**
- Create: `lib/tmdb/descoberta.ts`
- Test: `tests/lib/tmdb/descoberta.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch` (Task 3), `Filtros`, `PaginaTitulos`, `TituloResumo` (Task 2).
- Produces:
  - `montarParametrosDescoberta(f: Filtros, hoje: string): Record<string, string | number | undefined>`, função pura. `hoje` vem no formato `YYYY-MM-DD`.
  - `mapearTitulo(item: ItemTmdb, tipo: Tipo): TituloResumo`, função pura.
  - `descobrir(f: Filtros): Promise<PaginaTitulos>`: chama `/discover/movie` ou `/discover/tv` com `revalidate: 3600` e a data de hoje no fuso `America/Sao_Paulo`. `totalPaginas` é `min(total_pages, 500)`.

- [ ] **Step 1: Escrever os testes que falham.**
  - Base (filme, padrões): `watch_region:"BR"`, `with_watch_monetization_types:"flatrate"`, `sort_by:"popularity.desc"`, `page:1`; `with_watch_providers` e `with_genres` ficam `undefined`.
  - `streamings [8,119]` → `with_watch_providers:"8|119"`. `genero 35` → `with_genres:"35"`.
  - `avaliados` (filme e série) → `sort_by:"vote_average.desc"` e `"vote_count.gte":200`.
  - `lancamentos` filme → `sort_by:"primary_release_date.desc"` e `"primary_release_date.lte":"2026-11-12"`.
  - `lancamentos` série → `sort_by:"first_air_date.desc"` e `"first_air_date.lte":"2026-11-12"`.
  - `mapearTitulo` filme: `{id:1,title:"X",release_date:"2024-05-01",vote_average:7.84,vote_count:10,poster_path:"/p.jpg",genre_ids:[18]}` → `{id:1,tipo:"filme",titulo:"X",ano:"2024",nota:7.8,capa:"/p.jpg",generoIds:[18]}`.
  - `mapearTitulo` série usa `name` e `first_air_date`.
  - Dados faltando: `release_date:""`, `poster_path:null`, `vote_count:0` → `ano:null`, `capa:null`, `nota:null`.
  - `descobrir limita totalPaginas a 500`: com o mock `total_pages: 9000` → `500`.
- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 3: Implementar.** A nota é arredondada para 1 casa (`Math.round(v*10)/10`). A data de hoje vem de `new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date())`.
- [ ] **Step 4: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 5: Commit**: `git add -A && git commit -m "feat: descoberta de títulos por filtros"`.

---

### Task 6: Detalhes do título

**Files:**
- Create: `lib/tmdb/detalhes.ts`
- Test: `tests/lib/tmdb/detalhes.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch`, `TmdbError` (Task 3); `ProviderTmdb` (exportado de `lib/tmdb/catalogos.ts`, Task 4); tipos `DetalhesTitulo`, `Trailer`, `Streaming`, `Tipo` (Task 2).
- Produces:
  - `escolherTrailer(videos: VideoTmdb[]): Trailer | null`, função pura.
  - `extrairOndeAssistir(wp: { results?: Record<string, { flatrate?: ProviderTmdb[] }> }): Streaming[]`, função pura, só `results.BR.flatrate`, ordenada por `display_priority`.
  - `buscarDetalhes(tipo: Tipo, id: number): Promise<DetalhesTitulo | null>`: chama `/movie/{id}` ou `/tv/{id}` com `append_to_response: "credits,videos,watch/providers"`, `include_video_language: "pt-BR,en,null"` e `revalidate: 3600`. Retorna `null` quando há `TmdbError` com status 404 e relança os demais erros.

- [ ] **Step 1: Escrever os testes que falham.**
  - `escolherTrailer`: entre `[ {site:"YouTube",type:"Teaser",iso_639_1:"pt"}, {site:"YouTube",type:"Trailer",iso_639_1:"en",key:"EN"}, {site:"YouTube",type:"Trailer",iso_639_1:"pt",key:"PT"} ]`, escolhe a chave `"PT"`.
  - Sem trailer em português, usa o inglês: `"EN"`.
  - Ignora `site:"Vimeo"`; lista sem trailer → `null`.
  - `extrairOndeAssistir` sem `results.BR` → `[]`. Com `BR.flatrate` e `BR.rent`, retorna só os de `flatrate`.
  - `buscarDetalhes("filme", 1)` com o mock de filme completo: `duracaoMin` vem de `runtime`, `temporadas` fica `null`, `generos` são os nomes e o `elenco` é limitado a 10 itens (o mock tem 15), com `personagem` a partir de `character`.
  - `buscarDetalhes("serie", 2)`: `temporadas` vem de `number_of_seasons`, `duracaoMin` fica `null`, e `titulo` e `ano` vêm de `name` e `first_air_date`.
  - O mock respondendo 404 → `null`. O mock respondendo 500 → rejeita com `TmdbError`.
- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 3: Implementar.** Ordem de preferência do trailer: `type === "Trailer"` e `site === "YouTube"`; primeiro `iso_639_1 === "pt"`, depois `"en"`, depois qualquer idioma. Nota com 1 casa, ou `null` quando `vote_count === 0`.
- [ ] **Step 4: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 5: Commit**: `git add -A && git commit -m "feat: detalhes do título com trailer e onde assistir"`.

---

### Task 7: Grade, card e paginação na página inicial

**Files:**
- Create: `components/CardTitulo.tsx`, `components/GradeTitulos.tsx`, `components/Paginacao.tsx`, `public/sem-capa.svg`
- Modify: `app/page.tsx`
- Test: `tests/components/CardTitulo.test.tsx`, `tests/components/GradeTitulos.test.tsx`, `tests/components/Paginacao.test.tsx`

**Interfaces:**
- Consumes: `parseFiltros`, `serializarFiltros` (Task 2), `COOKIE_STREAMINGS` (Task 2), `descobrir` (Task 5), `listarStreamings`, `listarGeneros` (Task 4), `urlImagem` (Task 3).
- Produces:
  - `CardTitulo({ titulo: TituloResumo, nomeGenero: string | null })`
  - `GradeTitulos({ titulos: TituloResumo[], generos: Genero[] })`
  - `Paginacao({ filtros: Filtros, totalPaginas: number })`
  - Em `app/page.tsx`, `export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> })`, que lê o cookie com `(await cookies()).get(COOKIE_STREAMINGS)?.value`.

- [ ] **Step 1: Escrever os testes que falham.**
  - `CardTitulo`: o link aponta para `/filme/1` (ou `/serie/1` quando o tipo é série). Mostra `★ 7.8`, e o texto `2024 · Drama` aparece quando `nomeGenero="Drama"`. Com `nota:null`, não há texto com `★`. Com `capa:null`, a imagem usa `/sem-capa.svg` e `alt` igual ao título. Com `ano:null` e `nomeGenero:null`, não aparece `·` solto.
  - `GradeTitulos`: com lista vazia, mostra `Nada encontrado com esses filtros. Tente remover um gênero ou adicionar streamings.` Com 2 títulos, renderiza 2 links. O nome do gênero vem do primeiro `generoIds` encontrado em `generos`.
  - `Paginacao`: na página 1, o "Anterior" não é link (`aria-disabled="true"`) e o link "Próxima" tem `href` com `pagina=2` preservando `streamings=8,119`. Mostra `Página 1 de 48`. Na última página, "Próxima" fica desabilitado. Com `totalPaginas` igual a 0 ou 1, não renderiza nada.
- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 3: Implementar os componentes** conforme a seção 12 da spec:
  - Capa 2:3 com `rounded-xl`, sombra, degradê escuro na base, selo da nota no canto superior direito e `hover:-translate-y-1`.
  - Grade `grid-cols-2 sm:grid-cols-4 xl:grid-cols-6` (os breakpoints 641px e 1100px ficam definidos no `@theme` como `--breakpoint-sm: 641px` e `--breakpoint-xl: 1100px`).
  - `Paginacao` usa `<Link href={"/?" + serializarFiltros({...filtros, pagina: n})}>`.
  - Em `app/page.tsx`, use `Promise.all([descobrir(f), listarStreamings(), listarGeneros(f.tipo)])` e renderize o título "O que assistir agora?", o subtítulo "Marque seus streamings e veja o que está disponível neles hoje.", a linha de contagem, `GradeTitulos` e `Paginacao`. Os filtros entram na Task 8; por ora, deixe um `{/* Filtros */}` no lugar.
  - `sem-capa.svg`: retângulo 2:3 na cor `surface-2` com um ícone simples de filme.
- [ ] **Step 4: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 5: Verificação manual.** A pessoa usuária cria o `.env.local` com `TMDB_READ_TOKEN=<token>`; se não houver token, guie-a a gerar em themoviedb.org → Configurações → API → "API Read Access Token". Rode `npm run dev` e abra `http://localhost:3000`. Esperado: a grade com 20 títulos reais. Abra `/?pagina=2` e confira que os títulos mudam.
- [ ] **Step 6: Commit**: `git add -A && git commit -m "feat: página inicial com grade e paginação"`.

---

### Task 8: Filtros e seletor de streamings (navegador)

**Files:**
- Create: `components/Filtros.tsx`, `components/SeletorStreamings.tsx`
- Modify: `app/page.tsx` (troca o `{/* Filtros */}` pelo componente)
- Test: `tests/components/Filtros.test.tsx`, `tests/components/SeletorStreamings.test.tsx`

**Interfaces:**
- Consumes: `serializarFiltros` (Task 2), `cookieStreamings` (Task 2), `urlImagem` (Task 3). `lib/filtros.ts`, `lib/cookies.ts` e `lib/tmdb/imagens.ts` não podem importar nada de servidor, porque são usados no navegador.
- Produces:
  - `Filtros({ filtros: Filtros, streamings: Streaming[], generos: Genero[] })`, componente `"use client"` que usa `useRouter().push`.
  - `SeletorStreamings({ streamings: Streaming[], selecionados: number[], aoMudar: (ids: number[]) => void })`.

- [ ] **Step 1: Escrever os testes que falham.** Mocke `next/navigation` (`useRouter` → `{ push }`) e espie `document.cookie` com `vi.spyOn(document, "cookie", "set")`.
  - `SeletorStreamings`: mostra os 12 primeiros e "Ver todos ›". Ao clicar em "Ver todos", aparecem os demais (teste com 15). O item selecionado tem `aria-pressed="true"`. Clicar num item não selecionado chama `aoMudar([...selecionados, id])`, e clicar num selecionado o remove.
  - `Filtros`, a partir de `{tipo:"filme",streamings:[8],genero:35,ordem:"populares",pagina:3}`:
    - Ligar o streaming 119 chama `push("/?" + serializarFiltros({...f, streamings:[8,119], pagina:1}))` e grava `cookieStreamings([8,119])`.
    - Clicar em "Séries" faz `push` com `tipo=serie`, sem `genero` e com `pagina` 1.
    - Mudar a ordem para "Mais bem avaliados" faz `push` com `ordem=avaliados` e `pagina` 1, mantendo o `genero` 35.
    - Escolher um gênero na lista (`<select>` com a opção "Todos" de valor vazio) faz `push` com `genero` e `pagina` 1. Escolher "Todos" remove o `genero`.
    - Os botões de tipo e ordenação ativos têm `aria-pressed="true"`.
- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 3: Implementar** no visual da seção 12: pílulas com logo `w92` (ou a inicial do nome quando `logo` é null), borda `accent` e "✓" quando ligadas, rolagem horizontal no celular; segmented control para tipo e ordenação; `<select>` no estilo `surface`. Rótulos: "Meus streamings", "Tipo", "Gênero" e "Ordenar por". No `app/page.tsx`, a linha de contagem mostra `"{Filmes|Séries} em {nomes dos streamings selecionados}"` ou `"{Filmes|Séries} em todos os streamings"`, seguida de `· página N`.
- [ ] **Step 4: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 5: Verificação manual** com `npm run dev`:
  - Ligue Netflix e mude para Séries; a URL e a grade se atualizam.
  - Feche a aba, abra `http://localhost:3000` de novo: a Netflix continua marcada (cookie).
- [ ] **Step 6: Commit**: `git add -A && git commit -m "feat: filtros e memória de streamings"`.

---

### Task 9: Páginas de detalhes, erro e não encontrado

**Files:**
- Create: `app/filme/[id]/page.tsx`, `app/serie/[id]/page.tsx`, `components/DetalhesTitulo.tsx`, `components/OndeAssistir.tsx`, `components/BotaoVoltar.tsx`, `app/error.tsx`, `app/not-found.tsx`
- Test: `tests/components/DetalhesTitulo.test.tsx`, `tests/components/OndeAssistir.test.tsx`, `tests/components/BotaoVoltar.test.tsx`, `tests/lib/rota.test.ts`
- Create: `lib/rota.ts`

**Interfaces:**
- Consumes: `buscarDetalhes` (Task 6), `urlImagem` (Task 3), `DetalhesTitulo`, `Streaming` (Task 2).
- Produces:
  - `idDaRota(valor: string): number | null`, função pura em `lib/rota.ts` (só aceita inteiro > 0).
  - `DetalhesTitulo({ titulo: DetalhesTitulo })` (o tipo é importado com o alias `DetalhesTituloDados`).
  - `OndeAssistir({ streamings: Streaming[] })`.
  - `BotaoVoltar()`, componente `"use client"`.
  - Cada `page.tsx` recebe `params: Promise<{ id: string }>` e chama `notFound()` quando `idDaRota` ou `buscarDetalhes` retornam `null`.

- [ ] **Step 1: Escrever os testes que falham.**
  - `idDaRota`: `"603"` → `603`; `"abc"`, `"0"`, `"-1"` e `"1.5"` → `null`.
  - `OndeAssistir`: lista vazia mostra `Não disponível em streaming por assinatura no Brasil no momento.` Com 2 itens, mostra 2 logos com `alt` igual ao nome. Sempre mostra `Dados de disponibilidade: JustWatch`.
  - `DetalhesTitulo`:
    - Filme mostra `"2h 16min"` para `duracaoMin: 136`; série mostra `"3 temporadas"` (singular `"1 temporada"`).
    - Sem trailer, não existe o heading `Trailer`. Com trailer, existe um `iframe` com `src` `https://www.youtube-nocookie.com/embed/<chave>`.
    - Mostra no máximo os itens de `elenco` recebidos, com nome e personagem.
    - Com `sinopse` vazia, mostra `Sinopse não disponível.`
  - `BotaoVoltar` (mock de `useRouter` com `back` e `push`): com `window.history.length > 1`, chama `back()`; caso contrário, chama `push("/")`.
- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 3: Implementar.**
  - Layout de detalhes conforme a seção 12: backdrop `w1280` no topo com degradê para `bg`; capa `w342` e informações sobrepostas; gêneros como pílulas `surface`; elenco em fileira com foto `w185` (ou placeholder); trailer em `iframe` 16:9.
  - Fotos do elenco e logos via `next/image`.
  - `error.tsx` (`"use client"`, recebe `reset`): `Não conseguimos carregar os títulos agora.` e o botão `Tentar de novo`, que chama `reset()`.
  - `not-found.tsx`: `Título não encontrado.` e um link `Voltar para o início` apontando para `/`.
  - A rota `[id]` usa `idDaRota` antes de qualquer chamada ao TMDB.
- [ ] **Step 4: Rodar** `npm test`. Esperado: PASS.
- [ ] **Step 5: Verificação manual** com `npm run dev`:
  - Clique num card: os detalhes abrem; "Voltar" retorna com os filtros intactos.
  - Abra `/filme/abc` e `/filme/999999999`: os dois mostram "Título não encontrado."
  - Troque o token do `.env.local` por um valor inválido e reinicie: aparece a tela de erro. Depois restaure o token.
- [ ] **Step 6: Commit**: `git add -A && git commit -m "feat: páginas de detalhes, erro e não encontrado"`.

---

### Task 10: Verificação final e preparação para publicar

**Files:**
- Create: `README.md`
- Test: roteiro manual abaixo

- [ ] **Step 1: Rodar** `npm test` (esperado: tudo PASS), `npm run lint` (esperado: sem erros) e `npm run build` (esperado: build concluído).
- [ ] **Step 2: Roteiro manual**, com a janela em ~390px e em ~1440px de largura:
  1. Cada filtro muda a grade e a URL.
  2. A grade tem 2 colunas no celular e 6 no computador.
  3. A fila de streamings rola na horizontal no celular.
  4. A paginação funciona nos dois sentidos.
  5. A combinação de filtros sem resultado mostra o estado vazio.
  6. O cookie lembra os streamings depois de fechar e reabrir.
  7. A página de detalhes mostra trailer, elenco e onde assistir.
  8. O rodapé traz as atribuições em todas as páginas.
  9. Os casos da Review Focus (itens 1 a 5) se comportam como descrito.

  Registre qualquer falha e corrija antes de seguir.
- [ ] **Step 3: Escrever o `README.md`** em português: o que é o app; pré-requisitos (Node.js 20+ e o token do TMDB); `npm install`; criar `.env.local` a partir de `.env.example`; `npm run dev`; `npm test`; os créditos TMDB e JustWatch.
- [ ] **Step 4: Commit**: `git add -A && git commit -m "docs: README e verificação final da v1"`.
- [ ] **Step 5: Publicação (com a pessoa usuária presente).** Esta etapa exige o login dela no GitHub e na Vercel. Siga, explicando cada passo:
  1. Criar o repositório no GitHub.
  2. `git remote add origin <url>` e `git push -u origin main`.
  3. Importar o repositório na Vercel.
  4. Configurar `TMDB_READ_TOKEN` nas variáveis de ambiente da Vercel.
  5. Abrir a URL publicada e repetir os itens 1, 6 e 7 do roteiro manual.
