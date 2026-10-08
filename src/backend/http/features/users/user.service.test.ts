import { vi, describe, it, expect, beforeEach } from "vitest";
import { db } from "@/backend/db/drizzle";
import bcrypt from "bcrypt";
import { USER_SERVICE } from "./user.service";

vi.mock("@/backend/db/drizzle", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

function mockSelect(result: unknown[]) {
  const where = vi.fn().mockResolvedValue(result);
  const from = vi.fn().mockReturnValue({ where });
  vi.mocked(db.select).mockReturnValueOnce({ from } as ReturnType<typeof db.select>);
}

function mockInsert(result: unknown[]) {
  const returning = vi.fn().mockResolvedValue(result);
  const values = vi.fn().mockReturnValue({ returning });
  vi.mocked(db.insert).mockReturnValueOnce({ values } as ReturnType<typeof db.insert>);
}

function mockDelete() {
  const where = vi.fn().mockResolvedValue(undefined);
  vi.mocked(db.delete).mockReturnValueOnce({ where } as ReturnType<typeof db.delete>);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("USER_SERVICE.registerUser", () => {
  it('lança "email already exists" quando o email já está cadastrado', async () => {
    mockSelect([{ id: "uuid-1", email: "a@b.com", passwordHash: "h" }]);

    await expect(USER_SERVICE.registerUser("a@b.com", "pass")).rejects.toThrow(
      "email already exists",
    );
  });

  it("faz hash da senha e retorna o novo usuário criado", async () => {
    mockSelect([]);
    vi.mocked(bcrypt.hash).mockResolvedValue("$2b$hashed" as never);
    mockInsert([{ id: "uuid-2", email: "new@b.com" }]);

    const result = await USER_SERVICE.registerUser("new@b.com", "mypassword");

    expect(result).toEqual({ id: "uuid-2", email: "new@b.com" });
    expect(bcrypt.hash).toHaveBeenCalledWith("mypassword", 10);
  });
});

describe("USER_SERVICE.loginUser", () => {
  it('lança "user not found" quando o email não existe', async () => {
    mockSelect([]);

    await expect(USER_SERVICE.loginUser("x@b.com", "pass")).rejects.toThrow(
      "user not found",
    );
  });

  it('lança "Credenciais inválidas" quando a senha está errada', async () => {
    mockSelect([{ id: "uuid-1", email: "a@b.com", passwordHash: "$correct" }]);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(USER_SERVICE.loginUser("a@b.com", "senhaerrada")).rejects.toThrow(
      "Credenciais inválidas",
    );
  });

  it("retorna o ID da sessão quando login é bem-sucedido", async () => {
    mockSelect([{ id: "uuid-user", email: "a@b.com", passwordHash: "$correct" }]);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    mockInsert([{ id: "session-uuid-123", userId: "uuid-user" }]);

    const sessionId = await USER_SERVICE.loginUser("a@b.com", "senhaCorreta");

    expect(sessionId).toBe("session-uuid-123");
  });
});

describe("USER_SERVICE.logoutUser", () => {
  it("deleta a sessão do banco de dados", async () => {
    mockDelete();

    await expect(USER_SERVICE.logoutUser("session-id")).resolves.toBeUndefined();
  });
});
