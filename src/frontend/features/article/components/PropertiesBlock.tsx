import type { SpeciesDetails } from "../../species/species.api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";

type Props = {
  species: SpeciesDetails;
  sourcesMap?: Map<string, number>;
};

export function PropertiesBlock({ species, sourcesMap }: Props) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-md font-semibold text-primary">
          Atributos da espécie
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {species.attributes.length > 0 && (
          <ul className="space-y-2">
            {species.attributes.map((attr, i) => {
              const citationNumber = attr.sourceUrl ? sourcesMap?.get(attr.sourceUrl) : undefined;
              return (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-primary font-medium">{attr.label}</span>
                  <span className="text-neutral-600 relative">
                    {attr.value}
                    {attr.unit === "meter" ? "m" : attr.unit === "minute" ? "min" : ""}
                    {citationNumber !== undefined && (
                      <sup className="ml-0.5">
                        <a
                          href={`#source-${citationNumber}`}
                          className="text-primary hover:underline text-[10px]"
                        >
                          {citationNumber}
                        </a>
                      </sup>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
