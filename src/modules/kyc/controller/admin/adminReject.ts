import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { rejectKycService } from "../../service/admin/adminReject.js";

export const kycRejectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const kycId = req.params.id as string;
    if (!kycId) throw new ApiError(401, "Missing KYC id");

    const actorId = req.user;
    if (!actorId || !actorId.userId)
      throw new ApiError(
        401,
        "Unauthorized: Administrative session data missing.",
      );

    const { reason } = req.body;
    if (!reason) throw new ApiError(401, "Missing reason");

    const result = await rejectKycService({
      kycId,
      adminId: actorId.userId,
      reason,
    });

    res.status(200).json({
      success: true,
      message: `KYC application has been rejected because ${reason}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
