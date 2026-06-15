import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { changeUserRole } from "../../service/admin/changeRole.js";

export const changeUserRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const targetUserId = req.params.id as string;
    if (!targetUserId) throw new ApiError(403, "Missing user ID");

    const { role } = req.body;
    const actorInfo = req.user;
    
    if (!actorInfo || !actorInfo.userId || !actorInfo.roles) {
      throw new ApiError(
        401,
        "Unauthorized: Administrative session data missing.",
      );
    }

    const result = await changeUserRole({
      targetUserId,
      newRole: role,
      actorUserId: actorInfo?.userId,
      actorRole: actorInfo?.roles,
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
