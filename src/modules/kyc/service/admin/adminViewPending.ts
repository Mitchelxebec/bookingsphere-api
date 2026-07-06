import { ApiError } from "../../../shared/utils/ApiError.js";
import { getPendingApplications } from "../../repository/admin/adminKycRepo.js";

export const viewPendingService = async () => {
  const pendingKyc = await getPendingApplications();
  if (!pendingKyc || pendingKyc.length === 0)
    throw new ApiError(404, "No pending KYC applications found for review.");
  return pendingKyc;
};
