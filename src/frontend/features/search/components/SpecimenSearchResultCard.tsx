import { Link } from "@tanstack/react-router";
import { Archive } from "lucide-react";
import type { Specimen } from "@/frontend/features/specimens/specimen.api";

type Props = {
  specimen: Specimen;
};

export function SpecimenSearchResultCard({ specimen }: Props) {
  const content = (
    <div className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
        <Archive size={24} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-neutral-900">{specimen.code}</p>
        <div className="mt-1 flex gap-3 text-sm text-neutral-500">
          {specimen.lot != null && <span>Lote {specimen.lot}</span>}
          {specimen.shelf != null && <span>Prateleira {specimen.shelf}</span>}
        </div>
        {specimen.linkedSpeciesId != null && (
          <p className="mt-1 text-xs text-neutral-400">
            Espécie #{specimen.linkedSpeciesId}
          </p>
        )}
      </div>

      <div className="shrink-0 self-center">
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
          Espécime
        </span>
      </div>
    </div>
  );

  if (specimen.linkedSpeciesId != null) {
    return (
      <Link to="/especies/$id" params={{ id: String(specimen.linkedSpeciesId) }}>
        {content}
      </Link>
    );
  }

  return content;
}
