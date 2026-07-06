import { eq, sql } from "drizzle-orm";
import { db } from "../../../../infrastructure/db/connection.js";
import { kycApplications } from "../../../../infrastructure/db/schema/kyc.js";
import { users } from "../../../../infrastructure/db/schema/users.js";
import { ApiError } from "../../../shared/utils/ApiError.js";

export const getPendingApplications = async () => {
  return await db
    .select({
      // --- KYC Application Data ---
      applicationId: kycApplications.id,
      documentUrl: kycApplications.documentUrl,
      status: kycApplications.status,
      submittedAt: kycApplications.submittedAt,

      // --- Applicant User Profile Details ---
      applicantId: users.id,
      applicantName: users.name,
      applicantEmail: users.email,
      applicantPhone: users.phone,
      accountCreatedAt: users.created_at,
    })
    .from(kycApplications)
    .innerJoin(users, eq(kycApplications.userId, users.id))
    .where(eq(kycApplications.status, "PENDING"));
};

interface UpdateKycDTO {
  kycId: string;
  status: "APPROVED" | "REJECTED";
  adminId: string;
  rejectionReason?: string;
}
export const updateKycStatus = async ({
  kycId,
  status,
  adminId,
  rejectionReason,
}: UpdateKycDTO) => {
  return await db.transaction(async (tx) => {
    // 1. Verification Guard: Fetch the existing application profile first
    const [application] = await tx
      .select()
      .from(kycApplications)
      .where(eq(kycApplications.id, kycId))
      .limit(1);

    if (!application)
      throw new ApiError(404, "Target KYC application record was not found.");

    if (application.status !== "PENDING")
      throw new ApiError(
        400,
        `Operation cancelled. This application has already been processed as: ${application.status}.`,
      );

    if (status === "APPROVED") {
      await tx
        .update(kycApplications)
        .set({
          status: "APPROVED",
          reviewedBy: adminId,
          reviewedAt: new Date(),
        })
        .where(eq(kycApplications.id, kycId));

      const [safeUser] = await tx
        .update(users)
        .set({
          proprietorStatus: "APPROVED",
          kycVerifiedAt: new Date(),
          roles: sql`array_append(${users.roles}, 'PROPRIETOR'::users_role)`,
          role_updated_at: new Date(),
          role_updated_by: adminId,
        })
        .where(eq(users.id, application.userId))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          roles: users.roles,
          phone: users.phone,
          avatar_url: users.avatar_url,
          proprietorStatus: users.proprietorStatus,
          kycVerifiedAt: users.kycVerifiedAt,
          kycSubmittedAt: users.kycSubmittedAt,
          role_updated_at: users.role_updated_at,
          is_banned: users.is_banned,
          created_at: users.created_at,
        });

      return { applicationStatus: "APPROVED", userProfile: safeUser };
    } else {
      // Validate that a reason string exists before allowing a rejection event
      if (!rejectionReason || rejectionReason.trim() === "") {
        throw new ApiError(
          400,
          "Action rejected: A descriptive rejection reason is required to dismiss applications.",
        );
      }

      await tx
        .update(kycApplications)
        .set({
          status: "REJECTED",
          reviewedBy: adminId,
          rejectionReason: rejectionReason.trim(),
          reviewedAt: new Date(),
        })
        .where(eq(kycApplications.id, kycId));

      const [safeUser] = await tx
        .update(users)
        .set({
          proprietorStatus: "REJECTED",
        })
        .where(eq(users.id, application.userId))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          roles: users.roles,
          phone: users.phone,
          avatar_url: users.avatar_url,
          proprietorStatus: users.proprietorStatus,
          kycVerifiedAt: users.kycVerifiedAt,
          kycSubmittedAt: users.kycSubmittedAt,
          role_updated_at: users.role_updated_at,
          is_banned: users.is_banned,
          created_at: users.created_at,
        });

      return { applicationStatus: "REJECTED", userProfile: safeUser };
    }
  });
};

export const getKycApplicationById = async (kycId: string) => {
  return await db
    .select({
      id: kycApplications.id,
      userId: kycApplications.userId,
      status: kycApplications.status,
    })
    .from(kycApplications)
    .where(eq(kycApplications.id, kycId))
    .limit(1)
    .then((rows) => rows[0] ?? null);
};
