import { describe, expect, it } from "vitest";
import {
  getUnmetPasswordRules,
  hasFieldErrors,
  validateEmail,
  validateLoginForm,
  validateNewPassword,
  validateRegisterForm,
} from "./auth.validation";

const VALID_PASSWORD = "Senha@123";

describe("validateEmail", () => {
  it.each([
    ["", "Informe o e-mail"],
    ["   ", "Informe o e-mail"],
    ["sem-arroba", "Não é um e-mail válido"],
    ["a@", "Não é um e-mail válido"],
    ["a@b", "Não é um e-mail válido"],
  ])("%j → %s", (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });

  it("aceita email válido, ignorando espaços nas pontas", () => {
    expect(validateEmail("a@b.com")).toBeUndefined();
    expect(validateEmail("  a@b.com  ")).toBeUndefined();
  });
});

describe("validateNewPassword", () => {
  it("exige senha preenchida", () => {
    expect(validateNewPassword("")).toBe("Informe a senha");
  });

  it("usa a mensagem específica quando falta um único requisito", () => {
    expect(validateNewPassword("Senha1234")).toBe(
      "A senha precisa de pelo menos um caractere especial",
    );
  });

  it("lista todos os requisitos não atendidos", () => {
    expect(validateNewPassword("abc")).toBe(
      "A senha não atende aos requisitos: entre 8 e 72 caracteres, uma letra maiúscula, um número, um caractere especial (ex: ! @ # $ %)",
    );
  });

  it("aceita senha que atende a todos os requisitos", () => {
    expect(validateNewPassword(VALID_PASSWORD)).toBeUndefined();
    expect(getUnmetPasswordRules(VALID_PASSWORD)).toEqual([]);
  });
});

describe("validateLoginForm", () => {
  it("retorna erros para campos vazios", () => {
    expect(validateLoginForm({ email: "", password: "" })).toEqual({
      email: "Informe o e-mail",
      password: "Informe a senha",
    });
  });

  it("não aplica os requisitos de senha no login", () => {
    expect(validateLoginForm({ email: "a@b.com", password: "fraca" })).toEqual({});
  });
});

describe("validateRegisterForm", () => {
  const valid = { email: "a@b.com", password: VALID_PASSWORD, confirmPassword: VALID_PASSWORD };

  it("aceita formulário válido", () => {
    expect(validateRegisterForm(valid)).toEqual({});
  });

  it("detecta email inválido e senha fraca", () => {
    const errors = validateRegisterForm({ ...valid, email: "x", password: "abc", confirmPassword: "abc" });
    expect(errors.email).toBe("Não é um e-mail válido");
    expect(errors.password).toMatch(/^A senha não atende aos requisitos/);
    expect(errors.confirmPassword).toBeUndefined();
  });

  it("exige confirmação e que ela coincida com a senha", () => {
    expect(validateRegisterForm({ ...valid, confirmPassword: "" }).confirmPassword).toBe("Confirme a senha");
    expect(validateRegisterForm({ ...valid, confirmPassword: "Outra@123" }).confirmPassword).toBe(
      "As senhas não coincidem",
    );
  });
});

describe("hasFieldErrors", () => {
  it.each([
    [{}, false],
    [{ email: undefined }, false],
    [{ email: "" }, false],
    [{ email: "erro" }, true],
  ])("%j → %s", (errors, expected) => {
    expect(hasFieldErrors(errors)).toBe(expected);
  });
});
