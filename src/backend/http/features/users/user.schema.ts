import z from "zod";

export const userRegisterSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(72, "Máximo 72 caracteres")
    .regex(/[A-Z]/, "Precisa de pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Precisa de pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Precisa de pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Precisa de pelo menos um caractere especial"),
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userRegisterSchema>;

export const userListItemSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  email: z.string(),
  createdAt: z.string().nullable(),
});
export type UserListItem = z.infer<typeof userListItemSchema>;

export const userListResponseSchema = z.object({
  users: z.array(userListItemSchema),
});
