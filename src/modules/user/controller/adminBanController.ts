import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { banUserService } from "../service/adminBanUser.js";

export const banUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const targetUserId = req.params.id as string;
    if (!targetUserId) throw new ApiError(403, "Missing user ID");

    const reason = req.body;
    const actorUser = req.user;

    if (!actorUser || !actorUser.userId || !actorUser.roles) {
      throw new ApiError(
        401,
        "Unauthorized: Administrative session data missing.",
      );
    }

    const result = await banUserService({
      targetUserId,
      reason,
      actorUserId: actorUser.userId,
      actorRoles: actorUser.roles,
    });

    res.status(200).json({
      success: true,
      message: `User banned successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
