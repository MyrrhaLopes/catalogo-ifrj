import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch, parseErrorBody } from "./client";

describe("parseErrorBody", () => {
  it.each([undefined, null, "texto", 42, []])("retorna vazio para corpo %j", (body) => {
    expect(parseErrorBody(body)).toEqual({ message: undefined, fieldErrors: {}, formErrors: [] });
  });

  it("extrai mensagem e erros do formato z.flattenError", () => {
    const body = {
      message: "Dados inválidos",
      errors: {
        formErrors: ["Erro geral"],
        fieldErrors: { email: ["E-mail inválido"], password: [], name: "não é array" },
      },
    };
    expect(parseErrorBody(body)).toEqual({
      message: "Dados inválidos",
      fieldErrors: { email: ["E-mail inválido"] },
      formErrors: ["Erro geral"],
    });
  });

  it("ignora message não-string ou vazia", () => {
    expect(parseErrorBody({ message: 1 }).message).toBeUndefined();
    expect(parseErrorBody({ message: "" }).message).toBeUndefined();
  });
});

describe("apiFetch", () => {
  afterEach(() => vi.unstubAllGlobals());

  function stubFetch(status: number, body: string) {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body, { status })));
  }

  it("lança ApiError com a mensagem do servidor em erros 4xx", async () => {
    stubFetch(409, JSON.stringify({ message: "Este e-mail já está cadastrado" }));
    const error = await apiFetch("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(409);
    expect((error as ApiError).message).toBe("Este e-mail já está cadastrado");
  });

  it("mantém o corpo da resposta legível para quem trata o erro", async () => {
    stubFetch(409, JSON.stringify({ message: "conflito" }));
    const error = (await apiFetch("/x").catch((e: unknown) => e)) as ApiError;
    await expect(error.response.json()).resolves.toEqual({ message: "conflito" });
  });

  it("não usa a mensagem interna do servidor em erros 5xx", async () => {
    stubFetch(500, JSON.stringify({ message: "the server didn't behaved correctly" }));
    const error = (await apiFetch("/x").catch((e: unknown) => e)) as ApiError;
    expect(error.message).toBe("Request failed with status 500");
    expect(error.serverMessage).toBe("the server didn't behaved correctly");
  });

  it("tolera corpo que não é JSON", async () => {
    stubFetch(502, "<html>Bad Gateway</html>");
    const error = (await apiFetch("/x").catch((e: unknown) => e)) as ApiError;
    expect(error.serverMessage).toBeUndefined();
    expect(error.fieldErrors).toEqual({});
  });
});
