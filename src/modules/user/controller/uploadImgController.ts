import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { uploadService } from "../service/uploadImgService.js";

export const uploadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file)
      throw new ApiError(
        400,
        "No image file provided or file format is invalid",
      );

    const userId = req.user?.userId;
    if (!userId)
      throw new ApiError(401, "Unauthorized. Missing user credentials");

    const newAvatarUrl = await uploadService(userId, req.file.buffer);

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatarUrl: newAvatarUrl,
    });
  } catch (error) {
    next(error);
  }
};
