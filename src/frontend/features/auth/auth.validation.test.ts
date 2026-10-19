import { describe, expect, it } from "vitest";
import {
  getUnmetPasswordRules,
  hasFieldErrors,
  validateEmail,
  validateLoginForm,
  validatePassword,
  validateRegisterForm,
} from "./auth.validation";

const VALID_PASSWORD = "Senha@123456";

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

describe("validatePassword", () => {
  it("exige senha preenchida", () => {
    expect(validatePassword("")).toBe("Informe a senha");
  });

  it.each(["abc", "Senha1234567", "Senha@1", "Senha@1234567890abc"])(
    "rejeita %j, que não atende a algum requisito",
    (password) => {
      expect(validatePassword(password)).toBe("A senha não atende aos requisitos");
    },
  );

  it("aceita senha que atende a todos os requisitos", () => {
    expect(validatePassword(VALID_PASSWORD)).toBeUndefined();
    expect(getUnmetPasswordRules(VALID_PASSWORD)).toEqual([]);
  });

  it("lista os requisitos não atendidos para o checklist", () => {
    expect(getUnmetPasswordRules("abc").map((r) => r.id)).toEqual([
      "length",
      "uppercase",
      "number",
      "special",
    ]);
  });
});

describe("validateLoginForm", () => {
  it("retorna erros para campos vazios", () => {
    expect(validateLoginForm({ email: "", password: "" })).toEqual({
      email: "Informe o e-mail",
      password: "Informe a senha",
    });
  });

  it("bloqueia senha fora dos requisitos também no login", () => {
    expect(validateLoginForm({ email: "a@b.com", password: "fraca" })).toEqual({
      password: "A senha não atende aos requisitos",
    });
    expect(validateLoginForm({ email: "a@b.com", password: VALID_PASSWORD })).toEqual({});
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
    expect(errors.password).toBe("A senha não atende aos requisitos");
    expect(errors.confirmPassword).toBeUndefined();
  });

  it("exige confirmação e que ela coincida com a senha", () => {
    expect(validateRegisterForm({ ...valid, confirmPassword: "" }).confirmPassword).toBe("Confirme a senha");
    expect(validateRegisterForm({ ...valid, confirmPassword: "Outra@123456" }).confirmPassword).toBe(
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
