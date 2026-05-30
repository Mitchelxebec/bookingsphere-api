import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { myAccount } from "../service/userProfile.js";

export const myAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      throw new ApiError(401, "Unauthorized. Missing user credentials");

    const user = await myAccount(userId);

    return res.status(200).json({
      success: true,
      userInfo: user,
    });
  } catch (error) {
    next(error);
  }
};
