import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type SpecimenOption = {
  id: number;
  code: string;
  exposicao: "humida" | "seca";
  lot: number | null;
  shelf: number | null;
};

type Props = {
  specimens: SpecimenOption[];
  value: number | "";
  onChange: (id: number) => void;
};

function specimenTitle(specimen: SpecimenOption) {
  let title = `${specimen.code} (${specimen.exposicao === "seca" ? "seca" : "húmida"})`;
  if (specimen.shelf != null) title += ` · Prat. ${specimen.shelf}`;
  if (specimen.lot != null) title += ` · Lote ${specimen.lot}`;
  return title;
}

// Pré-seleciona o primeiro espécime da lista, exibindo os demais ao lado
// para troca rápida — evita obrigar o usuário a abrir um select.
export function SpecimenPicker({ specimens, value, onChange }: Props) {
  useEffect(() => {
    if (specimens.length > 0 && !specimens.some((specimen) => specimen.id === value)) {
      onChange(specimens[0].id);
    }
  }, [specimens, value, onChange]);

  if (specimens.length === 0) {
    return <p className="text-xs text-muted-foreground">Nenhum espécime vinculado a esta espécie.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {specimens.map((specimen) => (
        <button
          key={specimen.id}
          type="button"
          title={specimenTitle(specimen)}
          onClick={() => onChange(specimen.id)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            value === specimen.id
              ? "border-green-700 bg-green-50 text-green-800"
              : "border-input text-neutral-600 hover:border-neutral-400",
          )}
        >
          {specimen.code}
        </button>
      ))}
    </div>
  );
}
