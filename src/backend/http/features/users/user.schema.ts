import z from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export type PasswordRule = {
  id: string;
  label: string;
  message: string;
  test: (password: string) => boolean;
};

// Fonte única dos requisitos de senha: usada pelo schema Zod (servidor) e
// pelo checklist exibido nas telas de login/registro (cliente).
export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `Entre ${PASSWORD_MIN_LENGTH} e ${PASSWORD_MAX_LENGTH} caracteres`,
    message: `A senha deve ter entre ${PASSWORD_MIN_LENGTH} e ${PASSWORD_MAX_LENGTH} caracteres`,
    test: (p) => p.length >= PASSWORD_MIN_LENGTH && p.length <= PASSWORD_MAX_LENGTH,
  },
  {
    id: "uppercase",
    label: "Uma letra maiúscula",
    message: "A senha precisa de pelo menos uma letra maiúscula",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "Uma letra minúscula",
    message: "A senha precisa de pelo menos uma letra minúscula",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "Um número",
    message: "A senha precisa de pelo menos um número",
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: "special",
    label: "Um caractere especial (ex: ! @ # $ %)",
    message: "A senha precisa de pelo menos um caractere especial",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

const passwordSchema = PASSWORD_RULES.reduce(
  (schema, rule) => schema.refine(rule.test, rule.message),
  z.string({ error: "Informe a senha" }),
);

const emailSchema = z.email({ error: "Informe um e-mail válido" });

export const userRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// O login não reaplica os requisitos de senha: contas criadas fora do fluxo de
// registro (ex: create-admin) podem ter senhas que não seguem as regras atuais.
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "Informe a senha" }).min(1, "Informe a senha"),
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;

export const userListItemSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  email: z.string(),
  createdAt: z.string().nullable(),
});
export type UserListItem = z.infer<typeof userListItemSchema>;

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    password: passwordSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.password !== undefined, {
    message: "Pelo menos um campo deve ser fornecido",
  });
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
