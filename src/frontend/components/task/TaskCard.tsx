import { cn } from "@/frontend/shared/utils";
import { useNavigate } from "@tanstack/react-router";
import usePatchTask from "@/frontend/hooks/usePatchTask";
import useDeleteTask from "@/frontend/hooks/useDeleteTask";
import { Clock, MoreVertical, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { DateTimePicker } from "@/frontend/components/task/DateTimePicker";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  dueDateStart?: string | null;
  dueDateEnd?: string | null;
  className?: string;
}

function buildDateWithTime(base: Date, time: string | undefined): Date {
  const d = new Date(base);
  if (time) {
    const [h, m] = time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

/** Adjust a desired (x, y) so that a box of given size stays within the viewport. */
function clampToViewport(x: number, y: number, width: number, height: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 8;
  return {
    x: Math.min(x, vw - width - margin),
    y: Math.min(y, vh - height - margin),
  };
}

export function TaskCard({ id, title, description, completed = false, dueDateStart, dueDateEnd, className }: TaskCardProps) {
  const navigate = useNavigate();
  const { mutate: patch } = usePatchTask();
  const { mutate: remove } = useDeleteTask();

  const [dropdownPos, setDropdownPos] = useState<{ x: number; y: number } | null>(null);
  const [datePickerPos, setDatePickerPos] = useState<{ x: number; y: number } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date | undefined>(undefined);
  const [pendingTimeStart, setPendingTimeStart] = useState<string | undefined>(undefined);
  const [pendingTimeEnd, setPendingTimeEnd] = useState<string | undefined>(undefined);

  const datePickerRef = useRef<HTMLDivElement>(null);

  // After the date picker renders, measure it and clamp so it never overflows the viewport.
  useEffect(() => {
    if (!datePickerPos || !datePickerRef.current) return;
    const el = datePickerRef.current;
    const { width, height } = el.getBoundingClientRect();
    const clamped = clampToViewport(datePickerPos.x, datePickerPos.y, width, height);
    if (clamped.x !== datePickerPos.x || clamped.y !== datePickerPos.y) {
      setDatePickerPos(clamped);
    }
  }, [datePickerPos]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    patch({ id, values: { status: completed ? "to-do" : "done" } });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (dropdownPos) {
      setDropdownPos(null);
      return;
    }
    window.dispatchEvent(new CustomEvent("task-popover-open", { detail: { id } }));
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownPos({ x: rect.left, y: rect.bottom + 4 });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("task-popover-open", { detail: { id } }));
    setDropdownPos({ x: e.clientX, y: e.clientY });
  };

  const handleDiscard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownPos(null);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    remove(id);
    setConfirmOpen(false);
  };

  const handleOpenDatePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = dropdownPos;
    setDropdownPos(null);

    if (dueDateStart) {
      const start = new Date(dueDateStart);
      setPendingDate(new Date(start.getFullYear(), start.getMonth(), start.getDate()));
      const h = start.getHours(), m = start.getMinutes();
      setPendingTimeStart(h !== 0 || m !== 0 ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` : undefined);
      if (dueDateEnd) {
        const end = new Date(dueDateEnd);
        const eh = end.getHours(), em = end.getMinutes();
        setPendingTimeEnd(eh !== 0 || em !== 0 ? `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}` : undefined);
      } else {
        setPendingTimeEnd(undefined);
      }
    } else {
      setPendingDate(undefined);
      setPendingTimeStart(undefined);
      setPendingTimeEnd(undefined);
    }

    setDatePickerPos(pos);
  };

  const handleConfirmDate = () => {
    if (!pendingDate) return;
    patch({
      id,
      values: {
        dueDateStart: buildDateWithTime(pendingDate, pendingTimeStart),
        dueDateEnd: pendingTimeEnd ? buildDateWithTime(pendingDate, pendingTimeEnd) : null,
      },
    });
    setDatePickerPos(null);
  };

  useEffect(() => {
    if (!dropdownPos) return;
    const close = () => setDropdownPos(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [dropdownPos]);

  useEffect(() => {
    if (!datePickerPos) return;
    const close = () => setDatePickerPos(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [datePickerPos]);

  useEffect(() => {
    const handleOtherOpen = (e: Event) => {
      if ((e as CustomEvent<{ id: string }>).detail.id !== id) {
        setDropdownPos(null);
        setDatePickerPos(null);
      }
    };
    window.addEventListener("task-popover-open", handleOtherOpen);
    return () => window.removeEventListener("task-popover-open", handleOtherOpen);
  }, [id]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate({ to: "/tasks/$taskId", params: { taskId: id } })}
        onKeyDown={(e) => e.key === "Enter" && navigate({ to: "/tasks/$taskId", params: { taskId: id } })}
        onContextMenu={handleContextMenu}
        className={cn(
          "flex items-start gap-2 rounded-full border border-neutral-300 bg-white px-3 py-2 cursor-pointer hover:bg-neutral-50 transition-colors",
          description && "rounded-2xl",
          className,
        )}
      >
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "mt-0.5 w-4 h-4 shrink-0 rounded-sm border-2 flex items-center justify-center transition-colors",
            completed
              ? "bg-neutral-800 border-neutral-800"
              : "bg-white border-neutral-400 hover:border-neutral-600",
          )}
        >
          {completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-sm font-medium text-neutral-900 leading-tight truncate",
            completed && "line-through text-neutral-400",
          )}>
            {title}
          </p>
          {description && (
            <p className="mt-0.5 text-xs text-neutral-500 leading-snug line-clamp-2">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleMenuClick}
          className="ml-auto shrink-0 mt-0.5 p-0.5 rounded text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Opções da tarefa"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {dropdownPos && (
        <div
          className="fixed z-50 min-w-[160px] rounded-lg border border-neutral-200 bg-white shadow-lg py-1"
          style={{ left: dropdownPos.x, top: dropdownPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleOpenDatePicker}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <Clock className="w-4 h-4" />
            {dueDateStart ? "Mudar prazo" : "Definir prazo"}
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Descartar tarefa
          </button>
        </div>
      )}

      {datePickerPos && (
        <div
          ref={datePickerRef}
          className="fixed z-50 rounded-lg border border-neutral-200 bg-white shadow-lg p-3"
          style={{ left: datePickerPos.x, top: datePickerPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <DateTimePicker
            date={pendingDate}
            timeStart={pendingTimeStart}
            timeEnd={pendingTimeEnd}
            onDateChange={setPendingDate}
            onTimeStartChange={setPendingTimeStart}
            onTimeEndChange={setPendingTimeEnd}
          />
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
            <button
              type="button"
              onClick={() => setDatePickerPos(null)}
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDate}
              disabled={!pendingDate}
              className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-white hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir tarefa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{title}"? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700 transition-colors"
            >
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
