import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { checkStatusService } from "../service/checkStatus.js";

export const checkStatusController = async (
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

    const kycState = await checkStatusService(actorInfo.userId);

    res.status(200).json({
      success: true,
      message: "KYC profile tracking data retrieved successfully.",
      data: kycState,
    });
  } catch (error) {
    next(error);
  }
};
