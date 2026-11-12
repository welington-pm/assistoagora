# Streaming TMDB — "O que assistir agora" — Design (v1)

Data: 2026-11-12
Status: aguardando revisão

## 1. Objetivo

Aplicação web responsiva, sem login, que ajuda a pessoa a **decidir o que assistir agora** dentro dos serviços de streaming por assinatura disponíveis no Brasil, usando dados da API do TMDB.

É um projeto de **aprendizado**. A v1 deve ser simples e funcionar de ponta a ponta. A estrutura deve permitir, no futuro, login, banco de dados, mais páginas e integração com outros serviços, **sem que nada disso seja construído agora**.

### Critérios de sucesso da v1

- A pessoa escolhe seus streamings, o tipo (filme ou série), o gênero e a ordenação, e vê uma grade de títulos disponíveis nesses streamings no Brasil.
- Ao abrir um título, vê os detalhes e em quais streamings ele está disponível.
- Ao voltar ao site, os streamings escolhidos continuam marcados.
- Funciona bem no celular e no computador.
- A chave do TMDB nunca chega ao navegador.
- Atende às exigências de atribuição do TMDB e da JustWatch.

## 2. Escopo

### Dentro da v1

1. Escolher meus streamings (vários ao mesmo tempo).
2. Filtro de tipo: filme ou série.
3. Filtro por gênero (um gênero por vez).
4. Ordenação: populares, mais bem avaliados e lançamentos.
5. Página de detalhes.
6. Lembrar os streamings escolhidos no navegador (cookie).

### Fora da v1 (ideias para versões futuras)

Busca por nome, "Me surpreenda" (sorteio), login, favoritos e listas, banco de dados, avaliações próprias, outros idiomas e regiões.

## 3. Stack e decisões técnicas

| Item | Decisão |
|---|---|
| Framework | Next.js (App Router), versão estável atual |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS (padrão do `create-next-app`) |
| Dados | TMDB API v3, autenticada com o *API Read Access Token* (Bearer) |
| Renderização | Server Components: o servidor consulta o TMDB e devolve a página pronta |
| Estado dos filtros | Parâmetros do endereço (URL) |
| Memória dos streamings | Cookie `meus_streamings` |
| Testes | Vitest para a lógica pura |
| Publicação | Vercel (plano gratuito) |
| Região / idioma | `watch_region=BR`, `language=pt-BR` em todas as chamadas |

**Pré-requisitos (feitos pela pessoa usuária):**

- Ter o Node.js LTS instalado.
- Ter conta gratuita no TMDB e um *API Read Access Token*.
- O token fica no arquivo `.env.local` com o nome `TMDB_READ_TOKEN`. Esse arquivo nunca vai para o Git.

## 4. Páginas

### 4.1 Página inicial: "O que assistir agora" (`/`)

**Filtros (no topo):**

- **Meus streamings:** logos clicáveis (ligado/desligado). Mostra os 12 serviços mais relevantes no Brasil, pela `display_priority` do TMDB, e um botão "ver todos" que mostra o restante.
- **Tipo:** Filmes | Séries. O padrão é Filmes.
- **Gênero:** lista suspensa com "Todos" mais os gêneros do tipo escolhido. Filme e série têm listas de gêneros diferentes no TMDB. Ao trocar o tipo, o gênero volta para "Todos".
- **Ordenação:** Populares (padrão) | Mais bem avaliados | Lançamentos.

**Resultados:**

- Grade de capas com título, ano e nota (de 0 a 10, com uma casa decimal).
- Responsiva: 2 colunas no celular, 3 a 4 no tablet e 5 a 6 no computador.
- Paginação com os botões "Anterior" e "Próxima" (20 títulos por página, como o TMDB entrega).
- Cada capa leva à página de detalhes.

**Parâmetros do endereço:**

| Parâmetro | Valores | Padrão |
|---|---|---|
| `tipo` | `filme` \| `serie` | `filme` |
| `streamings` | IDs de provider separados por vírgula (ex.: `8,119`) | cookie, ou vazio |
| `genero` | ID de gênero do TMDB | vazio (todos) |
| `ordem` | `populares` \| `avaliados` \| `lancamentos` | `populares` |
| `pagina` | inteiro de 1 a 500 | `1` |

Valores inválidos são ignorados e trocados pelo padrão, sem mostrar erro.

**Quando nenhum streaming está selecionado:** mostra títulos disponíveis em **qualquer** streaming por assinatura no Brasil (`with_watch_monetization_types=flatrate`).

### 4.2 Página de detalhes (`/filme/[id]` e `/serie/[id]`)

