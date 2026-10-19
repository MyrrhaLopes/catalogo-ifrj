import { describe, expect, it } from "vitest";
import { ApiError } from "@/frontend/shared/api/client";
import { NETWORK_ERROR_MESSAGE, SERVER_ERROR_MESSAGE, resolveServerError } from "./auth.errors";

const FIELDS = ["email", "password"] as const;

function apiError(status: number, body?: unknown) {
  return new ApiError(status, new Response(null, { status }), body);
}

describe("resolveServerError", () => {
  it("retorna vazio quando não há erro", () => {
    expect(resolveServerError(null, FIELDS)).toEqual({ fieldErrors: {} });
    expect(resolveServerError(undefined, FIELDS)).toEqual({ fieldErrors: {} });
  });

  it("distribui erros de validação (400) nos campos, sem mensagem genérica", () => {
    const error = apiError(400, {
      message: "Dados inválidos",
      errors: { formErrors: [], fieldErrors: { email: ["Informe um e-mail válido"], password: ["A", "B"] } },
    });
    expect(resolveServerError(error, FIELDS)).toEqual({
      fieldErrors: { email: "Informe um e-mail válido", password: "A" },
    });
  });

  it("move erros de campos desconhecidos e formErrors para a mensagem geral", () => {
    const error = apiError(400, {
      errors: { formErrors: ["Erro geral"], fieldErrors: { outro: ["Campo extra"] } },
    });
    expect(resolveServerError(error, FIELDS)).toEqual({
      message: "Erro geral. Campo extra",
      fieldErrors: {},
    });
  });

  it("usa a mensagem do servidor para 401", () => {
    const error = apiError(401, { message: "E-mail ou senha incorretos" });
    expect(resolveServerError(error, FIELDS)).toEqual({
      message: "E-mail ou senha incorretos",
      fieldErrors: {},
    });
  });

  it("associa um status a um campo via fieldByStatus", () => {
    const error = apiError(409, { message: "Este e-mail já está cadastrado" });
    expect(resolveServerError(error, FIELDS, { fieldByStatus: { 409: "email" } })).toEqual({
      fieldErrors: { email: "Este e-mail já está cadastrado" },
    });
  });

  it("usa fallbackMessage quando o servidor não envia mensagem", () => {
    expect(resolveServerError(apiError(404), FIELDS, { fallbackMessage: "Falhou" })).toEqual({
      message: "Falhou",
      fieldErrors: {},
    });
  });

  it("esconde detalhes internos em erros 5xx", () => {
    const error = apiError(500, { message: "the server didn't behaved correctly" });
    expect(resolveServerError(error, FIELDS).message).toBe(SERVER_ERROR_MESSAGE);
  });

  it("trata falha de rede (TypeError do fetch)", () => {
    expect(resolveServerError(new TypeError("Failed to fetch"), FIELDS).message).toBe(
      NETWORK_ERROR_MESSAGE,
    );
  });

  it("usa a mensagem de um Error comum e o fallback para valores desconhecidos", () => {
    expect(resolveServerError(new Error("Algo"), FIELDS).message).toBe("Algo");
    expect(resolveServerError("string solta", FIELDS, { fallbackMessage: "F" }).message).toBe("F");
  });
});
