import { ApiError } from "../../../shared/utils/ApiError.js";
import {
  getKycApplicationById,
  updateKycStatus,
} from "../../repository/admin/adminKycRepo.js";

interface ApproveKycDTO {
  kycId: string;
  adminId: string;
}
export const approveKycService = async ({ kycId, adminId }: ApproveKycDTO) => {
  const application = await getKycApplicationById(kycId);
  if (!application)
    throw new ApiError(404, "Target KYC application record was not found.");

  if (application.userId === adminId)
    throw new ApiError(
      403,
      "Access Denied: Conflict of Interest. Administrators are strictly forbidden from reviewing or approving their own KYC applications.",
    );

  if (application.status !== "PENDING")
    throw new ApiError(
      400,
      `Operation rejected: This application has already been closed with status: ${application.status}.`,
    );

  const approvedKyc = await updateKycStatus({
    kycId,
    adminId,
    status: "APPROVED",
  });
  
  return approvedKyc;
};
