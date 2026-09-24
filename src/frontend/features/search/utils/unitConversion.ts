export type DisplayUnit = string;

// Map localized/abbreviated names → canonical key used in conversion tables
const UNIT_ALIAS: Record<string, string> = {
  // Length
  mm: "mm", millimeter: "mm", millimetre: "mm",
  milímetro: "mm", milimetro: "mm", milímetros: "mm", milimetros: "mm",
  cm: "cm", centimeter: "cm", centimetre: "cm",
  centímetro: "cm", centimetro: "cm", centímetros: "cm", centimetros: "cm",
  m: "m", meter: "m", metre: "m", metro: "m", metros: "m",
  km: "km", kilometer: "km", kilometre: "km",
  quilômetro: "km", quilometro: "km", quilómetro: "km",
  quilômetros: "km", quilómetros: "km", quilometros: "km",
  // Time
  s: "s", second: "s", segundo: "s", segundos: "s",
  min: "min", minute: "min", minuto: "min", minutos: "min",
  h: "h", hour: "h", hora: "h", horas: "h",
};

// Conversion factor TO the canonical base of each group (m for length, min for time)
const LENGTH_FACTORS: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000 };
const TIME_FACTORS: Record<string, number> = { s: 1 / 60, min: 1, h: 60 };

export const LENGTH_DISPLAY_UNITS = ["mm", "cm", "m", "km"] as const;
export const TIME_DISPLAY_UNITS = ["s", "min", "h"] as const;

function resolveUnit(unit: string): string {
  return UNIT_ALIAS[unit.toLowerCase().trim()] ?? unit.toLowerCase().trim();
}

function getFactors(canonical: string): Record<string, number> | null {
  if (canonical in LENGTH_FACTORS) return LENGTH_FACTORS;
  if (canonical in TIME_FACTORS) return TIME_FACTORS;
  return null;
}

/** Returns the list of display unit options for a given stored base unit. */
export function getDisplayUnits(baseUnit: string): string[] {
  const canonical = resolveUnit(baseUnit);
  if (canonical in LENGTH_FACTORS) return [...LENGTH_DISPLAY_UNITS];
  if (canonical in TIME_FACTORS) return [...TIME_DISPLAY_UNITS];
  return [baseUnit];
}

/** Returns the canonical display unit that matches the stored unit (e.g. "metro" → "m"). */
export function getDefaultDisplayUnit(baseUnit: string): string {
  return resolveUnit(baseUnit);
}

/**
 * Converts `value` from `displayUnit` to `baseUnit`.
 * If both units belong to the same group, performs the conversion.
 * If either is unknown or they belong to different groups, returns value unchanged.
 */
export function toBaseUnit(value: number, displayUnit: string, baseUnit: string): number {
  const canonicalDisplay = resolveUnit(displayUnit);
  const canonicalBase = resolveUnit(baseUnit);

  const displayFactors = getFactors(canonicalDisplay);
  const baseFactors = getFactors(canonicalBase);

  if (!displayFactors || !baseFactors || displayFactors !== baseFactors) return value;

  return (value * displayFactors[canonicalDisplay]!) / baseFactors[canonicalBase]!;
}

/**
 * Converts `value` from `baseUnit` to `displayUnit`.
 * Inverse of toBaseUnit.
 */
export function fromBaseUnit(value: number, displayUnit: string, baseUnit: string): number {
  return toBaseUnit(value, baseUnit, displayUnit);
}
