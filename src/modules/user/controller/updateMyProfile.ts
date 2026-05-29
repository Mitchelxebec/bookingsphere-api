import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { updateMyAccount } from "../service/updateUserProfile.js";

export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body) {
      throw new ApiError(400, "Missing required fields: name, email, or phone");
    }

    const userId = req.user?.userId;
    if (!userId)
      throw new ApiError(401, "Unauthorized. Missing user credentials");

    const user = await updateMyAccount(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      data: user,
    });
  } catch (error) {
    next(error);
  }
};
