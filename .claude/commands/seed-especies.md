Gera um seed completo de espécies a partir de uma planilha xlsx, orquestrando um agente de pesquisa por espécie (taxonomia, atributos, imagens e citações), e consolida tudo num único script `.ts` no padrão de `src/backend/db/seed.ts`.

## Argumento

$ARGUMENTS deve ser o caminho do arquivo `.xlsx` com a lista de espécies.

Se o argumento estiver ausente, pergunte o caminho do arquivo antes de continuar.

---

## Planilha de entrada — colunas esperadas

| Coluna             | Obrigatório | Descrição                                                        |
|---------------------|-------------|--------------------------------------------------------------------|
| `nome_cientifico`   | sim         | Binômio a ser pesquisado (ex: `Thalassoma bifasciatum`)           |
| `code`              | sim         | Código do espécime físico (vai para `specimens.code`)             |
| `lot`               | sim         | Lote (vai para `specimens.lot`)                                   |
| `shelf`             | sim         | Prateleira (vai para `specimens.shelf`)                           |
| `nome_popular`      | não         | Dica de nome popular; a pesquisa deve confirmar/complementar      |

Use a skill `xlsx` para ler a planilha. Se faltar alguma coluna obrigatória em alguma linha, pare e avise o usuário em vez de inventar valores — `code`/`lot`/`shelf` nunca são pesquisados, só vêm da planilha.

Antes de prosseguir, valide que não há `code` duplicado entre linhas (cada espécime físico deve ser único).

---

## Visão geral do fluxo

1. Ler a planilha → lista de `{ nomeCientifico, code, lot, shelf, nomePopularDica? }`.
2. Para cada linha, spawnar um agente de pesquisa independente (`general-purpose`, em paralelo, em lotes de até 6) que segue o **protocolo de pesquisa** abaixo e devolve o **JSON de retorno** no formato exato especificado.
3. Validar cada JSON retornado contra o checklist de qualidade.
4. Consolidar todos os JSONs num único script `src/backend/db/seeds/<slug-do-lote>.ts`, deduplicando taxonomia compartilhada, fontes e templates de atributo, seguindo exatamente as convenções de `src/backend/db/seed.ts`.
5. Rodar `npx tsc --noEmit`. Reportar como executar o seed e quais passos manuais faltam.

Não edite `src/backend/db/seed.ts` diretamente — ele é o seed de demonstração. Gere um arquivo novo em `src/backend/db/seeds/` (crie a pasta se não existir).

---

## Passo 1 — Spawnar os agentes de pesquisa

Para cada linha da planilha, use a ferramenta Agent com `subagent_type: "general-purpose"` (agente fresco, sem contexto prévio — o prompt precisa ser autocontido). Dispare os agentes de um mesmo lote numa única mensagem, em paralelo (até ~6 por vez, para não sobrecarregar).

Preencha o template abaixo substituindo `{{NOME_CIENTIFICO}}`, `{{CODE}}`, `{{LOT}}`, `{{SHELF}}` e `{{NOME_POPULAR_DICA}}` (omita a linha da dica se não houver):