- Imagem de fundo (backdrop) e capa.
- Título, ano, nota e duração (filme) ou número de temporadas (série).
- Gêneros e sinopse.
- Elenco principal: até 10 pessoas, com foto e personagem.
- Trailer: o primeiro vídeo do YouTube do tipo "Trailer", com preferência para pt-BR e, na falta, inglês. É incorporado na página. Sem trailer, a seção não aparece.
- **Onde assistir:** logos dos streamings por assinatura (`flatrate`) no Brasil, com o crédito "Dados de disponibilidade: JustWatch".
- **Voltar:** retorna à lista com os filtros anteriores (histórico do navegador). Se a página foi aberta direto por um link, volta para `/`.

## 5. Fluxo de dados

1. A pessoa muda um filtro. Um componente do navegador atualiza o endereço (URL).
2. A página do servidor lê os parâmetros do endereço e, se não houver `streamings` no endereço, lê o cookie.
3. O servidor chama o TMDB com o token, que fica só no servidor.
4. O servidor devolve o HTML pronto.

**Prioridade dos streamings:** o parâmetro do endereço vence o cookie, que vence o vazio. Toda mudança de streamings feita pela pessoa atualiza o endereço **e** grava o cookie (validade de 1 ano).

**Cache:**

- Lista de streamings e listas de gêneros: guardadas por 24 h.
- Resultados de descoberta e detalhes: guardados por 1 h.

## 6. Chamadas ao TMDB

| Uso | Endpoint |
|---|---|
| Streamings do Brasil | `GET /watch/providers/movie?watch_region=BR` (e `/tv`, unindo as duas listas sem repetir) |
| Gêneros | `GET /genre/movie/list`, `GET /genre/tv/list` |
| Descoberta | `GET /discover/movie` ou `/discover/tv` com `watch_region=BR`, `with_watch_monetization_types=flatrate`, `with_watch_providers=8\|119` (o "\|" significa "OU"), `with_genres`, `sort_by`, `page` |
| Detalhes | `GET /movie/{id}` ou `/tv/{id}` com `append_to_response=credits,videos,watch/providers` |

**Ordenação para os parâmetros do TMDB:**

| `ordem` | Filme | Série |
|---|---|---|
| `populares` | `popularity.desc` | `popularity.desc` |
| `avaliados` | `vote_average.desc` + `vote_count.gte=200` | `vote_average.desc` + `vote_count.gte=200` |
| `lancamentos` | `primary_release_date.desc` + `primary_release_date.lte=<hoje>` | `first_air_date.desc` + `first_air_date.lte=<hoje>` |

O `vote_count.gte=200` evita que títulos com pouquíssimos votos apareçam no topo dos "mais bem avaliados".

**Imagens:** `https://image.tmdb.org/t/p/<tamanho>/<caminho>`, servidas com o `next/image`. O domínio `image.tmdb.org` fica liberado na configuração.

## 7. Organização do código

Cada parte tem uma responsabilidade só:

```
streaming-tmdb/
  app/
    page.tsx                  # página inicial (servidor)
    filme/[id]/page.tsx       # detalhes de filme
    serie/[id]/page.tsx       # detalhes de série
    layout.tsx                # cabeçalho + rodapé com atribuições
    error.tsx                 # tela de erro genérica
    not-found.tsx             # título não encontrado
  components/
    Filtros.tsx               # (navegador) atualiza URL e grava cookie
    SeletorStreamings.tsx     # (navegador) logos liga/desliga + "ver todos"
    GradeTitulos.tsx          # grade de capas
    CardTitulo.tsx            # uma capa
    Paginacao.tsx
    DetalhesTitulo.tsx        # página de detalhes (compartilhada filme/série)
    OndeAssistir.tsx
    Rodape.tsx                # atribuições TMDB + JustWatch
  lib/
    tmdb/
      cliente.ts              # única parte que conhece token e URL base do TMDB
      tipos.ts                # tipos das respostas
      descoberta.ts           # monta a consulta e busca a lista
      detalhes.ts             # busca detalhes e escolhe o trailer
      catalogos.ts            # streamings e gêneros
    filtros.ts                # lê/valida parâmetros da URL -> objeto Filtros
    cookies.ts                # nome e formato do cookie de streamings
  tests/                      # testes Vitest da pasta lib/
```

**Regra:** somente `lib/tmdb/cliente.ts` acessa o token e faz `fetch` para o TMDB. As páginas usam as funções de `lib/tmdb/*` e não sabem como o TMDB funciona por dentro. Assim, adicionar login, banco ou rotas de API no futuro não muda essas partes.

## 8. Tratamento de erros e casos vazios

| Situação | Comportamento |
|---|---|
| TMDB fora do ar ou erro na chamada | `error.tsx`: "Não conseguimos carregar os títulos agora." e um botão "Tentar de novo" |
| Token ausente ou inválido | Erro claro no terminal ao rodar localmente; para o público, a mesma tela genérica |
| Nenhum resultado | "Nada encontrado com esses filtros. Tente remover um gênero ou adicionar streamings." |
| Título não existe (id inválido) | `not-found.tsx` com link para a página inicial |
| Título sem disponibilidade no Brasil | "Não disponível em streaming por assinatura no Brasil no momento." |
| Título sem capa ou foto | Imagem genérica (placeholder) |
| Sem trailer | A seção não aparece |
| Parâmetros inválidos na URL | Trocados pelo padrão, sem erro |

