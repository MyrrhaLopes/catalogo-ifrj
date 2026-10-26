import { describe, it, expect } from "vitest";
import { isRecentlyCreated, RECENTLY_CREATED_THRESHOLD_MS } from "./recentlyCreated";

describe("isRecentlyCreated", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");

  it("retorna false para createdAt null", () => {
    expect(isRecentlyCreated(null, now)).toBe(false);
  });

  it("retorna false para string de data inválida", () => {
    expect(isRecentlyCreated("not-a-date", now)).toBe(false);
  });

  it("retorna true para criação há 1 minuto", () => {
    const createdAt = new Date(now.getTime() - 60_000).toISOString();
    expect(isRecentlyCreated(createdAt, now)).toBe(true);
  });

  it("retorna false para criação há mais tempo que o limite", () => {
    const createdAt = new Date(now.getTime() - RECENTLY_CREATED_THRESHOLD_MS - 1).toISOString();
    expect(isRecentlyCreated(createdAt, now)).toBe(false);
  });

  it("retorna true exatamente no instante da criação", () => {
    expect(isRecentlyCreated(now.toISOString(), now)).toBe(true);
  });

  it("retorna false para datas no futuro (relógio do cliente desalinhado)", () => {
    const createdAt = new Date(now.getTime() + 60_000).toISOString();
    expect(isRecentlyCreated(createdAt, now)).toBe(false);
  });
});
