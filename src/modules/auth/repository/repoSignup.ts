import { db } from "../../../infrastructure/db/connection.js";
import { users } from "../../../infrastructure/db/schema/users.js";
import { eq } from "drizzle-orm";
import { ApiError } from "../../../modules/shared/utils/ApiError.js";

export const findUserByEmail = async (email: string) => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  return user ?? null;
};

interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface CreatedUserResult {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string | Date;
}

export const createUser = async (data: CreateUserData): Promise<CreatedUserResult> => {
  const [newUser] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password_hash: data.passwordHash,
      roles: ["GUEST"],
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      roles: users.roles,
      createdAt: users.created_at,
    });

  if (!newUser) {
    throw new ApiError(
      400,
      "Database failed to insert and return the user profile.",
    );
  }
  return newUser;
};
