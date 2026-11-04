# 02 — Citação inline quebrada (render e contagem errada)

## Status
Pendente (não implementado — apenas documentado). **Causa raiz identificada com alta confiança.**

## Pedido original
A visualização da citação inline (o pequeno "1", "2" sobrescrito que linka para a fonte) não está renderizando corretamente, e sua contagem está na casa dos 200, em vez de seguir a quantidade de citações do artigo atual.

## Causa raiz (confirmada no código e no seed)
- A renderização espera o formato `[cite:<id>]` no texto do bloco (`CITE_RE = /\[cite:(\d+)\]/g` em `src/frontend/features/article/components/utils.ts`).
- O arquivo de seed `src/backend/db/seeds/seed-especies-catalogo-2026-10.ts` interpola o **id numérico puro** no texto, sem o wrapper `[cite:...]`, ex: `` `... filo *Porifera* ${sourceIds["wiki-porifera-pt"]}, popularmente ...` `` (L23). O seed cria ~221 fontes (`src_1` a `src_221`), então o número impresso no texto é o **id global da tabela `sources`** — exatamente a faixa "~200" relatada.
- A instrução que gerou esse seed, `.claude/commands/seed-especies.md` (passo 6, ~L135), diz para "trocar cada `[cite:KEY]` pelo `${sourceIds.KEY}` correspondente", mas o exemplo da própria instrução mostra `[cite:${sourceIds.fishbase}]` (mantendo o wrapper) — o seed real tirou o wrapper por engano.
- Como o texto salvo não casa com `CITE_RE`, a citação aparece como número cru no meio do texto (sem `<sup>`, sem link), e `collectInlineCitationIds` não encontra nada — essas fontes também não entram na lista numerada do `SourcesBlock`.

## Arquivos a serem editados

### Correção de dados (provável origem principal do problema)
- `src/backend/db/seeds/seed-especies-catalogo-2026-10.ts` — reenvolver as interpolações de `sourceIds[...]` em `[cite:...]`, ex: trocar `${sourceIds["wiki-porifera-pt"]}` por `[cite:${sourceIds["wiki-porifera-pt"]}]`. Precisa revisar o arquivo inteiro (múltiplas ocorrências).
- `.claude/commands/seed-especies.md` (passo 6, ~L135) — deixar explícito que o wrapper `[cite:...]` deve ser preservado, não só o id.

### Renderização (componentes relevantes, mesmo que a causa seja só de dados)
- `src/frontend/features/article/components/TextBlock.tsx` — parse de `[cite:N]` e render de `<sup><a href="#source-n">`. L17-27: quando `n === undefined`, o marcador é descartado silenciosamente (sem fallback visual) — vale revisar esse comportamento.
- `src/frontend/features/article/components/utils.ts` — `CITE_RE`, `collectInlineCitationIds`, `computeUnifiedSources` (L96-122), `buildSourceMaps`. A numeração local (1..n por artigo) já está correta para conteúdo bem formatado — não precisa mudar a lógica de contagem, só os dados.
- `src/frontend/features/article/components/SourcesBlock.tsx` — lista "Fontes" com `id="source-{index}"`.
- `src/frontend/features/article/components/PropertiesBlock.tsx` — usa `sourceMaps.byUrl` para o `<sup>` dos atributos.
- `src/frontend/features/article/components/ArticleBlockRenderer.tsx` — repassa `byId`/`byUrl` para `TextBlock`/`PropertiesBlock`.
- `src/frontend/pages/SpeciesViewPage.tsx` (L59-85, L107, L141) — `getUnifiedSourceMaps`/`useSpeciesSourceMaps`, usa `species.sources` (vindo do pivot salvo do artigo).
- `src/frontend/features/article/components/editor/TextBlockEditor.tsx` (L66-76) — botão "Citar fonte", já insere corretamente `[cite:${id}]` no editor (o bug é só nos dados do seed, não no editor).
- `src/backend/http/features/article/article.service.ts` — `CITE_RE` (L13), `extractSourceIds` (L39), `syncPivot` (L46), `fetchSources` (L58). `flattenSectionBlocks` (L21) só achata 1 nível de colunas (`item.columns.flat()`), enquanto o frontend (`collectTextBlocks`) é recursivo — caso raro de citação dentro de coluna aninhada ficaria fora do pivot.

## Problemas secundários encontrados (documentar, não implementar)
- **Fontes recém-criadas no editor não aparecem no preview** até salvar: o preview usa `species.sources` (pivot já salvo), então uma fonte criada via `POST /sources` mas ainda não salva fica sem URL no mapa.
- **O editor mostra o id cru do banco** no textarea (ex: `[cite:200]`), o que também contribui para a percepção de "números muito altos".
- Markdown inline (`*itálico*`, `**negrito**`) usado no seed não é processado pelo `TextBlock` — não foi pedido pelo usuário, mas aparece na mesma tela; mencionar caso ele pergunte.

## Anotações
- Antes de corrigir o seed, confirmar com o usuário se o banco de produção/dev já tem esses artigos publicados — se sim, a correção pode precisar de um script de migração de dados além de ajustar o gerador do seed.
