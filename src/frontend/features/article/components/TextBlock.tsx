import type { ReactNode } from "react";
import { slugify } from "./utils";

const CITE_RE = /\[cite:(\d+)\]/g;

function parseInlineCitations(text: string, sourcesMap?: Map<number, number>): ReactNode[] {
  if (!sourcesMap) return [text];
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  CITE_RE.lastIndex = 0;
  while ((match = CITE_RE.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const id = Number(match[1]);
    const n = sourcesMap.get(id);
    if (n !== undefined) {
      parts.push(
        <sup key={match.index}>
          <a href={`#source-${n}`} className="text-primary hover:underline text-[10px] font-medium">
            {n}
          </a>
        </sup>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts.length > 0 ? parts : [text];
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
    const nodes = parseInlineCitations(raw, sourcesMap);
    elements.push(
      <p key={key} className="text-sm text-neutral-700 leading-relaxed text-justify mb-4">
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
          <h2 key={i} id={id} className="text-xl font-semibold text-primary mt-6 mb-4">
            {text}
          </h2>,
        );
      } else if (level === 2) {
        elements.push(
          <h3 key={i} id={id} className="text-lg font-semibold text-primary mt-5 mb-3">
            {text}
          </h3>,
        );
      } else {
        elements.push(
          <h4 key={i} id={id} className="text-base font-semibold text-primary mt-4 mb-2">
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
