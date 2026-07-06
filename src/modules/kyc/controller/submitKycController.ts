import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { submitKycService } from "../service/submitKyc.js";

export const submitKycController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actorInfo = req.user;
    if (!actorInfo || !actorInfo.userId)
      throw new ApiError(
        401,
        "Unauthorized: Authentication verification failed.",
      );

    const {documentUrl} = req.body;
    if (!documentUrl) throw new ApiError(401, "Missing document URL");

    const kycRecord = await submitKycService({
      userId: actorInfo.userId,
      documentUrl,
    });

    res.status(201).json({
      success: true,
      message:
        "Your KYC application documents have been submitted and are under administrative review.",
      data: {
        applicationId: kycRecord!.id,
        status: kycRecord!.status,
        createdAt: kycRecord!.submittedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
