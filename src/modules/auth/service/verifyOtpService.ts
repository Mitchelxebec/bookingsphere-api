import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  deleteOtp,
  getOtp,
  redis,
} from "../../../infrastructure/cache/redis.js";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";

export const verifyOtp = async (
  email: string,
  otp: string,
): Promise<string> => {
  const hashedOtp = await getOtp(email);
  if (!hashedOtp)
    throw new ApiError(
      400,
      "Verification code has expired or does not exist. Please request a new one.",
    );

  const isMatch = await bcrypt.compare(otp, hashedOtp);
  if (!isMatch) throw new ApiError(400, "Invalid verification code");

  await deleteOtp(email);

  const resetToken = crypto.randomBytes(32).toString("hex");

  const tokenKey = `password-reset:token:${resetToken}`;
  await redis.set(tokenKey, email, "EX", 600);

  return resetToken;
};
