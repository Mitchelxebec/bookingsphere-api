import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { resetPasswordService } from "../service/resetPasswordService.js";

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body || !req.body.resetToken || !req.body.password)
      throw new ApiError(
        400,
        "Missing required fields: reset token, and password",
      );

    const { resetToken, password } = req.body;

    const result = await resetPasswordService(resetToken, password);

    res.status(200).json({
        success: true,
        message: result.message
    })
  } catch (error) {
    next(error);
  }
};
