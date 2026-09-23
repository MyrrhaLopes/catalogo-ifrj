export type MeterDisplayUnit = "cm" | "m" | "km";
export type MinuteDisplayUnit = "s" | "min" | "h";
export type DisplayUnit = MeterDisplayUnit | MinuteDisplayUnit;

const METER_TO_BASE: Record<MeterDisplayUnit, number> = { cm: 0.01, m: 1, km: 1000 };
const MINUTE_TO_BASE: Record<MinuteDisplayUnit, number> = { s: 1 / 60, min: 1, h: 60 };

export function getDisplayUnits(baseUnit: string): DisplayUnit[] {
  if (baseUnit === "meter") return ["cm", "m", "km"];
  if (baseUnit === "minute") return ["s", "min", "h"];
  return ["m"];
}

export function toBaseUnit(value: number, displayUnit: DisplayUnit, baseUnit: string): number {
  if (baseUnit === "meter") {
    const factor = METER_TO_BASE[displayUnit as MeterDisplayUnit];
    if (factor === undefined) throw new Error(`Unidade inválida para meter: ${displayUnit}`);
    return value * factor;
  }
  const factor = MINUTE_TO_BASE[displayUnit as MinuteDisplayUnit];
  if (factor === undefined) throw new Error(`Unidade inválida para minute: ${displayUnit}`);
  return value * factor;
}

export function fromBaseUnit(value: number, displayUnit: DisplayUnit, baseUnit: string): number {
  if (baseUnit === "meter") {
    const factor = METER_TO_BASE[displayUnit as MeterDisplayUnit];
    if (factor === undefined) throw new Error(`Unidade inválida para meter: ${displayUnit}`);
    return value / factor;
  }
  const factor = MINUTE_TO_BASE[displayUnit as MinuteDisplayUnit];
  if (factor === undefined) throw new Error(`Unidade inválida para minute: ${displayUnit}`);
  return value / factor;
}
