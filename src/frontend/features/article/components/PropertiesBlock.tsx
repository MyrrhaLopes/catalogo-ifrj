import type { SpeciesDetails } from "../../species/species.api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";

export function PropertiesBlock({ species }: { species: SpeciesDetails }) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold text-primary">
          Distribuição de população
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="w-full aspect-square bg-neutral-100 rounded flex items-center justify-center text-neutral-400 text-xs mb-4">
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
      </CardContent>
    </Card>
  );
}
