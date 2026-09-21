import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import { collectAllTextBlocks, extractHeadings } from "./utils";

export function TOCBlock({ content }: { content: ArticleContent }) {
  const headings = extractHeadings(collectAllTextBlocks(content));

  if (headings.length === 0) return null;

  return (
    <nav>
      <p className="text-sm font-semibold text-primary mb-3">Tabela de conteúdo</p>
      <ul className="space-y-1.5 text-sm text-neutral-600">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 8}px` }}>
            <a href={`#${h.id}`} className="hover:text-neutral-900 hover:underline">
              {h.text}
            </a>
          </li>
        ))}
        <li>
          <a href="#fontes" className="hover:text-neutral-900 hover:underline">
            Fontes
          </a>
        </li>
      </ul>
    </nav>
  );
}
