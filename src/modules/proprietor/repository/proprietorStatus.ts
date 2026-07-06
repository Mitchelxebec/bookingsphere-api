import { eq } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { users } from "../../../infrastructure/db/schema/users.js";

export const getProperietorStatus = async (userId: string) => {
  return db
    .select({
      proprietorStatus: users.proprietorStatus,
      banReason: users.ban_reason,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null);
};
