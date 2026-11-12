import type { ReactNode } from "react";
import { slugify, parseInlineFormatting } from "./utils";

function renderInlineTokens(text: string, sourcesMap?: Map<number, number>): ReactNode[] {
  return parseInlineFormatting(text).map((token, i) => {
    switch (token.type) {
      case "text":
        return token.value;
      case "bold":
        return <strong key={i}>{token.value}</strong>;
      case "italic":
        return <em key={i}>{token.value}</em>;
      case "cite": {
        // Mapa de fontes ainda não carregado: mantém o marcador cru visível
        // em vez de resolver um número de citação incorreto.
        if (!sourcesMap) return `[cite:${token.id}]`;
        const n = sourcesMap.get(token.id);
        if (n !== undefined) {
          return (
            <sup key={i}>
              <a href={`#source-${n}`} className="text-primary hover:underline text-[10px] font-medium">
                {n}
              </a>
            </sup>
          );
        }
        // Citação referencia uma fonte inexistente no mapa (ex: sourceKey incorreto
        // no seed) — não descarta silenciosamente, mostra um marcador visível para
        // facilitar detectar o problema em revisão de conteúdo.
        return (
          <sup key={i} className="text-destructive text-[10px] font-medium" title="Citação sem fonte correspondente">
            [?]
          </sup>
        );
      }
    }
  });
}

type Props = {
  content: string;
  sourcesMap?: Map<number, number>;
};

export function TextBlock({ content, sourcesMap }: Props) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  const currentParagraph: string[] = [];

  function flushParagraph(key: string) {
    if (currentParagraph.length === 0) return;
    const raw = currentParagraph.join(" ");
    currentParagraph.length = 0;
    const nodes = renderInlineTokens(raw, sourcesMap);
    elements.push(
      <p key={key} className="text-sm text-neutral-700 leading-relaxed text-justify mb-4 md:text-base tv:text-lg tv:leading-loose">
        {nodes}
      </p>,
    );
  }

  lines.forEach((line, i) => {
    const headingMatch = line.match(/^(#{1,6}) (.+)$/);
    if (headingMatch) {
      flushParagraph(`p-${i}`);
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const id = slugify(text);

      if (level === 1) {
        elements.push(
          <h2 key={i} id={id} className="text-xl font-semibold text-primary mt-6 mb-4 tv:text-2xl">
            {text}
          </h2>,
        );
      } else if (level === 2) {
        elements.push(
          <h3 key={i} id={id} className="text-lg font-semibold text-primary mt-5 mb-3 tv:text-xl">
            {text}
          </h3>,
        );
      } else {
        elements.push(
          <h4 key={i} id={id} className="text-base font-semibold text-primary mt-4 mb-2 tv:text-lg">
            {text}
          </h4>,
        );
      }
    } else if (line.trim() === "") {
      flushParagraph(`p-${i}`);
    } else {
      currentParagraph.push(line);
    }
  });
  flushParagraph("p-end");

  return <>{elements}</>;
}
