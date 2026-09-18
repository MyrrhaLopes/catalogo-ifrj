import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Clock, Trash2 } from "lucide-react";
import useGetTaskById from "../hooks/useGetTaskById";
import usePatchTask from "../hooks/usePatchTask";
import useDeleteTask from "../hooks/useDeleteTask";
import { cn } from "../shared/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/frontend/components/ui/popover";
import { DateTimePicker } from "@/frontend/components/task/DateTimePicker";

export const taskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks/$taskId",
  component: TaskPage,
});

function formatStoredDate(start: Date, end?: Date | null): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  let dateLabel: string;
  if (d.getTime() === today.getTime()) dateLabel = "Hoje";
  else if (d.getTime() === tomorrow.getTime()) dateLabel = "Amanhã";
  else dateLabel = start.toLocaleDateString("pt-BR");

  const h = start.getHours();
  const m = start.getMinutes();
  if (h === 0 && m === 0) return dateLabel;

  const startTime = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (end) {
    const endTime = end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${dateLabel}, ${startTime}–${endTime}`;
  }

  return `${dateLabel}, ${startTime}`;
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

function TaskPage() {
  const { taskId } = useParams({ from: "/tasks/$taskId" });
  const navigate = useNavigate();
  const { data: task, isLoading } = useGetTaskById(taskId);
  const { mutate: patch } = usePatchTask();
  const { mutate: remove } = useDeleteTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [prazoOpen, setPrazoOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date | undefined>(undefined);
  const [pendingTimeStart, setPendingTimeStart] = useState<string | undefined>(undefined);
  const [pendingTimeEnd, setPendingTimeEnd] = useState<string | undefined>(undefined);
  const [prazoModified, setPrazoModified] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (task && !initializedRef.current) {
      initializedRef.current = true;
      setTitle(task.title);
      setDescription(task.description ?? "");
      if (task.dueDateStart) {
        const start = new Date(task.dueDateStart as unknown as string);
        setPendingDate(new Date(start.getFullYear(), start.getMonth(), start.getDate()));
        const h = start.getHours(), m = start.getMinutes();
        if (h !== 0 || m !== 0) {
          setPendingTimeStart(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
        }
        if (task.dueDateEnd) {
          const end = new Date(task.dueDateEnd as unknown as string);
          const eh = end.getHours(), em = end.getMinutes();
          if (eh !== 0 || em !== 0) {
            setPendingTimeEnd(`${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`);
          }
        }
      }
    }
  }, [task]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <header className="h-12 bg-neutral-800" />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <p className="text-sm text-neutral-400">Carregando...</p>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <header className="h-12 bg-neutral-800" />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <p className="text-sm text-neutral-400">Tarefa não encontrada.</p>
        </main>
      </div>
    );
  }

  const completed = task.status === "done";

  const handleSave = () => {
    patch(
      {
        id: taskId,
        values: {
          title,
          description: description || undefined,
          ...(prazoModified && {
            dueDateStart: pendingDate ? buildDateWithTime(pendingDate, pendingTimeStart) : null,
            dueDateEnd: pendingDate && pendingTimeEnd ? buildDateWithTime(pendingDate, pendingTimeEnd) : null,
          }),
        },
      },
      { onSuccess: () => navigate({ to: "/" }) },
    );
  };

  const handleRemovePrazo = () => {
    setPendingDate(undefined);
    setPendingTimeStart(undefined);
    setPendingTimeEnd(undefined);
    setPrazoModified(true);
    setPrazoOpen(false);
  };

  const handleDelete = () => {
    remove(taskId, { onSuccess: () => navigate({ to: "/" }) });
  };

  const handleToggleComplete = () => {
    patch({
      id: taskId,
      values: { status: completed ? "to-do" : "done" },
    });
  };

  const originalLabel = task.dueDateStart
    ? formatStoredDate(
        new Date(task.dueDateStart as unknown as string),
        task.dueDateEnd ? new Date(task.dueDateEnd as unknown as string) : null,
      )
    : null;

  const pendingLabel = (() => {
    if (!prazoModified || !pendingDate) return null;
    const start = buildDateWithTime(pendingDate, pendingTimeStart);
    const end = pendingTimeEnd ? buildDateWithTime(pendingDate, pendingTimeEnd) : null;
    return formatStoredDate(start, end);
  })();

  const effectivelyHasDate = prazoModified ? !!pendingDate : !!originalLabel;

  const displayLabel = (() => {
    if (!prazoModified) return originalLabel;
    if (pendingDate && pendingLabel) {
      if (originalLabel) return `De ${originalLabel} para ${pendingLabel}`;
      return pendingLabel;
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="h-12 bg-neutral-800" />

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={handleToggleComplete}
                className={cn(
                  "w-6 h-6 shrink-0 rounded-sm border-2 flex items-center justify-center transition-colors",
                  completed
                    ? "bg-neutral-800 border-neutral-800"
                    : "bg-white border-neutral-400 hover:border-neutral-600",
                )}
              >
                {completed && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 min-w-0 text-2xl font-bold text-neutral-900 bg-transparent outline-none border-b border-neutral-300 focus:border-neutral-600 transition-colors pb-0.5"
              />
            </div>

            <div className="flex items-center gap-2 pl-9 sm:pl-0 shrink-0">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-white hover:bg-neutral-700 transition-colors"
              >
                salvar
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-white hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                excluir
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-9">
            {displayLabel ? (
              <span className="text-sm text-neutral-600">{displayLabel}</span>
            ) : (
              <span className="text-sm text-neutral-400">Sem prazo</span>
            )}
            <Popover open={prazoOpen} onOpenChange={setPrazoOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-50 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {effectivelyHasDate ? "Mudar prazo" : "Definir prazo"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <DateTimePicker
                  date={pendingDate}
                  timeStart={pendingTimeStart}
                  timeEnd={pendingTimeEnd}
                  onDateChange={(d) => { setPendingDate(d); setPrazoModified(true); }}
                  onTimeStartChange={(t) => { setPendingTimeStart(t); setPrazoModified(true); }}
                  onTimeEndChange={(t) => { setPendingTimeEnd(t); setPrazoModified(true); }}
                />
                {originalLabel && (
                  <div className="mt-2 border-t border-neutral-100 pt-2">
                    <button
                      type="button"
                      onClick={handleRemovePrazo}
                      className="w-full rounded px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      Remover prazo
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 min-h-64">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicionar descrição..."
            className="w-full h-full min-h-56 text-sm text-neutral-700 placeholder:text-neutral-400 bg-transparent outline-none resize-none leading-relaxed"
          />
        </div>
      </main>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir tarefa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{task.title}"? Essa ação não pode ser desfeita.
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
    </div>
  );
}
