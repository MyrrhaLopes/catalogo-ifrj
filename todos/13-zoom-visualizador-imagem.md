# 13 — Zoom no visualizador de imagem

## Status
Pendente (não implementado — apenas documentado).

## Pedido original
Adicionar ao visualizador de imagem (o que aparece ao clicar em uma imagem) a feature de zoom.

## Componente principal
- `src/frontend/features/images/components/ImageViewer.tsx` — componente `ImageViewer`, usado como um "dialog" fullscreen (`role="dialog"`, L396) com painel escuro de imagem à esquerda e painel de detalhes à direita.
  - A imagem atual é renderizada em uma faixa horizontal com scroll-snap (`scrollRef`, L420-448), uma `<img>` por imagem (`max-h-full max-w-full object-contain`, L430-435), permitindo trocar de imagem arrastando/scrollando horizontalmente ou pelos botões de seta (`hasPrev`/`hasNext`, L450-467) e pela tira de miniaturas (L471-493).
  - Navegação por teclado já existe: `ArrowLeft`/`ArrowRight` trocam de imagem, `Escape` fecha (`useImageViewerNavigation`, L53-62).
  - Não há nenhuma lógica de zoom hoje — a imagem é sempre renderizada em `object-contain`, sem escala ajustável nem pan.

## Pontos de uso (onde o componente é chamado)
- `src/frontend/pages/GalleryPage.tsx` (L242) — página de galeria.
- `src/frontend/pages/SpeciesViewPage.tsx` (L399) — artigo da espécie.
- `src/frontend/features/species/components/SpeciesHero.tsx` (L110) — hero da espécie.

Como o estado de zoom deve ser interno ao próprio `ImageViewer` (reset ao trocar de imagem/fechar), **não deve ser necessário alterar os 3 pontos de uso** — a prop pública do componente não muda.

## Arquivos a serem editados
- `src/frontend/features/images/components/ImageViewer.tsx`
  - Área da imagem atual (L420-448): precisa de lógica de zoom (escala) e pan (arrastar quando ampliada).
  - `useImageViewerNavigation` (L32-93): a navegação horizontal por scroll/swipe hoje assume que arrastar sempre troca de imagem (`handleScroll`, L81-90, e o listener de teclado de setas, L55-58). **Precisa decidir como esses dois gestos coexistem**: com zoom ativo, arrastar deveria fazer pan dentro da imagem, não mudar de foto; as setas do teclado deveriam pausar enquanto há zoom, ou continuar trocando de imagem (resetando o zoom).
  - Thumbnails/botões de seta (L450-493) — devem continuar funcionando, provavelmente resetando o zoom ao trocar de imagem.

## Decisões de produto a confirmar com o usuário antes de implementar
1. **Gatilho do zoom:** scroll do mouse (wheel) sobre a imagem, duplo clique, pinça (touch), ou um botão de zoom +/- na barra superior? Produtos parecidos (Google Fotos, Lightbox) costumam combinar wheel + pinça + duplo clique.
2. **Comportamento do pan:** quando ampliada, arrastar deve mover a imagem (pan) em vez de trocar de foto — isso entra em conflito direto com o scroll-snap horizontal usado hoje para navegar entre imagens (`scrollRef`). É necessário desabilitar a navegação por arraste enquanto o zoom estiver ativo, ou usar um gesto diferente (ex: arrastar com dois dedos / botão do meio) para não confundir com a troca de imagem.
3. **Reset do zoom:** ao navegar para a próxima/anterior imagem (seta, teclado, miniatura), o zoom deve resetar automaticamente — confirmar que esse é o comportamento esperado.
4. **Biblioteca vs. implementação própria:** o projeto **não tem** nenhuma biblioteca de zoom/pan instalada hoje (`package.json` não lista nada como `react-zoom-pan-pinch`, `panzoom` etc.). Decidir entre:
   - Implementar zoom/pan manualmente com CSS `transform: scale()`/`translate()` e handlers de wheel/touch/drag;
   - Adicionar uma biblioteca dedicada (ex: `react-zoom-pan-pinch`), que já lida com pinça, wheel e limites de pan/zoom de forma mais robusta.

## Anotações
- Qualquer solução deve continuar funcionando dentro do layout atual (`fixed inset-0 z-50 flex flex-col md:flex-row`, painel de imagem com `md:w-[68%]`), sem quebrar o painel de detalhes à direita (`ImageViewerDetails`, L341-380) nem a tira de miniaturas.
- Mobile: o visualizador já é usado em telas pequenas (painel vira coluna, `md:flex-row`); o gesto de zoom por pinça (touch) é especialmente relevante nesse caso.
