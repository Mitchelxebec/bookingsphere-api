import { eq } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { users } from "../../../infrastructure/db/schema/users.js";

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  email?: string;
}

export const findUserById = async (userId: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const user = await db
    .update(users)
    .set({ avatar_url: avatarUrl })
    .where(eq(users.id, userId))
    .returning();

  return user;
};

export const updateProfileData = async (
  userId: string,
  data: UpdateProfilePayload,
) => {
  const [updatedUser] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
};

export const deleteUserAccount = async (userId: string) => {
  await db
    .update(users)
    .set({ deleted_at: new Date() })
    .where(eq(users.id, userId));
};
