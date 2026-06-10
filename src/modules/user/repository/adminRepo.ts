import { count, or, ilike, and, SQL, eq } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { users } from "../../../infrastructure/db/schema/users.js";

export const getUserById = async (userId: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
};

export const getAllUserInfo = async (
  page: number,
  limit: number,
  search?: string,
) => {
  const offset = (page - 1) * limit;

  // 1. Dynamically build the search condition if a string is provided
  const conditions: SQL[] = [];

  if (search && search.trim() !== "") {
    const searchPattern = `%${search.trim()}%`;
    conditions.push(
      or(ilike(users.name, searchPattern), ilike(users.email, searchPattern))!,
    );
  }

  // Combine conditions with an logical AND wrapper
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 2. Fetch both matching data blocks simultaneously
  const [userData, countResult] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roles: users.roles,
        is_banned: users.is_banned,
        ban_reason: users.ban_reason,
        created_at: users.created_at,
      })
      .from(users)
      .where(whereClause) // Applied search filter
      .limit(limit)
      .offset(offset),

    db.select({ total: count() }).from(users).where(whereClause), // Must apply same search filter to matching count
  ]);

  const totalUsers = countResult[0]?.total ?? 0;
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    metadata: {
      totalUsers,
      totalPages,
      currentPage: page,
      limit,
    },
    users: userData,
  };
};

type usersEnumRoles = "GUEST" | "PROPRIETOR" | "ADMIN" | "SUPERADMIN";

export const updateUserRoleRepo = async (
  userId: string,
  newRoles: usersEnumRoles[],
  actorUserId: string,
) => {
  const [result] = await db
    .update(users)
    .set({
      roles: newRoles,
      role_updated_at: new Date(),
      role_updated_by: actorUserId,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      roles: users.roles,
      role_updated_at: users.role_updated_at,
      role_updated_by: users.role_updated_by,
    });

  return result ?? null;
};

export const banUser = async (
  userId: string,
  banReason: string,
  actorUserId: string,
) => {
  const [banned] = await db
    .update(users)
    .set({
      is_banned: true,
      ban_reason: banReason,
      banned_at: new Date(),
      banned_by: actorUserId,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      is_banned: users.is_banned,
      ban_reason: users.ban_reason,
      banned_at: users.banned_at,
      banned_by: users.banned_by,
    });

  return banned ?? null;
};

export const unBanUser = async (userId: string, actorUserId: string) => {
  const [unbanned] = await db
    .update(users)
    .set({
      is_banned: false,
      unbanned_at: new Date(),
      unbanned_by: actorUserId,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      is_banned: users.is_banned,
      unbanned_at: users.unbanned_at,
      unbanned_by: users.unbanned_by,
    });

  return unbanned ?? null;
};
