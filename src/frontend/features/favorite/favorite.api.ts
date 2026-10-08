import { apiFetch } from "@/frontend/shared/api/client";

const LOCAL_STORAGE_KEY = "ifrj_favorites";

export function getLocalFavorites(): number[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

export function setLocalFavorites(ids: number[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
}

export async function getFavoriteIds(): Promise<number[]> {
  const res = await apiFetch("/api/v1/favorites/");
  const data = (await res.json()) as { favoriteIds: number[] };
  return data.favoriteIds;
}

export async function toggleFavoriteApi(
  speciesId: number,
): Promise<{ action: "added" | "removed"; speciesId: number }> {
  const res = await apiFetch(`/api/v1/favorites/${speciesId}`, { method: "POST" });
  return res.json() as Promise<{ action: "added" | "removed"; speciesId: number }>;
}

export async function syncFavoritesApi(ids: number[]): Promise<void> {
  await apiFetch("/api/v1/favorites/sync", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}
