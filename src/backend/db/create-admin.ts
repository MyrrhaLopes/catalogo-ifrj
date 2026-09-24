import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "./drizzle.ts";
import { usersTable } from "./schema.ts";
import { eq } from "drizzle-orm";

const EMAIL = "lorenzolopes223@gmail.com";
const PASSWORD = "Nemtenta223*";

async function createAdmin() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const [inserted] = await db
    .insert(usersTable)
    .values({ email: EMAIL, passwordHash, isAdmin: true })
    .onConflictDoNothing()
    .returning({ id: usersTable.id, email: usersTable.email });

  if (!inserted) {
    // User already exists — just set isAdmin = true
    const [updated] = await db
      .update(usersTable)
      .set({ isAdmin: true })
      .where(eq(usersTable.email, EMAIL))
      .returning({ id: usersTable.id, email: usersTable.email });
    console.log(`isAdmin atualizado para true — id=${updated?.id}, email=${updated?.email}`);
    return;
  }

  console.log(`Usuário admin criado — id=${inserted.id}, email=${inserted.email}`);
}

createAdmin()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
