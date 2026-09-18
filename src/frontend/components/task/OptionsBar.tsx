import { useSearch, useNavigate } from "@tanstack/react-router";
import type { HomeSearch } from "@/frontend/pages/HomePage";
import { OptionsSection } from "./OptionsSection";
export {
  TASK_VIEW_OPTIONS,
  TASK_GROUPING_OPTIONS,
  TASK_PRAZO_OPTIONS,
} from "./task-options";

export function OptionsBar() {
  const { prazo, status } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  const set = (patch: Partial<HomeSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <OptionsSection variant="filtro" prazo={prazo} status={status} set={set} />
    </div>
  );
}
