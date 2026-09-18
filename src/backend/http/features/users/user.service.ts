import bcrypt from "bcrypt";
import { db } from "../../../db/drizzle";
import { sessionsTable, usersTable } from "../../../db/schema";
import { eq } from "drizzle-orm";


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

  deleteUser: async (userId: number) => {
    await db.delete(usersTable).where(eq(usersTable.id, userId));
  },
};
