import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { useGetSpeciesDetails } from "../features/species/hooks/useGetSpeciesDetails";
import { CatalogHeader } from "../components/CatalogHeader";
import type { ArticleImage } from "../features/article/article.api";
import { ArticleSectionRenderer } from "../features/article/components/ArticleSectionRenderer";

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

  const lastNode = species.taxonomyPath.at(-1);
  const secondLastNode = species.taxonomyPath.at(-2);
  const scientificName =
    lastNode?.label === "Espécie" && secondLastNode
      ? `${secondLastNode.labelValue} ${lastNode.labelValue}`
      : (lastNode?.labelValue ?? "Espécie");
  const popularName = species.popularNames[0]?.name;
  const content = species.article?.content;
  const [heroImage, ...thumbnails] = species.images;

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader />

      {/* Hero */}
      <section className="bg-[#e8f2d0] flex overflow-hidden">
        <div className="flex-1 flex flex-col justify-end px-12 py-10 min-w-0">
          <Breadcrumb nodes={species.taxonomyPath} />
          <h1 className="text-5xl font-bold italic text-neutral-900 mt-6 leading-tight">
            {scientificName}
          </h1>
          {popularName && (
            <p className="text-lg text-neutral-600 mt-1">{popularName}</p>
          )}
        </div>

        <HeroImage image={heroImage} alt={scientificName} />

        {thumbnails.length > 0 && (
          <div className="flex flex-col w-24 shrink-0">
            {thumbnails.slice(0, 4).map((img) => (
              <ThumbnailImage key={img.id} image={img} alt={img.alt ?? scientificName} />
            ))}
          </div>
        )}
      </section>

      {/* Content */}
      {content && (
        <div className="flex gap-10 px-10 py-10 max-w-screen-xl mx-auto">
          {content.sections.left && (
            <aside className="w-44 shrink-0">
              <ArticleSectionRenderer sectionKey="left" content={content} species={species} />
            </aside>
          )}

          {content.sections.center && (
            <article className="flex-1 min-w-0">
              <ArticleSectionRenderer sectionKey="center" content={content} species={species} />
            </article>
          )}

          {content.sections.right && (
            <aside className="w-52 shrink-0">
              <ArticleSectionRenderer sectionKey="right" content={content} species={species} />
            </aside>
          )}
        </div>
      )}
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
