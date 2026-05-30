import crypto from "crypto";
import bcrypt from "bcrypt";
import { findUserByEmail } from "../../user/repository/userRepo.js";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { redis, saveOtp } from "../../../infrastructure/cache/redis.js";
import { sendOtpEmail } from "../../../infrastructure/utils/resend.js";

export const forgotPassword = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new ApiError(404, "User not found. Please sign up");

  const cooldownKey = `otp:cooldown${email}`;
  const isCooldownActive = await redis.exists(cooldownKey);
  if (isCooldownActive)
    throw new ApiError(429, "Too many requests. Please wait for 60 seconds");

  const rawOtpCode = crypto.randomInt(100000, 1000000).toString();

  const saltRounds = 10;
  const hashedOtpCode = await bcrypt.hash(rawOtpCode, saltRounds);

  await saveOtp(email, hashedOtpCode);

  await redis.set(cooldownKey, "true", "EX", 60);

  console.log(`[EMAIL SENDING SIMULATION] To: ${email} | Code: ${rawOtpCode}`);
  await sendOtpEmail(email, rawOtpCode);

  return {
    message: "Verification code transmitted successfully to your inbox.",
  };
};
