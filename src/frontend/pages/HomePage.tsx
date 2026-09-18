import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { NewTaskFormBar } from "@/frontend/components/task/NewTaskFormBar";
import { OptionsBar } from "@/frontend/components/task/OptionsBar";
import { TaskView } from "@/frontend/components/task/TaskView";
import { AppHeader } from "@/frontend/components/AppHeader";
import z from "zod";
import { taskStatusEnum } from "@/backend/db/schema";
import { TASK_VIEW_OPTIONS, TASK_GROUPING_OPTIONS, TASK_PRAZO_OPTIONS } from "@/frontend/components/task/task-options";
import { useSearch } from "@tanstack/react-router";
import useGetTask from "../hooks/useGetTask";

const homeSearchSchema = z.object({
  dueDateStart: z.coerce.date().optional(),
  dueDateEnd: z.coerce.date().optional(),
  prazo: z.enum(TASK_PRAZO_OPTIONS).optional(),
  status: z.enum([...taskStatusEnum.enumValues, "all"]).optional().default("all"),
  search: z.string().optional().default("*"),
  view: z.enum(TASK_VIEW_OPTIONS).optional().default('list'),
  grouping: z.enum(TASK_GROUPING_OPTIONS).optional().default("date"),
})
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  validateSearch: homeSearchSchema,
  path: "/",
  component: HomePage,
});
export type HomeSearch = z.infer<typeof homeSearchSchema>;

export function HomePage() {
  const { status, search, view } = useSearch({ from: "/" });

  const { data: tasks = [], isLoading } = useGetTask({ status, search });
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <NewTaskFormBar />

        <section className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-neutral-700 mb-3">Opções</p>
          <OptionsBar />
        </section>

        {isLoading ? (
          <p className="text-sm text-neutral-400">Carregando tarefas...</p>
        ) : (
          <TaskView variant={view} tasks={tasks} />
        )}
      </main>
    </div>
  );
}
