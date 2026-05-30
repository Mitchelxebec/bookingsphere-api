import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { TokenRotationRepository } from "../repository/repoTokenRotation.js";

export const logoutAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      throw new ApiError(401, "Unauthorized. User session data missing.");

    await TokenRotationRepository.revokeAllUserSessions(userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message:
        "Successfully logged out from all devices and active sessions revoked.",
    });
  } catch (error) {
    next(error);
  }
};
