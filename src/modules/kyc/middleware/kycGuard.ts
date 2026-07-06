import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { getProperietorStatus } from "../../proprietor/repository/proprietorStatus.js";

export const checkIsNotProprietor = async (
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

    if (realtimeUser.proprietorStatus !== "NONE" && realtimeUser.proprietorStatus !== "REJECTED")
      return next(
        new ApiError(
          403,
          `Access denied. You are unable to access this because your status is ${realtimeUser.proprietorStatus}.`,
        ),
      );

    next();
  } catch (error) {
    next(error);
  }
};
