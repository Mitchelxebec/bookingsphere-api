import { eq } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { users } from "../../../infrastructure/db/schema/users.js";

export const findUserFromEmail = async (email: string) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      password_hash: users.password_hash,
      roles: users.roles,
      createdAt: users.created_at,
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  return user ?? null;
};

export const updatePasswordByEmail = async (
  email: string,
  hashedNewPassword: string,
): Promise<boolean> => {
  const result = await db
    .update(users)
    .set({ password_hash: hashedNewPassword })
    .where(eq(users.email, email))
    .returning({ id: users.id });

  return result.length > 0;
};
