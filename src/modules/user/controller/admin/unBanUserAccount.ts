import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { unBanUserService } from "../../service/admin/unBanUserAccount.js";

export const unBanUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const targetUserId = req.params.id as string;
    if (!targetUserId) throw new ApiError(403, "Missing user ID");

    const actorRole = req.user;
    if (!actorRole || !actorRole.roles || !actorRole.userId)
      throw new ApiError(
        401,
        "Unauthorized: Administrative session data missing.",
      );

    const result = await unBanUserService({
      targetUserId,
      actorRole: actorRole.roles,
      actorUserId: actorRole.userId,
    });

    res.status(200).json({
      success: true,
      message: "User has been successfully unbanned",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
