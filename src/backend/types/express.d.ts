import type { usersTable } from "../db/schema";

type UserSelect = typeof usersTable.$inferSelect;

declare module "express-serve-static-core" {
  interface Request {
    user?: UserSelect;
  }
}
