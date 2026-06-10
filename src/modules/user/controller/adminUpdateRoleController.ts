import type { NextFunction, Request, Response } from "express";
import { updateUserRole } from "../service/adminUpdateRole.js";
import { ApiError } from "../../shared/utils/ApiError.js";

export const updateRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const targetUserId = req.params.id as string;
    if (!targetUserId) throw new ApiError(403, "Missing user ID");

    const { newRole } = req.body;
    const actorUser = req.user;

    if (!actorUser || !actorUser.userId || !actorUser.roles) {
      throw new ApiError(
        401,
        "Unauthorized: Administrative session data missing.",
      );
    }

    const result = await updateUserRole({
      targetUserId,
      newRole,
      actorUserId: actorUser?.userId,
      actorRoles: actorUser?.roles,
    });

    return res.status(200).json({
      success: true,
      message: "User priviledge altered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
