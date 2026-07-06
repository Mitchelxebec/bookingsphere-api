import { getKycByUserId } from "../repository/kycRepo.js";

export const checkStatusService = async (userId: string) => {
  const userKyc = await getKycByUserId(userId);
  if (!userKyc) {
    return {
      hasApplied: false,
      status: "NONE",
      rejectionReason: null,
      submittedAt: null,
    };
  }

  const kycStatus = userKyc.status;
  if (kycStatus === "REJECTED") {
    return {
      hasApplied: true,
      status: "REJECTED",
      rejectionReason:
        userKyc.rejectionReason || "No explanation provided by administration.",
      submittedAt: userKyc.submittedAt,
    };
  }

  return {
    hasApplied: true,
    status: userKyc.status, // "PENDING" or "APPROVED"
    rejectionReason: null,
    submittedAt: userKyc.submittedAt,
  };
};
