import type { NextFunction, Request, Response } from "express";
import { db } from "../../db/drizzle";
import { sessionsTable, usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function authorizeUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sessionId = req.cookies["session_id"];
    if (!sessionId) {
      return res.status(401).json({ message: "não autenticado" });
    }
    const s = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, sessionId));
    if (s.length == 0) {
      //não há sessão
      return res.status(401).json({ message: "sessão inválida" });
    }
    const [session] = s;
    if (session.expiresAt < new Date()) {
      return res.status(401).json({ message: "sessão expirou" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId));
    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
}