## 9. Atribuições obrigatórias

- **TMDB:** logo oficial do TMDB no rodapé, com o texto *"Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB."* O logo deve ser menos destacado que a identidade do próprio app.
- **JustWatch:** crédito "Dados de disponibilidade: JustWatch" junto à seção "Onde assistir" e no rodapé.
- O app não usa "TMDB" no próprio nome.
- O uso é não comercial (projeto de estudo).

## 10. Testes

- **Automáticos (Vitest), escritos antes do código (TDD), para `lib/`:**
  - `filtros.ts`: lê e valida parâmetros (valores válidos, inválidos, ausentes, prioridade URL > cookie).
  - `descoberta.ts`: monta os parâmetros certos do TMDB para cada combinação de tipo e ordem, junta os streamings com "|" e inclui a data de hoje em "lançamentos".
  - `detalhes.ts`: escolhe o trailer (pt-BR > inglês > nenhum) e extrai os streamings `flatrate` do BR.
  - `catalogos.ts`: une as listas de streamings de filme e série sem repetir e ordena por prioridade.
  - As chamadas reais ao TMDB são simuladas nos testes (mock do `fetch`).
- **Manuais, antes de considerar pronto:** roteiro de verificação no navegador em largura de celular e de computador, cobrindo cada filtro, a paginação, os detalhes, a memória do cookie (fechar e reabrir) e os estados vazios e de erro.

## 11. Publicação

- Repositório Git local, depois GitHub, depois a Vercel conectada ao repositório.
- `TMDB_READ_TOKEN` configurado como variável de ambiente na Vercel.
- `.env.local` fica no `.gitignore`.

## 12. Identidade visual

Direção: **cinema escuro**. Fundo escuro, capas como protagonistas e um acento dourado, que evita confundir o app com o vermelho da Netflix. Validado com o mockup da página inicial (`.superpowers/brainstorm/.../home-v1.html`, fora do Git).

**Nome do app:** AssistoAgora, exibido como "Assisto" + "Agora" na cor de acento. O nome é trocável e fica definido num único lugar do código.

**Paleta (tokens de tema do Tailwind):**

| Token | Cor | Uso |
|---|---|---|
| `bg` | `#0b0d12` | fundo da página |
| `surface` | `#151922` | botões, filtros, campos |
| `surface-2` | `#1d2230` | elementos em destaque sobre `surface` |
| `line` | `#2a3040` | bordas e divisórias |
| `text` | `#f1f3f8` | texto principal |
| `muted` | `#9aa3b5` | texto secundário, rótulos |
| `accent` | `#f5b84a` | seleção ativa, nota, botão principal |
| `accent-ink` | `#1a1204` | texto sobre fundo `accent` |

O tema é sempre escuro: não há modo claro na v1.

**Tipografia:** fonte do sistema (`system-ui`, "Segoe UI" e equivalentes), sem fonte externa. Título da página com 32px no computador e 24px no celular, em negrito e com espaçamento entre letras levemente negativo. Os rótulos dos filtros usam 11px, maiúsculas, espaçamento largo e a cor `muted`.

**Componentes:**

- **Streamings:** pílulas arredondadas com o logo (do TMDB) e o nome. Quando ligada, a pílula tem borda `accent`, fundo dourado escuro e um "✓". No celular, a linha rola na horizontal em vez de quebrar.
- **Tipo e ordenação:** grupo de botões lado a lado (segmented control). A opção ativa tem fundo `accent`.
- **Gênero:** lista suspensa com o estilo `surface`.
- **Card do título:** capa em proporção 2:3, cantos de 12px, sombra suave, degradê escuro na base e a nota (★ 7.8) num selo no canto superior direito. Abaixo ficam o título e "ano · gênero". Ao passar o mouse, a capa sobe 4px.
- **Paginação:** "Anterior" e "Próxima", com a página atual no centro. O botão principal usa `accent`, e o botão sem ação fica com opacidade reduzida.
- **Rodapé:** logo do TMDB, mais o texto de atribuição e o crédito da JustWatch, na cor `muted`.

**Grade responsiva:** 6 colunas acima de 1100px, 4 colunas de 641px a 1100px e 2 colunas até 640px. As margens laterais são de 32px no computador e 16px no celular.

**Página de detalhes:** segue a mesma paleta e os mesmos componentes. O backdrop aparece no topo com um degradê para `bg`, e a capa e as informações ficam sobrepostas. Não foi feito mockup dela; ela segue as regras desta seção.
