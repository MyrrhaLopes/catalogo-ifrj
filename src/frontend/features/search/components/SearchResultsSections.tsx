import { SpeciesSearchResultCard } from "./SpeciesSearchResultCard";
import { SpecimenSearchResultCard } from "./SpecimenSearchResultCard";
import type { useSearchSpecies } from "@/frontend/features/species/hooks/useSearchSpecies";
import type { useSearchSpecimens } from "@/frontend/features/specimens/hooks/useSearchSpecimens";

export type SearchIn = "species" | "specimen" | "both";

type SpeciesList = NonNullable<ReturnType<typeof useSearchSpecies>["data"]>["species"];
type SpecimenList = NonNullable<ReturnType<typeof useSearchSpecimens>["data"]>["specimens"];

const SECTION_HEADING_CLASS = "mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500";

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        className="rounded-md border border-neutral-200 px-3 py-1 text-sm disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <span className="text-sm text-neutral-600">
        {page} / {totalPages}
      </span>
      <button
        className="rounded-md border border-neutral-200 px-3 py-1 text-sm disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </button>
    </div>
  );
}

function SpeciesEmptyState({ q }: { q: string }) {
  return (
    <p className="text-sm text-neutral-400">
      {q ? `Nenhuma espécie para "${q}".` : "Nenhuma espécie encontrada."}
    </p>
  );
}

function ResultsSummary({ total }: { total: number }) {
  return (
    <div className="mb-4 text-xs text-neutral-500">
      {total} {total === 1 ? "resultado" : "resultados"}
    </div>
  );
}

type SpeciesResultsSectionProps = {
  searchIn: SearchIn;
  speciesTotal: number;
  species: SpeciesList | undefined;
  q: string;
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

type SpeciesResultsListProps = {
  species: SpeciesList;
  q: string;
  showSummary: boolean;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

function SpeciesResultsList({
  species,
  q,
  showSummary,
  total,
  page,
  totalPages,
  onPageChange,
}: SpeciesResultsListProps) {
  return (
    <>
      {showSummary && <ResultsSummary total={total} />}
      <div className="space-y-3">
        {species.map((s) => (
          <SpeciesSearchResultCard key={s.id} species={s} query={q} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}

function SpeciesHeading({ isBoth, total }: { isBoth: boolean; total: number }) {
  if (!isBoth) return null;
  return <h3 className={SECTION_HEADING_CLASS}>Espécies ({total})</h3>;
}

function SpeciesResultsBody(props: SpeciesResultsSectionProps) {
  const { species, q, searchIn, speciesTotal, page, totalPages, onPageChange } = props;
  if (!species || species.length === 0) {
    return <SpeciesEmptyState q={q} />;
  }

  return (
    <SpeciesResultsList
      species={species}
      q={q}
      showSummary={searchIn === "species"}
      total={speciesTotal}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
}

export function SpeciesResultsSection(props: SpeciesResultsSectionProps) {
  const isBoth = props.searchIn === "both";

  return (
    <section className={isBoth ? "mb-8" : ""}>
      <SpeciesHeading isBoth={isBoth} total={props.speciesTotal} />
      <SpeciesResultsBody {...props} />
    </section>
  );
}

export function SpecimenResultsSection({
  searchIn,
  specimensList,
  q,
}: {
  searchIn: SearchIn;
  specimensList: SpecimenList;
  q: string;
}) {
  return (
    <section>
      {searchIn === "both" && (
        <h3 className={SECTION_HEADING_CLASS}>Espécimes ({specimensList.length})</h3>
      )}
      {specimensList.length === 0 ? (
        <p className="text-sm text-neutral-400">
          {q ? `Nenhum espécime para "${q}".` : "Digite um código para buscar espécimes."}
        </p>
      ) : (
        <div className="space-y-3">
          {specimensList.map((s) => (
            <SpecimenSearchResultCard key={s.id} specimen={s} />
          ))}
        </div>
      )}
    </section>
  );
}
