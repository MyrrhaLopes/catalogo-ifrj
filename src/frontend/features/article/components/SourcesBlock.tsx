import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import { parseSources } from "./utils";

export function SourcesBlock({ content }: { content: ArticleContent }) {
  const sources = parseSources(content);

  if (sources.length === 0) return null;

  return (
    <section id="fontes" className="mb-10">
      <h2 className="text-xl font-semibold text-primary mb-4">Fontes</h2>
      <ol className="space-y-2 text-sm text-neutral-700">
        {sources.map((source) => (
          <li key={source.index}>
            [{source.index}] {source.label}:{" "}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline break-all hover:text-neutral-900"
            >
              {source.url}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