```
Você é um agente de pesquisa zoológica/botânica para o catálogo de espécimes do IFRJ. Pesquise a espécie "{{NOME_CIENTIFICO}}" e devolva APENAS o JSON descrito abaixo — sem texto antes ou depois.

Dados já conhecidos do espécime físico (NÃO pesquise isso, apenas reproduza nos campos pedidos):
- code: "{{CODE}}"
- lot: {{LOT}}
- shelf: {{SHELF}}
- dica de nome popular (opcional, confirme ou substitua se a pesquisa indicar outro mais correto): "{{NOME_POPULAR_DICA}}"

Se as ferramentas WebSearch/WebFetch não estiverem carregadas, use ToolSearch("select:WebSearch,WebFetch") antes de pesquisar.

## Protocolo de pesquisa (siga todos os passos)

1. **Taxonomia completa.** Pesquise a hierarquia do Reino até a Espécie (Reino, Filo, Classe, Ordem, Família, Gênero, Espécie) em fontes taxonômicas confiáveis (WoRMS, ITIS, Catalogue of Life, GBIF, ou a base de referência do grupo — ex. FishBase para peixes, AmphibiaWeb para anfíbios, Reptile Database para reptéis, IOC World Bird List para aves). Cada nível vira `{ label, labelValue }`, onde `label` é o nome em português do nível ("Reino", "Filo", "Classe", "Ordem", "Família", "Gênero", "Espécie") e `labelValue` é o nome científico daquele nível em minúsculas (ex: `"chordata"`, `"actinopterygii"`, `"thalassoma"`, `"bifasciatum"`). Confirme o nome científico válido atual (sinônimos/nomes desatualizados devem ser resolvidos para o nome aceito).

2. **Nomes populares.** Levante nomes populares em português do Brasil e no idioma de origem/inglês. Cada um é `{ name, origin }` (origin = código de idioma, ex: `"pt-BR"`, `"en"`).

3. **Atributos mensuráveis.** Levante 3 a 6 atributos numéricos relevantes (ex: comprimento máximo, peso máximo, profundidade de habitat, longevidade, envergadura — o que fizer sentido para o grupo). Cada atributo É OBRIGATORIAMENTE amarrado a UMA fonte específica que comprove aquele valor (não vale citar a fonte genérica da espécie se ela não afirma aquele número). Use nomes de unidade em inglês, minúsculo, singular (ex: `"meter"`, `"centimeter"`, `"kilogram"`, `"gram"`, `"year"`).

4. **Imagens.** Busque 2 a 4 imagens de licença aberta (prioridade: Wikimedia Commons; aceitável: GBIF, iNaturalist com licença CC, bases oficiais de conservação). NUNCA invente uma URL — só use URLs que você de fato encontrou. Para cada imagem registre: `url` (direta para o arquivo de imagem, não a página HTML), `alt` (descrição em português), `source` (domínio/site de origem, ex: `"commons.wikimedia.org"`), `credit` (autor e licença, ex: `"Foto: Jane Doe, CC BY-SA 3.0"`). Todas as imagens desta pesquisa são `type: "online"` — nunca produza `type: "acervo"` (isso é reservado para fotos físicas do acervo do IFRJ, fora do seu escopo).

5. **Fontes.** Toda URL usada nos passos 1, 3, 4 ou citada no artigo (passo 6) entra na lista `sources`, cada uma com uma `key` curta e legível (kebab-case, ex: `"fishbase"`, `"iucn-redlist"`, `"worms"`) usada só dentro deste JSON para referenciar a fonte sem precisar saber o ID real do banco ainda.

6. **Artigo.** Escreva o conteúdo do artigo no formato jsonb usado pelo catálogo:
   ```
   {
     "sections": {
       "left": ["TOC"],
       "center": [ <blocos>, "SOURCES" ],
       "right": ["PROPERTIES"]
     }
   }
   ```
   Tipos de bloco válidos em `center`:
   - `{ "type": "text", "content": "# Título\n\nMarkdown simples (negrito/itálico ok). Toda afirmação factual relevante termina com [cite:KEY], onde KEY é uma das `sources[].key`." }`
   - `{ "type": "image", "content": "<url de uma das imagens listadas>" }`
   - `{ "type": "column", "columns": [ [ <blocos text/image>, ... ], [ <blocos text/image>, ... ] ] }` (duas colunas lado a lado, útil para imagem+legenda)
   - A string literal `"SOURCES"` (sempre o último item de `center`) e `"TOC"`/`"PROPERTIES"` nos outros arrays são marcadores fixos do renderizador — não são objetos, não altere.
   Escreva ao menos as seções `# Morfologia`, `# Distribuição Geográfica` e `# Conservação` (inclua `# Comportamento` se houver informação relevante). Use *Itálico* para o nome científico.

## JSON de retorno (formato exato — devolva só isto)

