import bcrypt from "bcrypt";
import { redis } from "../../../infrastructure/cache/redis.js";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { PasswordService } from "../utils/hash.js";
import { updatePasswordByEmail } from "../repository/repoLogin.js";

export const resetPasswordService = async (
  resetToken: string,
  newPlainPassword: string,
) => {
  const tokenKey = `password-reset:token:${resetToken}`;

  const userEmail = await redis.get(tokenKey);
  if (!userEmail)
    throw new ApiError(400, "Password reset token is invalid or has expired");

  const hashedNewPassword = await PasswordService.hash(newPlainPassword);

  const isUpdated = await updatePasswordByEmail(userEmail, hashedNewPassword);
  if (!isUpdated)
    throw new ApiError(500, "Failed to update your account password settings.");

  await redis.del(tokenKey);

  return {
    success: true,
    message: "Your password has been changed successfully. Proceed to login.",
  };
};
