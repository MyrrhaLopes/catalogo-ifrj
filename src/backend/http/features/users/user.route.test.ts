import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { userRouter } from "./user.route";
import { USER_SERVICE } from "./user.service";
import { errorHandler } from "../../middleware/errorHandler.middleware";

vi.mock("@/backend/db/drizzle", () => ({ db: {} }));
vi.mock("./user.service", () => ({
  USER_SERVICE: { registerUser: vi.fn(), loginUser: vi.fn() },
}));

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/", userRouter);
  app.use(errorHandler);
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1`;
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  vi.clearAllMocks();
});

async function post(path: string, body: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : undefined };
}

describe("POST /users/", () => {
  it("retorna 400 com erros por campo para email inválido (não 409)", async () => {
    const { status, body } = await post("/users/", { email: "invalido", password: "Senha@123" });
    expect(status).toBe(400);
    expect(body.errors.fieldErrors).toEqual({ email: ["Informe um e-mail válido"] });
    expect(USER_SERVICE.registerUser).not.toHaveBeenCalled();
  });

  it("retorna 400 listando os requisitos de senha não atendidos", async () => {
    const { status, body } = await post("/users/", { email: "a@b.com", password: "Senhafraca" });
    expect(status).toBe(400);
    expect(body.errors.fieldErrors.password).toEqual([
      "A senha precisa de pelo menos um número",
      "A senha precisa de pelo menos um caractere especial",
    ]);
  });

  it("retorna 409 quando o email já existe", async () => {
    vi.mocked(USER_SERVICE.registerUser).mockRejectedValue(new Error("email already exists"));
    const { status, body } = await post("/users/", { email: "a@b.com", password: "Senha@123" });
    expect(status).toBe(409);
    expect(body).toEqual({ message: "Este e-mail já está cadastrado" });
  });

  it("retorna 500 para erros inesperados", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.mocked(USER_SERVICE.registerUser).mockRejectedValue(new Error("db down"));
    const { status } = await post("/users/", { email: "a@b.com", password: "Senha@123" });
    expect(status).toBe(500);
  });

  it("retorna 201 no sucesso", async () => {
    vi.mocked(USER_SERVICE.registerUser).mockResolvedValue({ id: "1", email: "a@b.com" });
    const { status } = await post("/users/", { email: "a@b.com", password: "Senha@123" });
    expect(status).toBe(201);
  });
});

describe("POST /sessions/", () => {
  it("não aplica requisitos de senha no login", async () => {
    vi.mocked(USER_SERVICE.loginUser).mockResolvedValue("session-id");
    const { status } = await post("/sessions/", { email: "admin@b.com", password: "fraca" });
    expect(status).toBe(201);
    expect(USER_SERVICE.loginUser).toHaveBeenCalledWith("admin@b.com", "fraca");
  });

  it("retorna 400 para email inválido ou senha vazia", async () => {
    const { status, body } = await post("/sessions/", { email: "x", password: "" });
    expect(status).toBe(400);
    expect(Object.keys(body.errors.fieldErrors)).toEqual(["email", "password"]);
  });

  it.each(["user not found", "Credenciais inválidas"])(
    "retorna 401 genérico quando o serviço lança %j",
    async (message) => {
      vi.mocked(USER_SERVICE.loginUser).mockRejectedValue(new Error(message));
      const { status, body } = await post("/sessions/", { email: "a@b.com", password: "x" });
      expect(status).toBe(401);
      expect(body).toEqual({ message: "E-mail ou senha incorretos" });
    },
  );
});