{
  "nomeCientifico": "{{NOME_CIENTIFICO}}",
  "specimen": { "code": "{{CODE}}", "lot": {{LOT}}, "shelf": {{SHELF}} },
  "taxonomy": [
    { "label": "Reino", "labelValue": "..." },
    { "label": "Filo", "labelValue": "..." },
    { "label": "Classe", "labelValue": "..." },
    { "label": "Ordem", "labelValue": "..." },
    { "label": "Família", "labelValue": "..." },
    { "label": "Gênero", "labelValue": "..." },
    { "label": "Espécie", "labelValue": "..." }
  ],
  "popularNames": [ { "name": "...", "origin": "pt-BR" } ],
  "sources": [ { "key": "...", "url": "..." } ],
  "attributes": [ { "label": "...", "unit": "...", "value": "...", "sourceKey": "..." } ],
  "images": [ { "url": "...", "alt": "...", "source": "...", "credit": "..." } ],
  "article": { "sections": { "left": ["TOC"], "center": [ ... ], "right": ["PROPERTIES"] } }
}
```

---

## Passo 2 — Validar os retornos

Antes de consolidar, rejeite (e re-rode a pesquisa daquela espécie, ajustando o prompt com o que faltou) qualquer retorno que:

- Não tenha os 7 níveis de taxonomia preenchidos.
- Tenha algum `attributes[].sourceKey` que não exista em `sources[].key`.
- Tenha algum `[cite:KEY]` no texto do artigo cuja `KEY` não exista em `sources[].key`.
- Tenha menos de 2 imagens, ou alguma imagem sem `source`/`credit`.
- Tenha `specimen.code/lot/shelf` diferente do que veio da planilha (o agente não pode alterar esses valores).

---

## Passo 3 — Consolidar no seed final

Gere `src/backend/db/seeds/<slug-do-lote>.ts` (ex: `seed-peixes-recife-2026-10.ts`) espelhando a estrutura de `src/backend/db/seed.ts`:

1. **Usuário**: reuse o padrão de `usersTable` com `.onConflictDoNothing().returning()` + fallback de `select` se já existir (mesmo usuário seed, mesmo e-mail), do jeito que `seed.ts` já faz.

2. **Taxonomia deduplicada.** Construa um mapa `taxonPath -> id` (chave = labelValues concatenados do Reino até aquele nível, ex: `"animalia>chordata>actinopterygii>perciformes>labridae>thalassoma"`). Percorra as espécies em ordem; para cada nível, se o caminho até ali já existe no mapa, reuse o id; senão, insira (igual ao loop `for (const t of sharedTaxa)` de `seed.ts`) encadeando o `parent`. O nó raiz (Reino) usa o truque de auto-referência via SQL cru (`WITH seq AS (SELECT nextval(...))`) só na primeira vez que aquele `labelValue` de Reino aparecer — reaproveite o id nas espécies seguintes do mesmo reino.

3. **Fontes deduplicadas por URL.** Mantenha um mapa global `url -> id`. Para cada fonte nova, insira com `.onConflictDoNothing().returning()` e, se vier vazio (já existia), faça `select` por `url` — mesmo padrão do usuário em `seed.ts` (a tabela `sources` tem `unique` em `url`).

4. **Templates de atributo deduplicados por `(label, unit)`.** Mantenha um mapa `"label|unit" -> id`. Antes de inserir um novo `attributeTemplateTable`, verifique se já existe no mapa (de uma espécie anterior do lote) ou já existe no banco (`select` por label+unit); só insira se realmente for novo.

5. **Por espécie**: insira `speciesTable` (apontando pro nó de taxonomia "Espécie"), `popularNameTable` + pivot, `attributeTable` (com o `sourceId` real já resolvido pelo mapa de fontes), `articleTable`, `imageTable` (todas com `article: <id>` e `type: "online"`), `articleSourcesPivotTable` (todas as fontes usadas naquele artigo/atributos) e `specimenTable` (code/lot/shelf vindos direto da planilha, sem alteração).

6. **Citações no artigo**: como no `buildFullArticleContent` de `seed.ts`, escreva o conteúdo do artigo como uma função que recebe os ids reais das fontes e interpola via template string — ex. `function buildArticleContent_<slug>(sourceIds: Record<string, number>) { return { sections: { ... \`...[cite:${sourceIds.fishbase}]\` ... } } }` — chamada só depois que as fontes daquela espécie já foram inseridas/resolvidas. Troque cada `[cite:KEY]` do JSON de pesquisa pelo `${sourceIds.KEY}` correspondente.

7. Ao final, dê um `console.log` resumindo o que foi inserido (ids de species/specimens/sources), igual ao `seed.ts` original.

---

## Passo 4 — Finalização

1. Rode `npx tsc --noEmit` e corrija qualquer erro de tipagem antes de considerar a tarefa concluída.
2. Informe ao usuário o comando para rodar o seed: `npx tsx --env-file=.env src/backend/db/seeds/<arquivo>.ts`.
3. Avise que isso **não** é registrado automaticamente em `package.json` — se quiser um script `db:seed:especies`, é um passo manual.
4. Não rode o seed contra o banco automaticamente — isso grava dados reais; só execute se o usuário pedir explicitamente.

---

## Erros comuns a evitar

- Inventar uma URL de imagem ou de fonte que não foi de fato encontrada na pesquisa.
- Citar uma fonte genérica da espécie para justificar um número específico que ela não contém.
- Duplicar um galho de taxonomia (ex: inserir "Perciformes" duas vezes) quando duas espécies do lote compartilham ancestrais.
- Misturar `type: "acervo"` em imagens de pesquisa — isso é só para fotos físicas do IFRJ.
- Deixar `code`/`lot`/`shelf` serem "ajustados" pela pesquisa — eles vêm só da planilha.
- Editar `src/backend/db/seed.ts` em vez de criar um arquivo novo em `src/backend/db/seeds/`.
