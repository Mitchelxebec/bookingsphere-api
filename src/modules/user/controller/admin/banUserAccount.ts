import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { banUserService } from "../../service/admin/banUserAccount.js";

export const banUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const targetUserId = req.params.id as string;
    if (!targetUserId) throw new ApiError(403, "Missing user ID");

    const { reason } = req.body;

    const actorRole = req.user;
    if (!actorRole || !actorRole.roles || !actorRole.userId)
      throw new ApiError(
        401,
        "Unauthorized: Administrative session data missing.",
      );

    const result = await banUserService({
      targetUserId,
      reason,
      actorRole: actorRole.roles,
      actorUserId: actorRole.userId,
    });

    res.status(200).json({
      success: true,
      message: "User successfully banned",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
