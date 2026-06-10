import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { unbanUserService } from "../service/adminUnbanService.js";

export const unbanUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const targetUserId = req.params.id as string;
    if (!targetUserId) throw new ApiError(403, "Missing user ID");

    const actorUser = req.user;
    if (!actorUser || !actorUser.userId || !actorUser.roles)
      throw new ApiError(
        401,
        "Unauthorized: Administrative session data missing.",
      );

    const result = await unbanUserService({
      targetUserId,
      actorUserId: actorUser.userId,
      actorRoles: actorUser.roles,
    });

    res.status(200).json({
      success: true,
      message: "User has successfully been unbanned",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
