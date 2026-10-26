export const RECENTLY_CREATED_THRESHOLD_MS = 10 * 60 * 1000;

export function isRecentlyCreated(createdAt: string | null, now: Date = new Date()): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const age = now.getTime() - created;
  return age >= 0 && age < RECENTLY_CREATED_THRESHOLD_MS;
}
