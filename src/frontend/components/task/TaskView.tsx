import type { TasksSelect } from "@/backend/db/schema";
import type { TaskView as TaskViewVariant } from "@/frontend/components/task/task-options";
import { TaskGroup } from "@/frontend/components/task/TaskGroup";

interface TaskViewProps {
  variant: TaskViewVariant;
  tasks: TasksSelect[];
}

function toCardTask(t: TasksSelect) {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    completed: t.status === "done",
    dueDateStart: (t.dueDateStart as unknown as string) ?? null,
    dueDateEnd: (t.dueDateEnd as unknown as string) ?? null,
  };
}

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (d.getTime() === today.getTime()) return "Hoje";
  if (d.getTime() === tomorrow.getTime()) return "Amanhã";

  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function TaskListView({ tasks }: { tasks: TasksSelect[] }) {
  const semPrazo = tasks.filter((t) => !t.dueDateStart);
  const comPrazo = tasks.filter((t) => !!t.dueDateStart);

  if (tasks.length === 0) {
    return <p className="text-sm text-neutral-400">Nenhuma tarefa encontrada.</p>;
  }

  // Group tasks with deadline by date, then by hour
  const dateGroups = new Map<string, { label: string; date: Date; tasks: TasksSelect[] }>();
  for (const task of comPrazo) {
    const d = new Date(task.dueDateStart!);
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!dateGroups.has(dateKey)) {
      dateGroups.set(dateKey, { label: formatDateLabel(d), date: d, tasks: [] });
    }
    dateGroups.get(dateKey)!.tasks.push(task);
  }

  const sortedDateGroups = Array.from(dateGroups.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  return (
    <div className="space-y-6">
      {semPrazo.length > 0 && (
        <TaskGroup label="Sem prazo" tasks={semPrazo.map(toCardTask)} />
      )}

      {sortedDateGroups.map((group) => {
        // Sub-group by hour
        const timeGroups = new Map<string, { timeLabel: string; tasks: TasksSelect[] }>();
        for (const task of group.tasks) {
          const d = new Date(task.dueDateStart!);
          const timeKey = formatTimeLabel(d);
          if (!timeGroups.has(timeKey)) {
            timeGroups.set(timeKey, { timeLabel: timeKey, tasks: [] });
          }
          timeGroups.get(timeKey)!.tasks.push(task);
        }

        const columns = Array.from(timeGroups.values())
          .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
          .map((tg) => ({
            time: tg.timeLabel,
            tasks: tg.tasks.map(toCardTask),
          }));

        if (columns.length === 1 && !columns[0].time) {
          return (
            <TaskGroup
              key={group.label}
              label={group.label}
              tasks={group.tasks.map(toCardTask)}
            />
          );
        }

        return (
          <TaskGroup
            key={group.label}
            variant="time"
            label={group.label}
            columns={columns}
          />
        );
      })}
    </div>
  );
}

export function TaskView({ variant, tasks }: TaskViewProps) {
  if (variant === "list") {
    return <TaskListView tasks={tasks} />;
  }

  return null;
}
