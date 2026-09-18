import { Clock, X } from "lucide-react";
import { cn } from "@/frontend/shared/utils";
import { Calendar } from "@/frontend/components/ui/calendar";

export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
export const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

export const selectCls = cn(
  "text-xs border border-neutral-200 rounded px-1.5 py-1 outline-none bg-white text-neutral-700",
  "focus:border-neutral-400 transition-colors cursor-pointer appearance-none text-center",
);

export function formatDateLabel(date: Date, timeStart: string | undefined): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let label: string;
  if (d.getTime() === today.getTime()) label = "Hoje";
  else if (d.getTime() === tomorrow.getTime()) label = "Amanhã";
  else label = date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });

  return timeStart ? `${label}, ${timeStart}` : label;
}

export function TimeSelect({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  onClear: () => void;
}) {
  const [h, m] = value ? value.split(":") : ["", ""];

  const handleHour = (newH: string) => {
    if (!newH) { onChange(undefined); return; }
    onChange(`${newH}:${m || "00"}`);
  };

  const handleMinute = (newM: string) => {
    if (!newM) { onChange(undefined); return; }
    onChange(`${h || "00"}:${newM}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500 w-12 shrink-0">{label}</span>
      <div className="flex items-center gap-1 ml-auto">
        <div className="flex items-center gap-0.5">
          <select value={h} onChange={(e) => handleHour(e.target.value)} className={selectCls} style={{ width: "3rem" }}>
            <option value="">--</option>
            {HOURS.map((hr) => <option key={hr} value={hr}>{hr}</option>)}
          </select>
          <span className="text-xs text-neutral-400">:</span>
          <select value={m} onChange={(e) => handleMinute(e.target.value)} className={selectCls} style={{ width: "3rem" }}>
            <option value="">--</option>
            {MINUTES.map((min) => <option key={min} value={min}>{min}</option>)}
          </select>
        </div>
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center justify-center h-6 w-6 rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>
    </div>
  );
}

export interface DateTimePickerProps {
  date: Date | undefined;
  timeStart: string | undefined;
  timeEnd: string | undefined;
  onDateChange: (date: Date | undefined) => void;
  onTimeStartChange: (time: string | undefined) => void;
  onTimeEndChange: (time: string | undefined) => void;
}

export function DateTimePicker({
  date,
  timeStart,
  timeEnd,
  onDateChange,
  onTimeStartChange,
  onTimeEndChange,
}: DateTimePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <Calendar mode="single" selected={date} onSelect={onDateChange} />

      <div className="border-t border-neutral-100 pt-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-1 mb-0.5">
          <Clock className="h-3 w-3 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-500">Horário</span>
        </div>
        <TimeSelect
          label="Início"
          value={timeStart}
          onChange={onTimeStartChange}
          onClear={() => onTimeStartChange(undefined)}
        />
        <TimeSelect
          label="Fim"
          value={timeEnd}
          onChange={onTimeEndChange}
          onClear={() => onTimeEndChange(undefined)}
        />
      </div>
    </div>
  );
}
