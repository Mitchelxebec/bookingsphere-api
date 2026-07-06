import { and, eq, or } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { kycApplications } from "../../../infrastructure/db/schema/kyc.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { users } from "../../../infrastructure/db/schema/users.js";

export const createKycApplications = async (
  userId: string,
  documentUrl: string,
) => {
  return await db.transaction(async (tx) => {
    // 1. Race Condition Check: Ensure the user doesn't already have a pending or approved application
    const [existingApplication] = await tx
      .select()
      .from(kycApplications)
      .where(
        and(
          eq(kycApplications.userId, userId),
          or(
            eq(kycApplications.status, "PENDING"),
            eq(kycApplications.status, "APPROVED"),
          ),
        ),
      )
      .limit(1);

    if (existingApplication)
      throw new ApiError(
        409,
        "Conflict: You already have an active or approved KYC application in progress.",
      );

    // 2. Action A: Insert the raw document submission record into the KYC table
    const [newKycRecord] = await tx
      .insert(kycApplications)
      .values({ userId, documentUrl, status: "PENDING" })
      .returning();

    // 3. Action B: Immediately sync the status change over to the main users profile table
    const [updateUser] = await tx
      .update(users)
      .set({ proprietorStatus: "PENDING", kycSubmittedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updateUser)
      throw new ApiError(
        404,
        "Target user profile not found. Transaction cancelled.",
      );

    return newKycRecord;
  });
};

export const getKycByUserId = async (userId: string) => {
  return await db
    .select()
    .from(kycApplications)
    .where(eq(kycApplications.userId, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null);
};

export const getUserProfile = async (userId: string) => {
  return await db
    .select({
      roles: users.roles,
      proprietorStatus: users.proprietorStatus,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null);
};
