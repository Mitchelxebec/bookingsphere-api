import { ApiError } from "../../shared/utils/ApiError.js";
import {
  createKycApplications,
  getUserProfile,
} from "../repository/kycRepo.js";

interface SubmitKycDTO {
  userId: string;
  documentUrl: string;
}

export const submitKycService = async ({
  userId,
  documentUrl,
}: SubmitKycDTO) => {
  if (!documentUrl || documentUrl.trim() === "")
    throw new ApiError(
      400,
      "Bad Request: Identification document path link is required.",
    );

  const userProfile = await getUserProfile(userId);
  if (!userProfile) throw new ApiError(404, "User account not found.");

  if (
    userProfile.roles.includes("PROPRIETOR") ||
    userProfile.proprietorStatus === "APPROVED"
  )
    throw new ApiError(
      400,
      "Operation rejected: Your account is already approved as a proprietor.",
    );

  if (userProfile.proprietorStatus === "PENDING")
    throw new ApiError(
      409,
      "Conflict: You already have a KYC application pending administrative review.",
    );

  const newKycRecord = await createKycApplications(userId, documentUrl.trim());

  return newKycRecord;
};
