# Índice de pendências

Documentação de investigação (sem implementação) para os itens pedidos em 2026-11-03. Cada arquivo tem status, arquivos a editar e anotações técnicas.

| # | Arquivo | Resumo | Status |
|---|---|---|---|
| 01 | [01-filtro-exposicao-busca.md](01-filtro-exposicao-busca.md) | Filtro por exposição (húmida/seca) na página de busca | Pendente — decisão sobre espécie sem specimens |
| 02 | [02-citacao-inline-bug.md](02-citacao-inline-bug.md) | Citação inline não renderiza e contagem errada (~200) | Pendente — causa raiz confirmada (seed sem wrapper `[cite:]`) |
| 03 | [03-largura-fixa-secoes-artigo.md](03-largura-fixa-secoes-artigo.md) | Largura fixa das seções do artigo | Pendente — causa raiz confirmada ("bloco de amostra" = defaults TOC/Fontes/Propriedades desligados são removidos do array ao salvar) |
| 04 | [04-drag-drop-dentro-fora-coluna.md](04-drag-drop-dentro-fora-coluna.md) | Drag and drop para dentro/fora de bloco de coluna | Pendente — requer redesenho de modelo de dados do editor |
| 05 | [05-unidades-atributos-em-ingles.md](05-unidades-atributos-em-ingles.md) | Unidades de atributos em inglês | Pendente — decisão entre migrar dados vs. dicionário de tradução |
| 06 | [06-busca-tabelas-admin.md](06-busca-tabelas-admin.md) | Busca nas tabelas admin (specimens, atributos, imagens) | Pendente — specimens só falta frontend; atributos/imagens falta backend+frontend |
| 07 | [07-busca-modal-adicionar-atributo.md](07-busca-modal-adicionar-atributo.md) | Busca no modal de adicionar atributo à espécie | Pendente — filtro client-side, sem mudança de backend |
| 08 | [08-bug-textfield-sugestoes-modal-criar-atributo.md](08-bug-textfield-sugestoes-modal-criar-atributo.md) | Textfield com sugestões não funciona dentro de Dialog | Pendente — causa provável: pointer-events do Radix Dialog |
| 09 | [09-remover-botao-criar-textfield-sugestao.md](09-remover-botao-criar-textfield-sugestao.md) | Remover botão "+ Criar" do textfield com sugestões | Pendente — atenção ao fluxo de criação de nível na árvore |
| 10 | [10-busca-atributos-500-e-lista-scroll.md](10-busca-atributos-500-e-lista-scroll.md) | Busca por atributos retorna 500 + lista sem scroll/busca | Pendente — causa raiz confirmada (CAST numérico em valor não numérico) |
| 11 | [11-toggle-colapsar-abrir-tudo-arvore.md](11-toggle-colapsar-abrir-tudo-arvore.md) | Toggle colapsar/abrir tudo na árvore taxonômica (Admin) | Pendente — estado já centralizado, implementação direta |
| 12 | [12-clique-barra-colapsa-nivel-arvore.md](12-clique-barra-colapsa-nivel-arvore.md) | Clicar na barra do nível colapsa/abre (remover onClick do chevron) | Pendente — há componente de referência no próprio arquivo |
| 13 | [13-zoom-visualizador-imagem.md](13-zoom-visualizador-imagem.md) | Zoom no visualizador de imagem | Pendente — precisa decisão de produto (gatilho, pan, lib vs. implementação própria) |

Nenhum destes itens foi implementado — apenas investigado e documentado, por pedido explícito do usuário.
