import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { useGetSpeciesDetails } from "../features/species/hooks/useGetSpeciesDetails";
import { CatalogHeader } from "../components/CatalogHeader";
import type { ArticleContent, ArticleImage } from "../features/article/article.api";

export const speciesViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/especies/$id",
  component: SpeciesViewPage,
});

function SpeciesViewPage() {
  const { id } = speciesViewRoute.useParams();
  const { data: species, isLoading, error } = useGetSpeciesDetails(Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <CatalogHeader />
        <div className="flex items-center justify-center h-64 text-neutral-400 text-sm">
          Carregando...
        </div>
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="min-h-screen">
        <CatalogHeader />
        <div className="flex items-center justify-center h-64 text-neutral-400 text-sm">
          Espécie não encontrada.
        </div>
      </div>
    );
  }

  const scientificName = species.taxonomyPath.at(-1)?.labelValue ?? "Espécie";
  const popularName = species.popularNames[0]?.name;
  const content = species.article?.content as ArticleContent | null;
  const sections = content?.sections ?? [];
  const sources = content?.sources ?? [];
  const [heroImage, ...thumbnails] = species.images;

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader />

      {/* Hero */}
      <section className="bg-[#e8f2d0] flex overflow-hidden">
        {/* Names + breadcrumb */}
        <div className="flex-1 flex flex-col justify-end px-12 py-10 min-w-0">
          <Breadcrumb nodes={species.taxonomyPath} />
          <h1 className="text-5xl font-bold italic text-neutral-900 mt-6 leading-tight">
            {scientificName}
          </h1>
          {popularName && (
            <p className="text-lg text-neutral-600 mt-1">{popularName}</p>
          )}
        </div>

        {/* Main image */}
        <HeroImage image={heroImage} alt={scientificName} />

        {/* Thumbnail gallery */}
        {thumbnails.length > 0 && (
          <div className="flex flex-col w-24 shrink-0">
            {thumbnails.slice(0, 4).map((img) => (
              <ThumbnailImage key={img.id} image={img} alt={img.alt ?? scientificName} />
            ))}
          </div>
        )}
      </section>

      {/* Content */}
      <div className="flex gap-10 px-10 py-10 max-w-screen-xl mx-auto">
        {/* Table of contents */}
        {sections.length > 0 && (
          <aside className="w-44 shrink-0">
            <p className="text-sm font-semibold text-primary mb-3">
              Tabela de conteúdo
            </p>
            <ul className="space-y-1.5 text-sm text-neutral-600">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:text-neutral-900 hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
              {sources.length > 0 && (
                <li>
                  <a href="#fontes" className="hover:text-neutral-900 hover:underline">
                    Fontes
                  </a>
                </li>
              )}
            </ul>
          </aside>
        )}

        {/* Article */}
        <article className="flex-1 min-w-0">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-10">
              <h2 className="text-xl font-semibold text-primary mb-4">
                {section.title}
              </h2>
              <p className="text-sm text-neutral-700 leading-relaxed text-justify">
                {section.content}
              </p>
            </section>
          ))}

          {sources.length > 0 && (
            <section id="fontes" className="mb-10">
              <h2 className="text-xl font-semibold text-primary mb-4">Fontes</h2>
              <ol className="space-y-2 text-sm text-neutral-700">
                {sources.map((source, i) => (
                  <li key={i}>
                    [{i + 1}] {source.label}:{" "}
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
          )}
        </article>

        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <p className="text-sm font-semibold text-primary mb-3">
            Distribuição de população
          </p>
          <div className="w-full aspect-square bg-neutral-100 rounded flex items-center justify-center text-neutral-400 text-xs mb-6">
            Mapa indisponível
          </div>

          {species.attributes.length > 0 && (
            <ul className="space-y-2">
              {species.attributes.map((attr, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-primary font-medium">{attr.label}</span>
                  <span className="text-neutral-600">
                    {attr.value}
                    {attr.unit === "meter" ? "m" : attr.unit === "minute" ? "min" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

function Breadcrumb({ nodes }: { nodes: Array<{ id: number; labelValue: string }> }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-neutral-600 flex-wrap">
      {nodes.map((node, i) => (
        <span key={node.id} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-400">&gt;</span>}
          <span className="underline">{node.labelValue}</span>
        </span>
      ))}
    </nav>
  );
}

function HeroImage({ image, alt }: { image: ArticleImage | undefined; alt: string }) {
  if (!image) {
    return (
      <div className="w-[500px] h-[320px] shrink-0 bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
        Sem imagem
      </div>
    );
  }
  return (
    <img
      src={image.url}
      alt={image.alt ?? alt}
      className="w-[500px] h-[320px] shrink-0 object-cover"
    />
  );
}

function ThumbnailImage({ image, alt }: { image: ArticleImage; alt: string }) {
  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <img
        src={image.url}
        alt={image.alt ?? alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
