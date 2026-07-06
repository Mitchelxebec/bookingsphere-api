import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { approveKycService } from "../../service/admin/adminApprove.js";

export const kycApproveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const kycId = req.params.id as string;
    if (!kycId) throw new ApiError(401, "Missing KYC id");

    const actorInfo = req.user;
    if (!actorInfo || !actorInfo.userId)
      throw new ApiError(
        401,
        "Unauthorized: Administrative session data missing.",
      );

    const result = await approveKycService({
      kycId,
      adminId: actorInfo.userId,
    });
    
    res.status(200).json({
      success: true,
      message:
        "KYC application has been approved successfully. The user is now a proprietor.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
