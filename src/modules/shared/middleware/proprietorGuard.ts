import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { getProperietorStatus } from "../../proprietor/repository/proprietorStatus.js";

export const verifyActiveProprietor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) return next(new ApiError(401, "Authentication required"));

    const realtimeUser = await getProperietorStatus(user.userId);
    if (!realtimeUser)
      return next(new ApiError(404, "User account no longer exists"));

    if (realtimeUser.proprietorStatus === "SUSPENDED")
      return next(
        new ApiError(
          403,
          `Access denied. Your proprietor account has been suspended. Reason: ${realtimeUser.banReason || "None specified"}`,
        ),
      );

    if (realtimeUser.proprietorStatus !== "APPROVED")
      return next(
        new ApiError(
          403,
          "Access denied. You must complete and be approved through KYC to access this resource.",
        ),
      );

      req.user!.proprietorStatus = realtimeUser.proprietorStatus
    next();
  } catch (error) {
    next(error);
  }
};
