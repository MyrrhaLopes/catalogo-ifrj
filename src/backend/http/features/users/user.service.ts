import bcrypt from "bcrypt";
import { db } from "../../../db/drizzle";
import { sessionsTable, usersTable } from "../../../db/schema";
import { eq } from "drizzle-orm";
import type { UpdateUserInput } from "./user.schema";


export const USER_SERVICE = {
  registerUser: async (email: string, password: string) => {
    const u = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (u.length != 0) {
      throw new Error("email already exists");
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(usersTable)
      .values({ email, passwordHash })
      .returning({ id: usersTable.id, email: usersTable.email });

    return user;
  },
  loginUser: async (email: string, password: string) => {
    const u = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (u.length == 0) {
      throw new Error("user not found");
    }
    const [user] = u
    if(await bcrypt.compare(password,user.passwordHash)==false){
      throw new Error("Credenciais inválidas")
    }
    const s = await db.insert(sessionsTable).values({
     userId: user.id
    }).returning()
    const [session] = s
    return session.id
  },

  logoutUser: async (sessionId: string) => {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  },

  deleteUser: async (userId: string) => {
    await db.delete(usersTable).where(eq(usersTable.id, userId));
  },

  getUsers: async () => {
    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable);
  },

  updateUser: async (userId: string, data: UpdateUserInput) => {
    const updates: { name?: string; passwordHash?: string } = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.password !== undefined)
      updates.passwordHash = await bcrypt.hash(data.password, 10);

    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, userId))
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      });

    return updated;
  },
};
