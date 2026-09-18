export const TASK_VIEW_OPTIONS = ["list", "calendar"] as const;
export const TASK_GROUPING_OPTIONS = ["date", "status", "no_grouping"] as const;
export const TASK_PRAZO_OPTIONS = ["sem-prazo", "hoje", "esta-semana"] as const;

export type TaskView = typeof TASK_VIEW_OPTIONS[number];
export type TaskGrouping = typeof TASK_GROUPING_OPTIONS[number];
export type TaskPrazo = typeof TASK_PRAZO_OPTIONS[number];
