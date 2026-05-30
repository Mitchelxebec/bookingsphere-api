import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { forgotPassword } from "../service/forgotPasswordService.js";

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.body || !req.body.email)
      throw new ApiError(400, "Missing required field: email");

    const { email } = req.body;

    const result = await forgotPassword(email)

    res.status(200).json({
        success: true,
        message: result.message
    })
  } catch (error) {
    next(error);
  }
};
