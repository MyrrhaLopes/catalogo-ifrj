import type { ArticleContent } from "@/backend/http/features/article/article.schema";
import type { ArticleSource } from "@/frontend/features/article/article.api";
import { computeUnifiedSources, domainFromUrl } from "./utils";

type Props = {
  content: ArticleContent;
  inlineSources?: ArticleSource[];
  attributeSources?: { url: string }[];
};

export function SourcesBlock({ content, inlineSources = [], attributeSources = [] }: Props) {
  const sources = computeUnifiedSources(content, inlineSources, attributeSources);

  if (sources.length === 0) return null;

  return (
    <section id="fontes" className="mb-10">
      <h2 className="text-xl font-semibold text-primary mb-4">Fontes</h2>
      <ol className="space-y-2 text-sm text-neutral-700">
        {sources.map((source) => (
          <li key={source.index} id={`source-${source.index}`} className="flex gap-2">
            <span className="text-neutral-500 shrink-0">[{source.index}]</span>
            <span>
              {source.label !== domainFromUrl(source.url) ? `${source.label} — ` : ""}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all hover:text-neutral-900"
              >
                {source.url}
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
