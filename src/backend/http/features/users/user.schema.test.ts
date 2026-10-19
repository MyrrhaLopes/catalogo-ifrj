import { describe, expect, it } from "vitest";
import { PASSWORD_RULES, userLoginSchema, userRegisterSchema } from "./user.schema";

const VALID_PASSWORD = "Senha@123456";

function issueMessages(input: unknown, schema = userRegisterSchema) {
  const result = schema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
}

describe("PASSWORD_RULES", () => {
  it.each([
    ["length", "Abcdef1!", false],
    ["length", "Abcdefgh1!x", false],
    ["length", "Abcdefgh1!xy", true],
    ["length", "Abcdefgh1!xyzwvuts", true],
    ["length", "Abcdefgh1!xyzwvutsr", false],
    ["uppercase", "abcdef1!", false],
    ["uppercase", "Abcdef1!", true],
    ["lowercase", "ABCDEF1!", false],
    ["number", "Abcdefg!", false],
    ["special", "Abcdefg1", false],
    ["special", "Abcdefg 1", true],
  ])("regra %s com %j → %s", (id, password, expected) => {
    const rule = PASSWORD_RULES.find((r) => r.id === id)!;
    expect(rule.test(password)).toBe(expected);
  });
});

describe("userRegisterSchema", () => {
  it("aceita email e senha válidos", () => {
    expect(userRegisterSchema.safeParse({ email: "a@b.com", password: VALID_PASSWORD }).success).toBe(true);
  });

  it("rejeita email inválido com mensagem em português", () => {
    expect(issueMessages({ email: "nao-e-email", password: VALID_PASSWORD })).toEqual([
      "email: Informe um e-mail válido",
    ]);
  });

  it("reporta todos os requisitos de senha não atendidos de uma vez", () => {
    const messages = issueMessages({ email: "a@b.com", password: "abc" });
    expect(messages).toEqual([
      "password: A senha deve ter entre 12 e 18 caracteres",
      "password: A senha precisa de pelo menos uma letra maiúscula",
      "password: A senha precisa de pelo menos um número",
      "password: A senha precisa de pelo menos um caractere especial",
    ]);
  });

  it("rejeita tipos não-string e campos ausentes", () => {
    expect(issueMessages({ email: 123, password: 456 })).toEqual([
      "email: Informe um e-mail válido",
      "password: Informe a senha",
    ]);
    expect(issueMessages({})).toHaveLength(2);
    expect(userRegisterSchema.safeParse(null).success).toBe(false);
  });
});

describe("userLoginSchema", () => {
  it("aplica os mesmos requisitos de senha do registro", () => {
    expect(userLoginSchema.safeParse({ email: "a@b.com", password: "Senha@123456" }).success).toBe(true);
    expect(issueMessages({ email: "a@b.com", password: "Curta@1" }, userLoginSchema)).toEqual([
      "password: A senha deve ter entre 12 e 18 caracteres",
    ]);
  });
});
