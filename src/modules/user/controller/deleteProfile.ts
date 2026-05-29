import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { removeMyAccount } from "../service/removeAccount.js";

export const deleteMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      throw new ApiError(401, "Unauthorized. Missing user credentials");

    await removeMyAccount(userId);

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};
