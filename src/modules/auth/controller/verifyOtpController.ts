import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { verifyOtp } from "../service/verifyOtpService.js";

export const verifyOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body || !req.body.email || !req.body.otp)
      throw new ApiError(400, "Missing required fields: email, and otp");

    const { email, otp } = req.body;

    const resetToken = await verifyOtp(email, otp);

    res.status(200).json({
      success: true,
      message: "One-Time Password verified successfully",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};
